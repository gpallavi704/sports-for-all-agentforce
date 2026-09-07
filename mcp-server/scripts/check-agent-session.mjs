import { AgentApiClient } from '../src/agent-api.mjs';
import { createKeychainReader, createSalesforceTokenProvider, ORG_URL } from '../src/salesforce-auth.mjs';
import { assessMatchingAnswer } from '../src/matching-acceptance.mjs';

const args = process.argv.slice(2);
const guidanceOnly = args.length === 3 && args[2] === '--guidance-only';
if ((!guidanceOnly && args.length !== 2) || args[0] !== '--approved-agent-check' || !/^0Xx[a-zA-Z0-9]{15}$/.test(args[1])) {
  console.error('APPROVED_RUNTIME_AGENT_CHECK_REQUIRED'); process.exit(1);
}
let token; let session; let phase = 'authentication';
const report = { scenario: guidanceOnly ? 'guidance-only' : 'guidance-and-matching', started: false, turns: [], ended: false, revocationAcknowledged: false };
const getToken = createSalesforceTokenProvider({ enabled: true, readCredentials: createKeychainReader({ enabled: true }) });
const client = new AgentApiClient({ orgUrl: ORG_URL, agentId: args[1], liveEnabled: true, timeoutMs: 60000,
  getAccessToken: async () => { token = await getToken(); return token; },
  fetchImpl: async (url, options) => {
    const response = await fetch(url, options);
    // Only HTTP status/method; never headers, URLs, raw responses or sessions.
    report.lastHttpStatus = response.status; report.lastMethod = options.method;
    return response;
  },
});
try {
  phase = 'start'; session = await client.start(); report.started = true;
  const prompts = [
    'I am new to wheelchair fencing. How can I get started? Please cite the public sources you use.',
    'For that first visit, what equipment should I ask the club about? Please do not assume they provide it.',
    'For a fictional demo only, find beginner programs in Salt Lake City, UT with mobility access and equipment support. I am an adult. Show unknown accessibility details explicitly.',
    'For fictional demo programs only, now search Salt Lake City, UT for a 25-year-old beginner with mobility and equipment preferences. Use the configured demo program records.',
    'Find beginner demo programs in Atlantis, ZZ for a 25-year-old. Do not invent any examples if none are stored.',
  ];
  const selectedPrompts = guidanceOnly ? prompts.slice(0, 2) : prompts;
  for (let index = 0; index < selectedPrompts.length; index++) {
    phase = `turn-${index + 1}`;
    const response = await client.send(session, index + 1, prompts[index]);
    const messages = (response.messages || []).filter(message => message.type === 'Inform' && typeof message.message === 'string').slice(0, 6).map(message => message.message.slice(0, 10000)
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[token omitted]')
      .replace(/\b(?:005|00D|500|a0[0-9A-Za-z])[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?\b/g, '[record identifier omitted]'));
    report.turns.push({ prompt: prompts[index], messages });
    if (index === 2 || index === 3) {
      const checks = assessMatchingAnswer(messages.join('\n'), { adultOnly: index === 3 });
      report.turns.at(-1).matchingChecks = checks;
      if (!checks.passed) report.matchingAcceptanceFailed = true;
    }
    console.log(JSON.stringify({ completedTurn: index + 1, messages }));
    if (!messages.length) throw Error('NO_INFORM_RESPONSE');
  }
} catch (error) {
  report.failurePhase = phase;
  report.failureCode = ['UPSTREAM_REJECTED', 'UPSTREAM_RATE_LIMIT', 'UPSTREAM_FAILED_NO_AUTOMATIC_RETRY', 'TOKEN_ACQUISITION_FAILED', 'INVALID_UPSTREAM_SESSION'].includes(error.code) ? error.code : 'AGENT_CHECK_INCOMPLETE';
} finally {
  if (session) {
    try { await client.end(session); report.ended = true; }
    catch { report.endFailed = true; }
  }
  if (token) {
    try {
      const response = await fetch(`${ORG_URL}/services/oauth2/revoke`, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token }).toString() });
      report.revocationAcknowledged = response.ok; await response.body?.cancel();
    } catch { report.revocationAcknowledged = false; }
  }
  token = undefined; session = undefined;
}
report.lifecyclePassed = report.started && report.turns.length === (guidanceOnly ? 2 : 5) && !report.failurePhase && report.ended && report.revocationAcknowledged;
// Lifecycle success is not a semantic quality, safety or grounding score.
console.log(JSON.stringify({ ...report, turns: report.turns.map(({ messages, matchingChecks }, i) => ({ turn: i + 1, informCount: messages.length, matchingChecks })) }, null, 2));
process.exitCode = report.lifecyclePassed && !report.matchingAcceptanceFailed ? 0 : 1;
