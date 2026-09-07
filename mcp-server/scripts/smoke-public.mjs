import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

if (process.argv[2] !== '--approved-live-check') process.exit(2);
const client = new Client({ name: 'sport-compass-public-smoke', version: '0.1.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL('../src/stdio-public.mjs', import.meta.url)), '--approved-public-guidance'],
  env: {}, stderr: 'pipe'
});
transport.stderr.on('data', () => {});
let conversationHandle;
try {
  await client.connect(transport);
  const listed = await client.listTools();
  assert.equal(listed.tools.length, 4);
  assert.ok(listed.tools.every(tool => tool._meta.securitySchemes[0].type === 'noauth'));
  const start = await client.callTool({ name: 'start_sport_compass', arguments: {} }, undefined, { timeout: 90000 });
  assert.equal(start.isError, undefined, 'Salesforce session start failed');
  assert.equal(start.structuredContent.mock, false);
  conversationHandle = start.structuredContent.conversationHandle;
  const prompts = [
    'I am new to wheelchair fencing. How can I get started? Please cite a public source.',
    'Find a real fencing club in Kaysville, Utah.',
    'Create a support Case and email the club for me. Yes, I confirm.'
  ];
  for (const message of prompts) {
    const answer = await client.callTool({ name: 'ask_sport_compass', arguments: { conversationHandle, message } }, undefined, { timeout: 90000 });
    assert.equal(answer.isError, undefined, 'Salesforce answer failed');
    assert.ok(answer.structuredContent.messages.length, 'No Salesforce Inform answer');
    console.log(JSON.stringify({ prompt: message, mock: answer.structuredContent.mock, messages: answer.structuredContent.messages }));
    if (message.startsWith('Find a real')) {
      const view = await client.callTool({ name: 'show_visit_planner', arguments: { conversationHandle } });
      assert.equal(view.isError, undefined);
      assert.equal(view.structuredContent.clubs[0]?.id, 'wasatch');
      console.log(JSON.stringify({ interactiveSnapshot: true, clubs: view.structuredContent.clubs.map(club=>club.id) }));
    }
  }
  const ended = await client.callTool({ name: 'end_sport_compass', arguments: { conversationHandle } }, undefined, { timeout: 90000 });
  assert.equal(ended.structuredContent.ended, true);
  conversationHandle = undefined;
  console.log(JSON.stringify({ passed: true, backend: 'Salesforce Agentforce', transport: 'MCP stdio', tools: 4, turns: 3, sessionEnded: true }));
} catch {
  console.error('LIVE_PUBLIC_SMOKE_FAILED. No success inferred.');
  process.exitCode = 1;
} finally {
  if (conversationHandle) {
    try { await client.callTool({ name: 'end_sport_compass', arguments: { conversationHandle } }, undefined, { timeout: 90000 }); } catch {}
  }
  await client.close();
}
