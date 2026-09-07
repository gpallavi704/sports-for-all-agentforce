// Local structural regression only; not a replacement for Salesforce compilation or live tests.
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../force-app/main/default/aiAuthoringBundles/SportCompass/', import.meta.url);
const source = readFileSync(new URL('SportCompass.agent', root), 'utf8');
const metadata = readFileSync(new URL('SportCompass.bundle-meta.xml', root), 'utf8');
const expected = ['Scope_Helper', 'Find_My_Sport', 'Find_Real_Clubs', 'Fencing_Program_Guide', 'Accommodation_Support', 'Registration_Support', 'Support_Request'];
const names = [...source.matchAll(/^subagent (\w+):/gm)].map(m => m[1]);
assert.deepEqual(names, expected, 'Unexpected or missing draft subagent');
const routes = [...source.matchAll(/@utils\.transition to @subagent\.(\w+)/g)].map(m => m[1]);
assert.deepEqual([...new Set(routes)].sort(), [...expected].sort(), 'Transitions may target only the seven project paths');
const router = source.split('start_agent agent_router:')[1].split('\nsubagent ')[0];
assert.deepEqual([...router.matchAll(/@utils\.transition to @subagent\.(\w+)/g)].map(m => m[1]).sort(), [...expected].sort(), 'Router must expose each project path once');
const targets = [...source.matchAll(/^\s+target: "([^"]+)"/gm)].map(m => m[1]);
assert.deepEqual(targets, ['apex://MatchSportsProgramsAction', 'apex://FindPublicFencingClubsAction', ...Array(3).fill('standardInvocableAction://streamKnowledgeSearch'), 'apex://ReviewSportsSupportReplyAction', 'apex://PrepareSportsSupportAction', 'apex://CreateSportsSupportCaseAction']);
for (const name of ['Fencing_Program_Guide', 'Accommodation_Support', 'Registration_Support']) {
  const block = source.split('subagent ' + name + ':')[1].split('\nsubagent ')[0];
  assert.match(block, /AnswerQuestionsWithKnowledge: @actions\.AnswerQuestionsWithKnowledge/);
  for (const binding of ['ragFeatureConfigId = @knowledge.rag_feature_config_id', 'citationsEnabled = @knowledge.citations_enabled', 'citationsUrl = @knowledge.citations_url']) {
    assert.ok(block.includes('with ' + binding), name + ' missing fixed library binding');
  }
}
assert.match(source, /welcome: \|\s+Hi, I'm Sport Compass, your AI guide to fencing and parafencing/);
assert.match(source, /additional_parameter__disable_citation: True/);
assert.match(source, /citations_enabled: False/);
assert.match(source, /35 to 60 words/);
assert.match(source, /Do not append optional offers or closing questions/);
assert.doesNotMatch(source, /Offer expansion instead|Offer more detail rather|offer detail instead/);
assert.match(source, /Do not automatically repeat an accessibility checklist/);
const classificationSource = readFileSync(new URL('../knowledge/curated/SC_KB_06_Classification_Process.txt', import.meta.url), 'utf8');
assert.doesNotMatch(classificationSource, /\b(?:four|eight|4|8) weeks\b|minimum age of 13|minimum National Provisional/i);
assert.doesNotMatch(source, /Preserve native file citations|Keep native source markers/);
assert.match(source, /run @actions\.Find_Public_Clubs\s+with latestUserMessage = @system_variables\.user_input/);
const realClubs = source.split('subagent Find_Real_Clubs:')[1].split('\nsubagent ')[0];
assert.doesNotMatch(realClubs, /apex:\/\/(?:Create|Prepare)SportsSupport/);
assert.match(realClubs, /Never fill gaps with model memory, invented names or demo fixtures/);
assert.match(source, /run @actions\.Match_Demo_Programs\s+with latestUserMessage = @system_variables\.user_input/);
assert.match(source, /This is a demo-only program search/);
assert.match(source, /with latestUserMessage = @system_variables\.user_input/);
assert.match(source, /with token = @variables\.support_token/);
assert.match(source, /if @variables\.support_token and not @variables\.support_case_id:\s+transition to @subagent\.Support_Request/);
assert.match(source, /run @actions\.Review_Reply\s+with latestUserMessage = @system_variables\.user_input/);
assert.match(source, /if @variables\.support_token and @variables\.support_reply == "CONFIRM":\s+run @actions\.Confirm_Support/);
assert.match(source, /if not @variables\.support_token and @variables\.support_reply == "AWAITING_CONSENT":\s+run @actions\.Prepare_Support\s+with latestUserMessage = @system_variables\.user_input\s+with matchedProgramsJson = @variables\.demo_lookup_results/);
assert.doesNotMatch(source, /with programId = \.\.\./);
assert.match(source, /target: "apex:\/\/CreateSportsSupportCaseAction"\s+require_user_confirmation: True/);
assert.doesNotMatch(source, /with latestUserMessage = \.\.\./);
assert.doesNotMatch(source, /@utils\.setVariables/,'Support capability variables must not be model slot-filled');
assert.doesNotMatch(metadata, /<target\b/, 'Draft-only deployment must not declare a commit target');
const curated = new URL('../knowledge/curated/', import.meta.url);
const sourceUrls = new Set(readdirSync(curated).flatMap(f => [...readFileSync(new URL(f, curated), 'utf8').matchAll(/https:\/\/[^\s]+/g)].map(m => m[0])));
// Public directory action adds three reviewed navigation URLs, not arbitrary hosts.
for (const url of ['https://www.usafencingutah.com/utah-idaho-clubs', 'https://www.saltcityswords.com/', 'https://www.wasatchfencing.com/']) sourceUrls.add(url);
const instructionUrls = new Set([...source.matchAll(/https:\/\/[^\s]+/g)].map(m => m[0]));
assert.deepEqual([...instructionUrls].sort(), [...sourceUrls].sort(), 'Permitted links must exactly match the curated knowledge and public-club source inventory');
assert.ok([...instructionUrls].every(url => !/[?*#]/.test(url)), 'No wildcard, query or fragment destinations');
console.log(JSON.stringify({ passed: true, subagents: names.length, externalActionTargets: targets.length, permittedPublicUrls: instructionUrls.size, draftOnly: true }, null, 2));
