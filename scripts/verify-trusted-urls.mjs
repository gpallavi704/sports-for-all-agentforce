// Read-only org-specific regression. Does not deploy, edit settings or run an agent.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const evidence = JSON.parse(readFileSync(new URL('../docs/agentforce/trusted-url-verification-2026-09-07.json', import.meta.url), 'utf8'));
const target = process.argv[2] || 'sport-compass';
function query(soql, tooling = false) {
  const args = ['data', 'query', '--query', soql, '--target-org', target, '--api-version', '67.0', '--json'];
  if (tooling) args.push('--use-tooling-api');
  const j = JSON.parse(execFileSync('sf', args, { encoding: 'utf8', timeout: 60000 }));
  assert.equal(j.status, 0);
  return j.result.records;
}
assert.equal(query('SELECT Id FROM Organization')[0].Id, '00DgL00000c7pj3UAA', 'Wrong org');
const expected = [...evidence.trustedUrlReadback];
const template = expected.find(r => r.DeveloperName === 'SportCompass_USAFencing');
for (const [DeveloperName, EndpointUrl] of [
  ['SportCompass_UtahDivision', 'https://www.usafencingutah.com'],
  ['SportCompass_SaltCitySwords', 'https://www.saltcityswords.com'],
  ['SportCompass_WasatchFencing', 'https://www.wasatchfencing.com']
]) expected.push({ ...template, DeveloperName, EndpointUrl });
const fields = Object.keys(expected[0]);
const rows = query('SELECT ' + fields.join(', ') + ' FROM CspTrustedSite', true);
for (const reference of expected) {
  const actual = rows.find(r => r.DeveloperName === reference.DeveloperName);
  assert.ok(actual, 'Missing trusted entry: ' + reference.DeveloperName);
  for (const field of fields) assert.equal(actual[field], reference[field], reference.DeveloperName + '.' + field + ' changed');
}
const project = rows.filter(r => r.DeveloperName.startsWith('SportCompass_'));
assert.equal(project.length, 7, 'Unexpected project Trusted URL entry');
for (const row of project) {
  assert.match(row.EndpointUrl, /^https:\/\/[a-z.]+$/);
  assert.ok(!row.EndpointUrl.includes('*'));
  assert.equal(row.IsApplicableToImgSrc, true, 'Image-only supported configuration');
  for (const field of fields.filter(f => /^(IsApplicable|CanAccess)/.test(f) && f !== 'IsApplicableToImgSrc')) assert.equal(row[field], false);
}
console.log(JSON.stringify({ passed: true, approvedHosts: 7, existingEntriesPreserved: 4, imageOnlyCsp: true, scope: 'Verified recorded URL fields; not a complete CSP or security audit.' }, null, 2));
