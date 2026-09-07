import { randomUUID } from 'node:crypto';
import { IntegrationError, validateMessage } from './agent-api.mjs';

// Protocol fixture only: no network, file reads, credentials or fencing facts.
// Never present this response as an answer from Salesforce or USA Fencing.
export function createMockAgentClient() {
  const sessions = new Map();
  return {
    async start() { const id = randomUUID(); sessions.set(id, 0); return id; },
    async send(id, sequence, message) {
      validateMessage(message);
      if (!sessions.has(id) || sequence !== sessions.get(id) + 1) throw new IntegrationError('INVALID_SESSION');
      sessions.set(id, sequence);
      return { messages: [{ type: 'Inform', message: 'LOCAL MOCK ONLY: The MCP request reached the session handler. Salesforce was not contacted. No program recommendation, registration or support Case was created. Live fencing guidance is not connected yet.' }] };
    },
    async end(id) { sessions.delete(id); }
  };
}
