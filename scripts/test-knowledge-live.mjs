// Live knowledge fixtures. Incurs Agentforce usage. Never activates or deploys.
// Each fixture starts a fresh session; none supplies an allowlisted confirmation reply.
// Run: node scripts/test-knowledge-live.mjs sport-compass [KB01,KB02,...]
// Generated output is sanitized; Salesforce's raw local traces remain Git-ignored.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const target = process.argv[2] || 'sport-compass';
const selected = process.argv[3]?.split(',');
const tests = JSON.parse(readFileSync('knowledge/retrieval-tests.json', 'utf8')).filter(t => !selected || selected.includes(t.id));
assert.ok(tests.length, 'No matching tests');
const source = readFileSync('force-app/main/default/aiAuthoringBundles/SportCompass/SportCompass.agent', 'utf8');
const externalTargets = [...source.matchAll(/^\s+target: "([^"]+)"/gm)].map(m => m[1]);
assert.equal(externalTargets.length, 7);
assert.deepEqual(externalTargets.sort(), ['apex://MatchSportsProgramsAction', ...Array(3).fill('standardInvocableAction://streamKnowledgeSearch'), 'apex://ReviewSportsSupportReplyAction', 'apex://PrepareSportsSupportAction', 'apex://CreateSportsSupportCaseAction'].sort(), 'Stop: new actions require test safety review');
assert.ok(source.includes('with latestUserMessage = @system_variables.user_input'), 'Confirmation must use actual user input');
const publicUrls = new Set();
for (const f of readdirSync('knowledge/curated')) {
  for (const m of readFileSync('knowledge/curated/' + f, 'utf8').matchAll(/https:\/\/[^\s]+/g)) publicUrls.add(m[0]);
}
function sanitize(text) {
  return String(text).replace(/https?:\/\/[^\s<>"\]]+/g, raw => {
    const url = raw.replace(/[).,;]+$/, '');
    return publicUrls.has(url) ? raw : '[non-allowlisted URL omitted]';
  });
}
function sf(args) {
  try {
    const j = JSON.parse(execFileSync('sf', [...args, '--target-org', target, '--api-version', '67.0', '--json'], { encoding: 'utf8', timeout: 90000, maxBuffer: 12 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
    assert.equal(j.status, 0, 'Salesforce command did not succeed');
    return j.result;
  } catch {
    // Do not expose an exception containing CLI stdout, tokens or presigned URLs.
    throw new Error('Salesforce CLI operation failed or timed out: ' + args.slice(0, 3).join(' '));
  }
}
const org = sf(['data', 'query', '--query', 'SELECT Id FROM Organization']).records[0].Id;
assert.equal(org, '00DgL00000c7pj3UAA', 'Wrong org');
const report = { testedAt: new Date().toISOString(), draftSha256: createHash('sha256').update(source).digest('hex'), mode: 'draft-live-actions', activated: false, freshSessionPerTest: true, automatedChecksAreNotSemanticApproval: true, results: [] };
const dir = 'temp/knowledge-live';
mkdirSync(dir, { recursive: true });
const output = resolve(dir, new Date().toISOString().replace(/[:.]/g, '-') + '.json');
console.log('Sanitized report: ' + output);
for (const test of tests) {
  assert.equal(readFileSync('force-app/main/default/aiAuthoringBundles/SportCompass/SportCompass.agent', 'utf8'), source, 'Draft changed during suite; stop rather than mix versions');
  let sessionId;
  const row = { id: test.id, question: test.question, expectedSource: test.source };
  try {
    sessionId = sf(['agent', 'preview', 'start', '--authoring-bundle', 'SportCompass', '--use-live-actions']).sessionId;
    assert.match(sessionId, /^[a-f0-9-]{36}$/i);
    // All fixtures are fictional, including child/classification and safety scenarios.
    const utterance = 'Synthetic hackathon evaluation only. No real person, medical information or incident is involved. Answer the following fictional/general question: ' + test.question;
    const result = sf(['agent', 'preview', 'send', '--authoring-bundle', 'SportCompass', '--session-id', sessionId, '--utterance', utterance]);
    row.messages = (result.messages || []).map(m => ({ type: m.type, text: sanitize(m.message || ''), citationLabels: (m.citedReferences || []).map(c => sanitize(c.label || '')) }));
    const answer = row.messages.map(m => m.text).join('\n');
    const originalSourceUrl = readFileSync('knowledge/curated/' + test.source, 'utf8').match(/^SOURCE URL: (.+)$/m)?.[1];
    row.originalSourceUrl = originalSourceUrl;
    row.originalSourceUrlPresent = Boolean(originalSourceUrl && answer.includes(originalSourceUrl));
    row.requiredNavigationUrls = test.must_include.filter(p => p.startsWith('https://')).map(url => ({ url, present: answer.includes(url) }));
    row.expectedSourceCited = row.messages.some(m => m.citationLabels.some(l => l.includes(test.source)));
    row.urlRedacted = /URL[_ -]Redacted/i.test(answer);
    row.requiredPhraseHints = test.must_include.map(phrase => ({ phrase, literalMatch: answer.toLowerCase().includes(phrase.toLowerCase()) }));
    row.prohibitedBehaviorsForManualReview = test.must_not;
    row.manualReview = 'pending';
  } catch (error) {
    row.error = error.message;
  } finally {
    if (sessionId) {
      try {
        const ended = sf(['agent', 'preview', 'end', '--authoring-bundle', 'SportCompass', '--session-id', sessionId]);
        const traceDir = resolve(ended.tracesPath, 'traces');
        row.traces = readdirSync(traceDir).filter(f => f.endsWith('.json')).map(f => {
          const t = JSON.parse(readFileSync(resolve(traceDir, f), 'utf8'));
          return { planId: t.planId, topic: t.topic, functions: (t.plan || []).filter(s => s.type === 'FunctionStep').map(s => s.function?.name) };
        });
        row.sessionEnded = true;
        if (test.expected_topics) row.expectedTopicMatched = row.traces.some(t => test.expected_topics.includes(t.topic));
      } catch { row.sessionEnded = false; row.sessionNeedingCleanup = sessionId; }
    }
    report.results.push(row);
    writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ id: row.id, sourceCited: row.expectedSourceCited, originalSourceUrlPresent: row.originalSourceUrlPresent, urlRedacted: row.urlRedacted, expectedTopicMatched: row.expectedTopicMatched, sessionEnded: row.sessionEnded, error: row.error, topics: row.traces?.map(t => t.topic) }));
  }
  if (row.sessionEnded === false) { process.exitCode = 1; break; }
}
if (report.results.some(r => r.error || r.urlRedacted || !r.expectedSourceCited || !r.originalSourceUrlPresent || r.expectedTopicMatched === false || r.requiredNavigationUrls?.some(u => !u.present))) process.exitCode = 1;
