import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SessionBroker } from './session-broker.mjs';
import { createMockAgentClient } from './mock-agent.mjs';
import { dispatch, tools } from './tool-contracts.mjs';
import { IntegrationError } from './agent-api.mjs';

const notice = 'LOCAL MOCK ONLY. No Salesforce connection, AI-generated fencing answer, record write or verified end-user authentication.';
const base = { mock: z.literal(true), mode: z.literal('local-mock'), notice: z.string() };
const handle = z.string().uuid();
const inputs = {
  start_sport_compass: z.object({}).strict(),
  ask_sport_compass: z.object({ conversationHandle: handle, message: z.string().min(1).max(4000) }).strict(),
  end_sport_compass: z.object({ conversationHandle: handle }).strict()
};
const outputs = {
  start_sport_compass: z.object({ ...base, conversationHandle: handle, expiresAt: z.number().int() }).strict(),
  ask_sport_compass: z.object({ ...base, messages: z.array(z.object({ text: z.string() }).strict()).max(10) }).strict(),
  end_sport_compass: z.object({ ...base, ended: z.literal(true) }).strict()
};
const safeErrors = new Set(['INVALID_MESSAGE', 'INVALID_SESSION', 'CONVERSATION_NOT_FOUND', 'SESSION_LIMIT', 'SESSION_EXPIRED', 'SESSION_UNAVAILABLE', 'RATE_LIMIT', 'BUSY']);

export function createLocalMockServer() {
  const broker = new SessionBroker({ client: createMockAgentClient(), publicUrls: [] });
  // One isolated local process identity, not an authenticated ChatGPT user.
  const principal = 'local-mock:' + randomUUID();
  const handles = new Set();
  const server = new McpServer({ name: 'sport-compass-local-mock', version: '0.1.0' }, {
    instructions: 'Local mock protocol test only; not Salesforce or USA Fencing. Start a session, use the returned handle to ask, then end it. All responses are synthetic acknowledgments, not fencing guidance. Never claim a Case was created. Do not submit personal data or credentials.'
  });
  for (const tool of tools) {
    server.registerTool(tool.name, {
      title: tool.name.replaceAll('_', ' '),
      description: 'LOCAL MOCK ONLY. ' + (tool.name === 'start_sport_compass' ? 'Start a synthetic protocol-test session.' : tool.name === 'ask_sport_compass' ? 'Test a message round trip. Returns a fixed acknowledgment, not fencing advice.' : 'End the local synthetic session.'),
      inputSchema: inputs[tool.name], outputSchema: outputs[tool.name],
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
      // No remote OAuth claim: this factory has no live backend or HTTP route.
      _meta: { securitySchemes: [{ type: 'noauth' }] }
    }, async args => {
      try {
        const result = await dispatch(broker, principal, tool.name, args);
        if (tool.name === 'start_sport_compass') handles.add(result.conversationHandle);
        if (tool.name === 'end_sport_compass') handles.delete(args.conversationHandle);
        const structuredContent = outputs[tool.name].parse({ ...result, mock: true, mode: 'local-mock', notice });
        return { structuredContent, content: [{ type: 'text', text: JSON.stringify(structuredContent) }] };
      } catch (error) {
        const code = error instanceof IntegrationError && safeErrors.has(error.code) ? error.code : 'TOOL_FAILED';
        return { isError: true, content: [{ type: 'text', text: JSON.stringify({ mock: true, code, notice }) }] };
      }
    });
  }
  let closing;
  return {
    server,
    close() {
      closing ??= (async () => {
        await server.close();
        await Promise.allSettled([...handles].map(h => broker.end(principal, h)));
        handles.clear();
      })();
      return closing;
    }
  };
}
