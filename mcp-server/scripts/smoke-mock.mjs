import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'sport-compass-local-smoke', version: '0.1.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [fileURLToPath(new URL('../src/stdio.mjs', import.meta.url)), '--mock'], stderr: 'pipe' });
transport.stderr.on('data', () => {});
try {
  await client.connect(transport);
  const listed = await client.listTools();
  assert.deepEqual(listed.tools.map(t => t.name).sort(), ['ask_sport_compass', 'end_sport_compass', 'start_sport_compass']);
  const start = await client.callTool({ name: 'start_sport_compass', arguments: {} });
  assert.equal(start.structuredContent.mock, true);
  const conversationHandle = start.structuredContent.conversationHandle;
  const answer = await client.callTool({ name: 'ask_sport_compass', arguments: { conversationHandle, message: 'Synthetic local connection test only.' } });
  assert.match(answer.structuredContent.messages[0].text, /Salesforce was not contacted/);
  const ended = await client.callTool({ name: 'end_sport_compass', arguments: { conversationHandle } });
  assert.equal(ended.structuredContent.ended, true);
  console.log(JSON.stringify({ passed: true, transport: 'stdio', server: client.getServerVersion(), toolCount: listed.tools.length, startAskEnd: true, mockOnly: true, salesforceConnected: false }, null, 2));
} finally { await client.close(); }
