import test from 'node:test';
import assert from 'node:assert/strict';
import { runAuthDiagnostic } from '../src/auth-diagnostic.mjs';
const now = 1800000000000;
const token = `e30.${Buffer.from(JSON.stringify({ exp: now / 1000 + 900 })).toString('base64url')}.secret`;
function fixture({ identity = true, queryAllowed = false, rejected = false } = {}) {
  const calls = [];
  return { calls, options: { now: () => now, readCredentials: async () => ({ clientId: 'fake', clientSecret: 'secret' }), fetchImpl: async (url, init) => {
    calls.push([url, init.method]);
    if (url.endsWith('/token')) return new Response(JSON.stringify(rejected ? { error: 'invalid_client', error_description: 'SECRET' } : { token_type: 'Bearer', access_token: token }), { status: rejected ? 400 : 200 });
    if (url.includes('/id/')) return new Response(JSON.stringify({ user_id: identity ? '005gL00000NfH7hQAF' : 'wrong', organization_id: '00DgL00000c7pj3UAA' }));
    if (url.includes('/query?')) return new Response(JSON.stringify(queryAllowed ? { records: [{ Id: 'PRIVATE_RECORD' }] } : [{ errorCode: 'INVALID_TYPE', message: 'SECRET' }]), { status: queryAllowed ? 200 : 400 });
    if (url.endsWith('/revoke')) return new Response(null, { status: 200 });
    throw Error('unexpected request');
  } } };
}
test('auth diagnostic verifies fixed identity and read denials, revokes without leaking', async () => {
  const f = fixture(); const report = await runAuthDiagnostic(f.options);
  assert.equal(report.passed, true); assert.equal(report.tokenRevoked, true);
  assert.equal(report.crm.length, 3); assert.equal(f.calls.length, 6);
  assert.ok(!JSON.stringify(report).includes('secret'));
});
test('unexpected read access or identity fails and still revokes', async () => {
  for (const input of [{ queryAllowed: true }, { identity: false }]) {
    const report = await runAuthDiagnostic(fixture(input).options);
    assert.equal(report.passed, false); assert.equal(report.tokenRevoked, true);
    assert.ok(!JSON.stringify(report).includes('PRIVATE_RECORD'));
  }
});
test('token rejection only returns allowlisted diagnostic code', async () => {
  const f = fixture({ rejected: true }); const report = await runAuthDiagnostic(f.options);
  assert.equal(report.tokenError, 'invalid_client'); assert.equal(report.passed, false);
  assert.ok(!JSON.stringify(report).includes('SECRET')); assert.equal(f.calls.length, 1);
});
