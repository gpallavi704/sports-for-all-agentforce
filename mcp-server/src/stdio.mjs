import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createLocalMockServer } from './mcp-local.mjs';

// Deliberately no HTTP listener, tunnel, dotenv, OAuth or live backend switch.
if (process.argv.length !== 3 || process.argv[2] !== '--mock') {
  process.stderr.write('Only explicit local mock mode is supported: node src/stdio.mjs --mock\n');
  process.exitCode = 2;
} else {
  const app = createLocalMockServer();
  const transport = new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 65536 });
  let stopping = false;
  const stop = async code => {
    if (stopping) return;
    stopping = true;
    try { await app.close(); } catch { code = 2; }
    process.stdin.destroy();
    process.exitCode = code;
  };
  app.server.server.onerror = () => {
    process.stderr.write('Local MCP transport rejected a request. No Salesforce connection exists.\n');
    void stop(2);
  };
  process.once('SIGINT', () => void stop(0));
  process.once('SIGTERM', () => void stop(0));
  process.stdin.once('end', () => void stop(0));
  try {
    await app.server.connect(transport);
    process.stderr.write('Sport Compass LOCAL MOCK ready on stdio. No Salesforce, HTTP endpoint or credentials.\n');
  } catch {
    process.stderr.write('Local MCP startup failed.\n');
    await stop(2);
  }
}
