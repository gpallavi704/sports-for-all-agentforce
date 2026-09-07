import { ORG_URL, createSalesforceTokenProvider } from './salesforce-auth.mjs';

const EXPECTED_USER = '005gL00000NfH7h';
const EXPECTED_ORG = '00DgL00000c7pj3';
const SAFE_CODES = new Set(['INVALID_TYPE', 'INSUFFICIENT_ACCESS', 'INSUFFICIENT_ACCESS_OR_READONLY', 'INVALID_SESSION_ID', 'API_DISABLED_FOR_ORG', 'invalid_client', 'invalid_grant', 'invalid_scope', 'invalid_request', 'unsupported_grant_type', 'inactive_user', 'invalid_client_id']);
async function boundedJson(response) {
  const reader = response.body?.getReader();
  if (!reader) throw Error();
  const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 65536) { await reader.cancel(); throw Error(); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
const safeCode = data => {
  const code = Array.isArray(data) ? data[0]?.errorCode : data?.error;
  return SAFE_CODES.has(code) ? code : 'UNCLASSIFIED';
};

// No caller-selected URLs, SOQL, writes or secrets in returned diagnostics.
export async function runAuthDiagnostic({ readCredentials, fetchImpl = fetch, now = Date.now }) {
  let token; let stage = 'token';
  const report = { tokenAcquired: false, identityVerified: false, crm: [], tokenRevoked: false, passed: false };
  const getToken = createSalesforceTokenProvider({ enabled: true, readCredentials, now,
    fetchImpl: async (url, options) => {
      const response = await fetchImpl(url, options);
      const data = await boundedJson(response);
      report.tokenHttpStatus = response.status;
      if (!response.ok) report.tokenError = safeCode(data);
      // Retain a minted token solely to revoke it even if provider validation fails.
      if (typeof data.access_token === 'string' && data.access_token.length <= 16384 && !/\s/.test(data.access_token)) token = data.access_token;
      return new Response(JSON.stringify(data), { status: response.status });
    },
  });
  async function get(path) {
    const response = await fetchImpl(ORG_URL + path, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return { ok: response.ok, status: response.status, data: await boundedJson(response) };
  }
  try {
    token = await getToken(); report.tokenAcquired = true;
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    report.remainingLifetimeSeconds = Math.max(0, Math.floor(claims.exp - now() / 1000));
    stage = 'identity';
    const identity = await get(`/id/${EXPECTED_ORG}/${EXPECTED_USER}`);
    report.identityHttpStatus = identity.status;
    report.identityVerified = identity.ok && String(identity.data.user_id).slice(0, 15) === EXPECTED_USER && String(identity.data.organization_id).slice(0, 15) === EXPECTED_ORG;
    if (!report.identityVerified) report.identityError = safeCode(identity.data);
    stage = 'crm-read-checks';
    for (const object of ['Account', 'Contact', 'Case']) {
      const query = await get(`/services/data/v67.0/query?q=${encodeURIComponent(`SELECT Id FROM ${object} LIMIT 1`)}`);
      const code = query.ok ? 'QUERY_ALLOWED' : safeCode(query.data);
      // 401, transport failure, or empty result is NOT evidence of denied object access.
      const readDenied = [400, 403].includes(query.status) && ['INVALID_TYPE', 'INSUFFICIENT_ACCESS', 'INSUFFICIENT_ACCESS_OR_READONLY'].includes(code);
      report.crm.push({ object, httpStatus: query.status, code, readDenied });
      // Do not retain or return record identifiers if a query unexpectedly succeeds.
    }
    report.passed = report.identityVerified && report.crm.every(check => check.readDenied) && report.remainingLifetimeSeconds <= 900;
  } catch {
    report.failureStage = stage; // No raw errors, bodies, identifiers or secrets.
  } finally {
    if (token) {
      try {
        const response = await fetchImpl(`${ORG_URL}/services/oauth2/revoke`, {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token }).toString(),
        });
        report.tokenRevoked = response.ok;
        await response.body?.cancel();
      } catch { report.tokenRevoked = false; }
      token = undefined;
    }
  }
  report.passed = report.passed && report.tokenRevoked;
  return report;
}
