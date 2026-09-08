import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { createPublicGuidanceServer } from './mcp-guidance.mjs';
import { AgentApiClient } from './agent-api.mjs';
import { createKeychainReader, createSalesforceTokenProvider, ORG_URL } from './salesforce-auth.mjs';
import { PUBLIC_AGENT_ID, publicUrls } from './public-agent-config.mjs';

// Operator opt-in only. No tool can select an org, agent, credential or Apex action.
if (process.argv.length !== 3 || process.argv[2] !== '--approved-public-guidance') {
  process.stderr.write('Explicit public-guidance startup approval is required.\n');
  process.exit(2);
}
const source = readFileSync(new URL('../../force-app/main/default/aiAuthoringBundles/SportCompassGuide/SportCompassGuide.agent', import.meta.url), 'utf8');
const targets = [...source.matchAll(/target: "([^"]+)"/g)].map(match => match[1]).sort();
if (JSON.stringify(targets) !== JSON.stringify(['apex://FindNearbyFencingClubsAction', 'standardInvocableAction://streamKnowledgeSearch'])) {
  process.stderr.write('Public agent action allowlist changed. Deployment review required.\n');
  process.exit(2);
}
const getAccessToken = createSalesforceTokenProvider({ enabled: true, readCredentials: createKeychainReader({ enabled: true }) });
const app = createPublicGuidanceServer({
  enableVisitUi: true,
  client: new AgentApiClient({ orgUrl: ORG_URL, agentId: PUBLIC_AGENT_ID, getAccessToken, liveEnabled: true, timeoutMs: 60000 }),
  publicUrls
});
const transport = new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 65536 });
const expiry = setInterval(() => void app.expire(), 60000);
expiry.unref();
let stopping = false;
const stop = async code => {
  if (stopping) return;
  stopping = true;
  clearInterval(expiry);
  // Shutdown does not revoke a shared integration grant or change org policy.
  const deadline = setTimeout(() => process.exit(2), 10000);
  deadline.unref();
  try { await app.close(); } catch { code = 2; }
  clearTimeout(deadline);
  process.stdin.destroy();
  process.exitCode = code;
};
app.server.server.onerror = () => {
  process.stderr.write('Public MCP transport failed. No successful business action is confirmed.\n');
  void stop(2);
};
process.once('SIGINT', () => void stop(0));
process.once('SIGTERM', () => void stop(0));
process.stdin.once('end', () => void stop(0));
try {
  await app.server.connect(transport);
  process.stderr.write('Sport Compass ready. Salesforce Agentforce public guidance. No Case or email actions.\n');
} catch {
  process.stderr.write('Public guidance startup failed.\n');
  await stop(2);
}
