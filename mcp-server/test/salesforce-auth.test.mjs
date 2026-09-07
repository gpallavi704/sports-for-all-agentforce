import test from 'node:test';
import assert from 'node:assert/strict';
import { createKeychainReader, createSalesforceTokenProvider, ORG_URL } from '../src/salesforce-auth.mjs';
import { AgentApiClient, EXTERNAL_PREFIX } from '../src/agent-api.mjs';
const clock = 1800000000000;
const credentials = { clientId: 'mock-id', clientSecret: 'mock-secret' };
const jwt = exp => `eyJhbGciOiJSUzI1NiJ9.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.mock_signature`;
const token = jwt(clock / 1000 + 900);
const result = (overrides = {}) => new Response(JSON.stringify({ access_token: token, token_type: 'Bearer', instance_url: ORG_URL, ...overrides }));
const options = overrides => ({ enabled: true, now: () => clock, readCredentials: async () => credentials, fetchImpl: async () => result(), ...overrides });

test('auth and Keychain default to disabled without touching dependencies', async () => {
  let touched = false;
  await assert.rejects(createSalesforceTokenProvider(options({ enabled: false, readCredentials: async () => { touched = true; } }))(), /TOKEN_AUTH_DISABLED/);
  await assert.rejects(createKeychainReader({ run: async () => { touched = true; } })(), /CREDENTIAL_ACCESS_DISABLED/);
  assert.equal(touched, false);
});
test('Keychain uses fixed helper, safe argv, bounded subprocess and sanitized failure', async () => {
  const read = createKeychainReader({ enabled: true, platform: 'darwin', run: async (file, args, opts) => {
    assert.ok(file.endsWith('/dist/sport-compass-keychain'));
    assert.deepEqual(args, ['read']); assert.equal(opts.maxBuffer, 16384); assert.equal(opts.timeout, 15000);
    return { stdout: JSON.stringify(credentials) };
  } });
  assert.deepEqual(await read(), credentials);
  const bad = createKeychainReader({ enabled: true, platform: 'darwin', run: async () => { throw Object.assign(Error('mock-secret'), { stdout: 'mock-secret' }); } });
  await assert.rejects(bad(), error => error.message === 'KEYCHAIN_UNAVAILABLE' && !error.cause && !error.stdout);
  await assert.rejects(createKeychainReader({ enabled: true, platform: 'linux' })(), /KEYCHAIN_MACOS_REQUIRED/);
});
test('Keychain rejects malformed or invalid credential data', async () => {
  for (const stdout of ['not-json', '{}', JSON.stringify({ ...credentials, clientSecret: 'with\nnewline' })]) {
    await assert.rejects(createKeychainReader({ enabled: true, platform: 'darwin', run: async () => ({ stdout }) })(), /KEYCHAIN_UNAVAILABLE/);
  }
});
test('token request fixed origin, no redirects, form body, cache and single-flight', async () => {
  let count = 0;
  const get = createSalesforceTokenProvider(options({ fetchImpl: async (url, init) => {
    count++;
    assert.equal(url, `${ORG_URL}/services/oauth2/token`);
    assert.equal(init.method, 'POST'); assert.equal(init.redirect, 'error'); assert.ok(init.signal);
    assert.deepEqual(Object.fromEntries(new URLSearchParams(init.body)), { grant_type: 'client_credentials', client_id: 'mock-id', client_secret: 'mock-secret' });
    return result();
  } }));
  assert.deepEqual(await Promise.all([get(), get(), get()]), [token, token, token]);
  assert.equal(await get(), token); assert.equal(count, 1);
});
test('cache expires early and uses shorter expires_in', async () => {
  let time = clock; let count = 0;
  const get = createSalesforceTokenProvider(options({ now: () => time, fetchImpl: async () => { count++; return result({ expires_in: 120 }); } }));
  await get(); time += 59000; await get(); assert.equal(count, 1);
  time += 1000; await get(); assert.equal(count, 2);
});
test('invalid tokens, wrong org, expired tokens and bad TTL fail closed', async () => {
  for (const data of [{ access_token: 'opaque' }, { token_type: 'Basic' }, { instance_url: 'https://other.my.salesforce.com' }, { access_token: jwt(clock / 1000) }, { expires_in: -1 }, { access_token: 'a.e30.c' }]) {
    await assert.rejects(createSalesforceTokenProvider(options({ fetchImpl: async () => result(data) }))(), /TOKEN_ACQUISITION_FAILED/);
  }
});
test('upstream errors and credential errors never escape or retry automatically', async () => {
  let calls = 0;
  const get = createSalesforceTokenProvider(options({ fetchImpl: async () => { calls++; return new Response('mock-secret', { status: 401 }); } }));
  await assert.rejects(get(), error => error.message === 'TOKEN_ACQUISITION_FAILED' && !error.cause);
  assert.equal(calls, 1);
  await assert.rejects(createSalesforceTokenProvider(options({ readCredentials: async () => { throw Error('mock-secret'); } }))(), /TOKEN_ACQUISITION_FAILED/);
});
test('response size is bounded', async () => {
  await assert.rejects(createSalesforceTokenProvider(options({ fetchImpl: async () => new Response('x'.repeat(32769)) }))(), /TOKEN_ACQUISITION_FAILED/);
});
test('whole-operation timeout covers credential acquisition and prevents late fetch', async () => {
  let release; let fetched = false;
  const get = createSalesforceTokenProvider(options({ timeoutMs: 15, readCredentials: () => new Promise(resolve => { release = resolve; }), fetchImpl: async () => { fetched = true; return result(); } }));
  await assert.rejects(get(), /TOKEN_ACQUISITION_FAILED/);
  release(credentials); await new Promise(resolve => setImmediate(resolve));
  assert.equal(fetched, false);
});
test('timeout covers hung response and failed acquisition can be explicitly retried', async () => {
  let calls = 0;
  const get = createSalesforceTokenProvider(options({ timeoutMs: 15, fetchImpl: async () => {
    calls++;
    if (calls === 1) return new Promise(() => {});
    return result();
  } }));
  await assert.rejects(get(), /TOKEN_ACQUISITION_FAILED/);
  assert.equal(await get(), token); assert.equal(calls, 2);
});
test('invalid config and credential shapes fail without sending requests', async () => {
  assert.throws(() => createSalesforceTokenProvider({}), /CREDENTIAL_PROVIDER_REQUIRED/);
  assert.throws(() => createSalesforceTokenProvider(options({ timeoutMs: 0 })), /INVALID_AUTH_TIMEOUT/);
  let fetched = false;
  await assert.rejects(createSalesforceTokenProvider(options({ readCredentials: async () => ({ ...credentials, clientSecret: '' }), fetchImpl: async () => { fetched = true; } }))(), /TOKEN_ACQUISITION_FAILED/);
  assert.equal(fetched, false);
});
test('credential provider composes with Agent API start/send/end using mocks only', async () => {
  let tokens = 0; const calls = [];
  const getAccessToken = createSalesforceTokenProvider(options({ fetchImpl: async () => { tokens++; return result(); } }));
  const sessionId = '11111111-2222-4333-8444-555555555555';
  const client = new AgentApiClient({ orgUrl: ORG_URL, agentId: '0XxHr000000vJLEKA2', liveEnabled: true, getAccessToken, fetchImpl: async (_, init) => {
    assert.equal(init.headers.Authorization, `Bearer ${token}`);
    calls.push(init);
    return new Response(JSON.stringify({ sessionId, messages: [] }));
  } });
  const id = await client.start(); await client.send(id, 1, 'yes'); await client.end(id);
  assert.equal(tokens, 1); assert.equal(calls.length, 3);
  assert.equal(JSON.parse(calls[1].body).message.text, EXTERNAL_PREFIX + 'yes');
});
test('timeout also bounds a stalled response body', async () => {
  const body = new ReadableStream({ start() {} });
  await assert.rejects(createSalesforceTokenProvider(options({ timeoutMs: 15, fetchImpl: async () => new Response(body) }))(), /TOKEN_ACQUISITION_FAILED/);
});
