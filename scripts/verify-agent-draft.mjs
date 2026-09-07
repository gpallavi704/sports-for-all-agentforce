// Local structural regression only; not a replacement for Salesforce compilation or live tests.
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../force-app/main/default/aiAuthoringBundles/SportCompass/', import.meta.url);
const source = readFileSync(new URL('SportCompass.agent', root), 'utf8');
const metadata = readFileSync(new URL('SportCompass.bundle-meta.xml', root), 'utf8');
const expected = ['Scope_Helper', 'Find_My_Sport', 'Fencing_Program_Guide', 'Accommodation_Support', 'Registration_Support'];
const names = [...source.matchAll(/^subagent (\w+):/gm)].map(m => m[1]);
assert.deepEqual(names, expected, 'Unexpected or missing draft subagent');
const routes = [...source.matchAll(/@utils\.transition to @subagent\.(\w+)/g)].map(m => m[1]);
assert.deepEqual(routes.sort(), [...expected].sort(), 'Router must expose only the five project paths');
const targets = [...source.matchAll(/^\s+target: "([^"]+)"/gm)].map(m => m[1]);
assert.deepEqual(targets, ['apex://MatchSportsProgramsAction', ...Array(3).fill('standardInvocableAction://streamKnowledgeSearch')]);
for (const name of expected.slice(2)) {
  const block = source.split('subagent ' + name + ':')[1].split('\nsubagent ')[0];
  assert.match(block, /AnswerQuestionsWithKnowledge: @actions\.AnswerQuestionsWithKnowledge/);
  for (const binding of ['ragFeatureConfigId = @knowledge.rag_feature_config_id', 'citationsEnabled = @knowledge.citations_enabled', 'citationsUrl = @knowledge.citations_url']) {
    assert.ok(block.includes('with ' + binding), name + ' missing fixed library binding');
  }
}
assert.match(source, /welcome: \|\s+Hi, I'm Sport Compass, an AI fencing guide/);
assert.match(source, /Match_Demo_Programs: @actions\.Match_Demo_Programs/);
assert.match(source, /This is a demo-only program search/);
assert.doesNotMatch(metadata, /<target\b/, 'Draft-only deployment must not declare a commit target');
const curated = new URL('../knowledge/curated/', import.meta.url);
const sourceUrls = new Set(readdirSync(curated).flatMap(f => [...readFileSync(new URL(f, curated), 'utf8').matchAll(/https:\/\/[^\s]+/g)].map(m => m[0])));
const instructionUrls = new Set([...source.matchAll(/https:\/\/[^\s]+/g)].map(m => m[0]));
assert.deepEqual([...instructionUrls].sort(), [...sourceUrls].sort(), 'Permitted links must exactly match the curated-source URL inventory');
assert.ok([...instructionUrls].every(url => !/[?*#]/.test(url)), 'No wildcard, query or fragment destinations');
console.log(JSON.stringify({ passed: true, subagents: names.length, externalActionTargets: targets.length, permittedPublicUrls: instructionUrls.size, draftOnly: true }, null, 2));
