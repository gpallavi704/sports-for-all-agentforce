import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { IntegrationError } from './agent-api.mjs';

export const ORG_URL = 'https://orgfarm-4d89d5ac56.my.salesforce.com';
const HELPER = fileURLToPath(new URL('../dist/sport-compass-keychain', import.meta.url));
const runFile = promisify(execFile);
const fail = code => new IntegrationError(code);
const validCredential = value => typeof value === 'string' && value.length > 0 && value.length <= 4096 && !/\s|[\x00-\x1f\x7f]/.test(value);

// Fixed helper and Keychain item: never accept a path, account or org from a tool.
export function createKeychainReader({ enabled = false, platform = process.platform, run = runFile } = {}) {
  return async ({ signal } = {}) => {
    if (!enabled) throw fail('CREDENTIAL_ACCESS_DISABLED');
    if (platform !== 'darwin') throw fail('KEYCHAIN_MACOS_REQUIRED');
    try {
      const { stdout } = await run(HELPER, ['read'], {
        encoding: 'utf8', timeout: 15000, maxBuffer: 16384, signal,
        env: { PATH: '/usr/bin:/bin' },
      });
      const value = JSON.parse(stdout);
      if (!validCredential(value.clientId) || !validCredential(value.clientSecret)) throw Error();
      return { clientId: value.clientId, clientSecret: value.clientSecret };
    } catch {
      // execFile errors contain stdout/stderr: never propagate them or their cause.
      throw fail('KEYCHAIN_UNAVAILABLE');
    }
  };
}

// Client credentials are Salesforce outbound auth, NOT ChatGPT/MCP inbound auth.
export function createSalesforceTokenProvider({
  enabled = false, readCredentials, fetchImpl = fetch, now = Date.now, timeoutMs = 15000,
} = {}) {
  if (typeof readCredentials !== 'function') throw fail('CREDENTIAL_PROVIDER_REQUIRED');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw fail('INVALID_AUTH_TIMEOUT');
  let cached; let pending;
  async function mint(signal) {
    const credentials = await readCredentials({ signal });
    signal.throwIfAborted();
    if (!validCredential(credentials?.clientId) || !validCredential(credentials?.clientSecret)) throw Error();
    const response = await fetchImpl(`${ORG_URL}/services/oauth2/token`, {
      method: 'POST', redirect: 'error', signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: credentials.clientId, client_secret: credentials.clientSecret }).toString(),
    });
    if (!response.ok) { await response.body?.cancel(); throw Error(); }
    const reader = response.body?.getReader();
    if (!reader) throw Error();
    const chunks = []; let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 32768) { await reader.cancel(); throw Error(); }
      chunks.push(value);
    }
    signal.throwIfAborted();
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (data.token_type?.toLowerCase() !== 'bearer' || typeof data.access_token !== 'string' || data.access_token.length > 16384 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(data.access_token)) throw Error();
    if (data.instance_url !== undefined && data.instance_url !== ORG_URL) throw Error();
    // Parsing exp is only a conservative cache hint, NOT signature validation.
    // Tokens originate from the fixed Salesforce HTTPS endpoint, never callers.
    const claims = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64url').toString('utf8'));
    if (!Number.isSafeInteger(claims.exp)) throw Error();
    const issuedAt = now();
    let expiresAt = Math.min(claims.exp * 1000, issuedAt + 900000);
    if (data.expires_in !== undefined) {
      if (!Number.isFinite(data.expires_in) || data.expires_in <= 0) throw Error();
      expiresAt = Math.min(expiresAt, issuedAt + data.expires_in * 1000);
    }
    expiresAt -= 60000;
    if (expiresAt <= now()) throw Error();
    cached = { token: data.access_token, expiresAt };
    return cached.token;
  }
  return async function getAccessToken() {
    if (!enabled) throw fail('TOKEN_AUTH_DISABLED');
    if (cached && now() < cached.expiresAt) return cached.token;
    if (pending) return pending;
    cached = undefined;
    const controller = new AbortController();
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(fail('TOKEN_ACQUISITION_FAILED')); }, timeoutMs);
    });
    pending = Promise.race([mint(controller.signal), timeout])
      .catch(() => { throw fail('TOKEN_ACQUISITION_FAILED'); })
      .finally(() => { clearTimeout(timer); controller.abort(); pending = undefined; });
    return pending;
  };
}
