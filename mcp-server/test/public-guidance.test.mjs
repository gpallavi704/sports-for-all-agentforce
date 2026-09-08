import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createPublicGuidanceServer } from '../src/mcp-guidance.mjs';
import { SessionBroker } from '../src/session-broker.mjs';

test('public Salesforce agent binds only read-only public actions', () => {
  const source = readFileSync(new URL('../../force-app/main/default/aiAuthoringBundles/SportCompassGuide/SportCompassGuide.agent', import.meta.url), 'utf8');
  assert.deepEqual([...source.matchAll(/target: "([^"]+)"/g)].map(m => m[1]).sort(), ['apex://FindNearbyFencingClubsAction', 'standardInvocableAction://streamKnowledgeSearch']);
  assert.doesNotMatch(source, /CreateSportsSupport|PrepareSportsSupport|ReviewSportsSupport|MatchSportsPrograms|Support_Request|Find_My_Sport|\u2014/);
  assert.match(source, /ARFPC_1JDgL000009Fm7BWAS/);
});
test('public citations preserve sentence punctuation and canonical root slashes only', async () => {
  const broker = new SessionBroker({
    publicUrls: ['https://member.usafencing.org/clubs', 'https://www.wasatchfencing.com/'],
    client: { start: async () => randomUUID(), send: async () => ({ messages: [{ type: 'Inform', message: 'See https://member.usafencing.org/clubs. Club https://www.wasatchfencing.com. Block https://www.wasatchfencing.com/?secret=123 and https://evil.example.' }] }), end: async () => {} }
  });
  const { conversationHandle } = await broker.start('test');
  const result = await broker.send('test', conversationHandle, 'public lookup');
  assert.match(result.messages[0].text, /https:\/\/member.usafencing.org\/clubs\./);
  assert.match(result.messages[0].text, /https:\/\/www.wasatchfencing.com\/\./);
  assert.doesNotMatch(result.messages[0].text, /secret|evil/);
  await broker.end('test', conversationHandle);
});
test('anonymous public protocol has no OAuth claim, business writes or raw selectors', async t => {
  const events = [];
  const app = createPublicGuidanceServer({
    publicUrls: ['https://www.usafencing.org/try'],
    client: {
      start: async () => { events.push('start'); return randomUUID(); },
      send: async () => { events.push('send'); return { messages: [{ type: 'Inform', message: 'Public fixture https://www.usafencing.org/try' }] }; },
      end: async () => { events.push('end'); }
    }
  });
  const client = new Client({ name: 'public-test', version: '1' });
  const [left, right] = InMemoryTransport.createLinkedPair();
  await app.server.connect(right); await client.connect(left);
  t.after(async () => { await app.close(); await client.close(); });
  const { tools } = await client.listTools();
  assert.equal(tools.length, 3);
  assert.ok(tools.every(tool => tool._meta.securitySchemes[0].type === 'noauth'));
  assert.ok(tools.every(tool => tool.inputSchema.additionalProperties === false));
  assert.equal((await client.callTool({ name: 'create_case', arguments: {} })).isError, true);
  assert.equal((await client.callTool({ name: 'start_sport_compass', arguments: { agentId: 'other' } })).isError, true);
  const { conversationHandle } = (await client.callTool({ name: 'start_sport_compass', arguments: {} })).structuredContent;
  assert.equal((await client.callTool({ name: 'ask_sport_compass', arguments: { conversationHandle: randomUUID(), message: 'hello' } })).isError, true);
  const answer = await client.callTool({ name: 'ask_sport_compass', arguments: { conversationHandle, message: 'hello' } });
  assert.equal(answer.structuredContent.mock, false);
  await client.callTool({ name: 'end_sport_compass', arguments: { conversationHandle } });
  assert.deepEqual(events, ['start', 'send', 'end']);
});
