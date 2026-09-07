// Read-only regression checks for the current hackathon org. Never deploys or writes records.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const baseline = JSON.parse(readFileSync(new URL('../docs/agentforce/security-access-after.json', import.meta.url), 'utf8'));
const target = process.argv[2] || 'sport-compass';
function query(soql, tooling = false) {
  const args = ['data', 'query', '--target-org', target, '--query', soql, '--json'];
  if (tooling) args.push('--use-tooling-api');
  const response = JSON.parse(execFileSync('sf', args, { encoding: 'utf8', timeout: 60000 }));
  assert.equal(response.status, 0, 'Salesforce query failed');
  return response.result.records;
}
assert.equal(query('SELECT Id FROM Organization')[0].Id, baseline.orgId, 'Wrong org; stop before further checks');
const userId = baseline.agentUserId;
assert.match(userId, /^[a-zA-Z0-9]{18}$/);
const objects = query("SELECT EntityDefinitionId, IsReadable, IsCreatable, IsEditable, IsDeletable FROM UserEntityAccess WHERE UserId = '" + userId + "' AND EntityDefinitionId IN ('Account','Contact','Case','MessagingSession','MessagingEndUser')", true);
assert.equal(objects.length, 5);
for (const r of objects) {
  for (const key of ['IsReadable', 'IsCreatable', 'IsEditable', 'IsDeletable']) {
    assert.equal(r[key], false, r.EntityDefinitionId + ' unexpectedly has ' + key);
  }
}
const ids = baseline.afterRecords.map(r => {
  assert.match(r.RecordId, /^[a-zA-Z0-9]{18}$/);
  return "'" + r.RecordId + "'";
}).join(',');
const records = query("SELECT RecordId, HasReadAccess, HasEditAccess, HasDeleteAccess FROM UserRecordAccess WHERE UserId = '" + userId + "' AND RecordId IN (" + ids + ")");
assert.equal(records.length, 6);
for (const expected of baseline.afterRecords) {
  const actual = records.find(r => r.RecordId === expected.RecordId);
  assert.ok(actual, 'Missing demo record access result');
  for (const key of ['HasReadAccess', 'HasEditAccess', 'HasDeleteAccess']) {
    assert.equal(actual[key], expected[key], expected.RecordId + ' changed ' + key);
  }
}
const assignments = query("SELECT PermissionSet.Name FROM PermissionSetAssignment WHERE AssigneeId = '" + userId + "'").map(r => r.PermissionSet.Name);
assert.ok(!assignments.includes('AgentforceServiceAgentSecureBase'), 'Broad base assignment returned');
for (const name of ['AgentforceServiceAgentUserPsg', 'SportCompass_Discovery_Read', 'SportCompass_Knowledge_Runtime', 'SportCompass_Program_Matching']) {
  assert.ok(assignments.includes(name), 'Missing required assignment: ' + name);
}
const licenses = query("SELECT PermissionSetLicense.DeveloperName FROM PermissionSetLicenseAssign WHERE AssigneeId = '" + userId + "'").map(r => r.PermissionSetLicense.DeveloperName);
for (const name of baseline.licenses) assert.ok(licenses.includes(name), 'Missing runtime license: ' + name);
console.log(JSON.stringify({ passed: true, deniedObjects: objects.length, checkedDemoRecords: records.length, runtimeAssignmentsAndLicensesPresent: true, scope: 'Effective object/record access only; this script does not test live retrieval, FLS, action context or Data Cloud policy.' }, null, 2));
