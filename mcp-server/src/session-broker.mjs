import { randomUUID } from 'node:crypto';
import { IntegrationError, validateMessage } from './agent-api.mjs';

// In-memory, single-process foundation. The future OAuth transport must derive
// principal from a verified issuer/subject, NEVER from model tool arguments.
export class SessionBroker {
  #client; #sessions = new Map(); #now; #ttl; #capacity; #publicUrls;
  constructor({ client, publicUrls, now = Date.now, ttlMs = 15 * 60000, capacity = 100 }) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000 || !Number.isInteger(ttlMs) || ttlMs < 1 || ttlMs > 30 * 60000) throw new IntegrationError('INVALID_LIMITS');
    this.#client = client; this.#publicUrls = new Set(publicUrls); this.#now = now; this.#ttl = ttlMs; this.#capacity = capacity;
  }
  #caller(principal) {
    if (typeof principal !== 'string' || !principal.trim() || principal.length > 500) throw new IntegrationError('AUTHENTICATED_CALLER_REQUIRED');
  }
  #get(principal, handle) {
    this.#caller(principal);
    const session = this.#sessions.get(handle);
    // Same error for another caller and an unknown handle: no existence oracle.
    if (!session || session.owner !== principal) throw new IntegrationError('CONVERSATION_NOT_FOUND');
    return session;
  }
  #project(result) {
    // Exclude internal variables, action payloads, raw citations and _links.
    // Text remains untrusted content, not permission to invoke another tool.
    return (result?.messages || []).filter(m => m.type === 'Inform' && typeof m.message === 'string').slice(0, 10).map(m => ({
      text: m.message.slice(0, 12000).replace(/https?:\/\/[^\s<>"\])]+/g, url => this.#publicUrls.has(url) ? url : '[unapproved link omitted]')
    }));
  }
  async start(principal) {
    this.#caller(principal);
    await this.expire();
    if (this.#sessions.size >= this.#capacity || [...this.#sessions.values()].filter(s => s.owner === principal).length >= 3) throw new IntegrationError('SESSION_LIMIT');
    const handle = randomUUID();
    // Reserve before awaiting to enforce capacity under simultaneous starts.
    const session = { owner: principal, expires: this.#now() + this.#ttl, seq: 0, tail: Promise.resolve(), poisoned: false, attempts: 0, window: this.#now(), active: 0, starting: true };
    this.#sessions.set(handle, session);
    try { session.id = await this.#client.start(); session.starting = false; return { conversationHandle: handle, mode: 'non-confirming-guidance', expiresAt: session.expires }; }
    catch (e) { this.#sessions.delete(handle); throw e; }
  }
  async send(principal, handle, message) {
    validateMessage(message);
    const session = this.#get(principal, handle);
    if (session.active >= 4) throw new IntegrationError('BUSY');
    session.active++;
    const task = session.tail.then(async () => {
      if (session.starting || session.poisoned) throw new IntegrationError('SESSION_UNAVAILABLE');
      if (session.expires <= this.#now()) throw new IntegrationError('SESSION_EXPIRED');
      if (this.#now() - session.window >= 60000) { session.window = this.#now(); session.attempts = 0; }
      if (++session.attempts > 20) throw new IntegrationError('RATE_LIMIT');
      try { return { mode: 'non-confirming-guidance', messages: this.#project(await this.#client.send(session.id, ++session.seq, message)) }; }
      catch (e) { session.poisoned = true; throw e; }
    });
    session.tail = task.catch(() => {});
    try { return await task; } finally { session.active--; }
  }
  async end(principal, handle) {
    const session = this.#get(principal, handle);
    this.#sessions.delete(handle);
    await session.tail;
    session.poisoned = true;
    await this.#client.end(session.id);
    return { ended: true };
  }
  async expire() {
    for (const [handle, session] of this.#sessions) {
      if (!session.starting && !session.active && session.expires <= this.#now()) {
        this.#sessions.delete(handle);
        try { await this.#client.end(session.id, 'Expiration'); } catch { /* upstream cleanup retry/telemetry is a deployment gate */ }
      }
    }
  }
}
