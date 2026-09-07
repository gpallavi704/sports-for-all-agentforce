// Bounded published-agent CLI preview test; not a browser accessibility or Agent API test.
// No activation, credential reads or intended record writes.
// Salesforce preview session uses the configured agent runtime user. Incurs agent usage.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { assessMatchingAnswer } from '../mcp-server/src/matching-acceptance.mjs';

function sf(args) {
  try {
    const result = JSON.parse(execFileSync('/opt/homebrew/bin/sf', [...args, '--target-org', 'sport-compass', '--json'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16000000, stdio: ['ignore','pipe','pipe'] }));
    assert.equal(result.status, 0);
    return result.result;
  } catch { throw Error('PUBLIC_CLUB_TEST_CLI_FAILURE'); }
}
function realClub(text, name, website) {
  assert.ok(text.includes(name), 'Expected configured club name');
  assert.ok(text.includes(website), 'Expected original club website');
  assert.ok(text.includes('https://www.usafencingutah.com/utah-idaho-clubs'), 'Expected directory source');
  assert.match(text, /unknown|not (?:verified|confirmed)|confirm.*club/i);
  assert.doesNotMatch(text, /DEMO -|Salt Lake Adaptive Fencing|Salt Lake Parafencing Starters|Wasatch Wheelchair Fencing Intro/);
}
const turns = [
  { prompt: 'Find beginner wheelchair fencing programs in Salt Lake City, Utah. I need mobility access and fencing frames. Please use real clubs, not fictional examples.',
    check: text => realClub(text, 'Salt City Swords', 'https://www.saltcityswords.com/') },
  { prompt: 'What about real clubs in Kaysville, UT? Please check that city instead.',
    check: text => { realClub(text, 'Wasatch Fencing', 'https://www.wasatchfencing.com/'); assert.doesNotMatch(text, /Salt City Swords/); } },
  { prompt: 'Now find real clubs in Atlantis, ZZ. If your directory has none, say so without inventing alternatives.',
    check: text => { assert.match(text, /no.*(?:listing|entr|club)|(?:cannot|could not|couldn.t).*find/i); assert.ok(text.includes('https://member.usafencing.org/clubs')); assert.doesNotMatch(text, /DEMO -|Salt City Swords|Wasatch Fencing/); } },
  { prompt: 'Now explicitly switch to fictional demo programs only: Salt Lake City, UT, age 25, beginner, mobility and equipment preferences.',
    check: text => assert.ok(assessMatchingAnswer(text, { adultOnly: true }).passed, 'Existing synthetic matching regression') },
  { prompt: 'Switch back to REAL clubs in Salt Lake City, UT, not fictional programs. What is actually listed and what still needs confirmation?',
    check: text => realClub(text, 'Salt City Swords', 'https://www.saltcityswords.com/') }
];
let session;
let checksPassed = 0;
const failures = [];
try {
  session = sf(['agent','preview','start','--api-name','SportCompass']).sessionId;
  for (const [index, turn] of turns.entries()) {
    const result = sf(['agent','preview','send','--api-name','SportCompass','--session-id',session,'--utterance',turn.prompt]);
    const text = (result.messages || []).filter(m => m.type === 'Inform').map(m => m.message).join('\n');
    console.log(JSON.stringify({ turn: index + 1, answer: text.slice(0, 12000) }));
    try { turn.check(text); checksPassed++; }
    catch (error) {
      failures.push({ turn: index + 1, failure: error.message });
      console.log(JSON.stringify(failures.at(-1)));
      process.exitCode = 1;
    }
  }
} catch (error) {
  console.log(JSON.stringify({ passed: false, checksPassed, failure: error.message }));
  process.exitCode = 1;
} finally {
  if (session) {
    try {
      const end = sf(['agent','preview','end','--api-name','SportCompass','--session-id',session]);
      const dir = end.tracesPath + '/traces';
      const functions = readdirSync(dir).filter(n => n.endsWith('.json')).flatMap(n => {
        const trace = JSON.parse(readFileSync(dir + '/' + n, 'utf8'));
        return (trace.plan || []).filter(p => p.type === 'FunctionStep').map(p => p.function?.name);
      });
      console.log(JSON.stringify({ ended: true, checksPassed, functions, failures }));
      assert.ok(functions.filter(n => /Find_Public_Clubs|FindPublicFencingClubs/i.test(n)).length >= 4, 'Expected a public club action for each real search');
      assert.ok(functions.some(n => /Match_Demo_Programs|MatchSportsPrograms/i.test(n)), 'No demo action observed in trace');
      assert.equal(checksPassed, turns.length);
      console.log('PUBLIC_CLUB_LIVE_CHECKS_PASSED');
    } catch { console.log('PUBLIC_CLUB_END_OR_TRACE_CHECK_FAILED'); process.exitCode = 1; }
  }
}
