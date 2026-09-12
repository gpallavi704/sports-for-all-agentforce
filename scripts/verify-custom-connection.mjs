// Local consistency checks only: no Salesforce calls or Agentforce usage.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const surfaceName = 'SportCompassChannels_SCClub01';
const formatName = 'SportCompassClubResults_SCClub01';
const script = read('force-app/main/default/aiAuthoringBundles/SportCompassGuide/SportCompassGuide.agent');
assert.match(script, /connection SportCompassChannels_SCClub01:\n    adaptive_response_allowed: True/);
for (const name of ['messaging', 'customer_web_client']) {
  assert.match(script, new RegExp('connection ' + name + ':'));
}
const surface = read(`force-app/main/default/aiSurfaces/${surfaceName}.aiSurface-meta.xml`);
assert.match(surface, /<surfaceType>Custom<\/surfaceType>/);
assert.equal((surface.match(/<responseFormats>/g) || []).length, 1);
assert.match(surface, new RegExp('<enabled>true</enabled>\\s*<responseFormat>' + formatName + '</responseFormat>'));
assert.ok(!surface.includes('RenderProbe'), 'Temporary diagnostics must not be shipped');
const format = read(`force-app/main/default/aiResponseFormats/${formatName}.aiResponseFormat-meta.xml`);
const input = format.match(/<input>([\s\S]*?)<\/input>/)?.[1];
assert.ok(input, 'Missing response schema');
const actual = JSON.parse(input.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'));
const contract = JSON.parse(read('contracts/club-results-v1.schema.json'));
delete contract.$id;
delete contract.title;
assert.deepEqual(actual, contract, 'Response format differs from client contract');
console.log('PASS: named Custom connection, retained standard connections, one enabled format, matching JSON contract. Runtime rendering is not established by these checks.');
