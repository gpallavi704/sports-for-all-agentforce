import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createGuidanceServer } from '../src/mcp-guidance.mjs';

const url = 'https://www.usafencing.org/try';
async function fixture(t, options = {}) {
  const calls = [];
  let principal = 'test-issuer:test-user-a';
  const app = createGuidanceServer({
    client: {
      start: async () => { calls.push('start'); return randomUUID(); },
      send: async () => { calls.push('send'); return { messages: [{ type: 'Inform', message: `Test fixture guidance. ${url}` }] }; },
      end: async () => { calls.push('end'); }
    },
    publicUrls: [url], authorize: async () => principal, ...options
  });
  const client = new Client({ name: 'guidance-protocol-test', version: '1.0.0' });
  const [left, right] = InMemoryTransport.createLinkedPair();
  await app.server.connect(right); await client.connect(left);
  t.after(async () => { await app.close(); await client.close(); });
  return { app, client, calls, as: value => { principal = value; } };
}
const call = (client, name, args = {}) => client.callTool({ name, arguments: args });

test('guidance factory requires an explicit trusted authorization adapter', () => {
  assert.throws(() => createGuidanceServer(), /GUIDANCE_DEPENDENCIES_REQUIRED/);
  assert.throws(() => createGuidanceServer({ client: { start() {}, send() {}, end() {} }, publicUrls: [] }), /GUIDANCE_DEPENDENCIES_REQUIRED/);
});
test('guidance exposes exactly three strict OAuth tools, no writes or raw API selectors', async t => {
  const { client } = await fixture(t);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(tool => tool.name).sort(), ['ask_sport_compass', 'end_sport_compass', 'start_sport_compass']);
  assert.ok(tools.every(tool => tool.inputSchema.additionalProperties === false && tool.outputSchema && tool._meta.securitySchemes[0].type === 'oauth2'));
  assert.equal((await call(client, 'confirm_support', { consent: true })).isError, true);
  assert.equal((await call(client, 'start_sport_compass', { principal: 'admin' })).isError, true);
});
test('guidance start ask follow-up end preserves handle and filters output', async t => {
  const { client, calls } = await fixture(t);
  const start = (await call(client, 'start_sport_compass')).structuredContent;
  assert.equal(start.mock, false);
  const { conversationHandle } = start;
  for (const message of ['How do I start?', 'What should I ask about equipment?']) {
    const answer = (await call(client, 'ask_sport_compass', { conversationHandle, message })).structuredContent;
    assert.equal(answer.mode, 'non-confirming-guidance');
    assert.match(answer.messages[0].text, /usafencing/);
  }
  assert.equal((await call(client, 'end_sport_compass', { conversationHandle })).structuredContent.ended, true);
  assert.deepEqual(calls, ['start', 'send', 'send', 'end']);
  assert.equal((await call(client, 'ask_sport_compass', { conversationHandle, message: 'again' })).isError, true);
});
test('guidance denies missing identity before any upstream call and sanitizes auth errors', async t => {
  const { client, calls } = await fixture(t, { authorize: async () => { throw Error('FAKE_TOKEN_MUST_NOT_ESCAPE'); } });
  const response = await call(client, 'start_sport_compass');
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /AUTHENTICATION_REQUIRED/);
  assert.doesNotMatch(JSON.stringify(response), /FAKE_TOKEN/);
  assert.deepEqual(calls, []);
});
test('guidance authorizes every call and denies cross-principal session handles', async t => {
  const { client, calls, as } = await fixture(t);
  const { conversationHandle } = (await call(client, 'start_sport_compass')).structuredContent;
  as('test-issuer:test-user-b');
  for (const [name, args] of [['ask_sport_compass', { conversationHandle, message: 'read another user' }], ['end_sport_compass', { conversationHandle }]]) {
    const result = await call(client, name, args);
    assert.match(result.content[0].text, /CONVERSATION_NOT_FOUND/);
  }
  as(null);
  assert.match((await call(client, 'ask_sport_compass', { conversationHandle, message: 'hi' })).content[0].text, /AUTHENTICATION_REQUIRED/);
  assert.deepEqual(calls, ['start']);
  as('test-issuer:test-user-a');
  assert.equal((await call(client, 'end_sport_compass', { conversationHandle })).structuredContent.ended, true);
});
test('guidance rejects extra arguments and oversized input without sending it upstream', async t => {
  const { client, calls } = await fixture(t);
  const { conversationHandle } = (await call(client, 'start_sport_compass')).structuredContent;
  for (const args of [{ conversationHandle, message: 'hi', consent: true }, { conversationHandle, message: 'x'.repeat(4001) }, { conversationHandle: 'raw-salesforce-session', message: 'hi' }]) {
    assert.equal((await call(client, 'ask_sport_compass', args)).isError, true);
  }
  assert.deepEqual(calls, ['start']);
});
test('guidance shutdown closes remaining sessions exactly once', async t => {
  const { client, app, calls } = await fixture(t);
  await call(client, 'start_sport_compass');
  await Promise.all([app.close(), app.close()]);
  assert.deepEqual(calls, ['start', 'end']);
});
