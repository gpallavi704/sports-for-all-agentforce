# Sport Compass — backup and schema validation

Verified September 6, 2026 Pacific time (September 7 UTC).

## Connection

- Org: EPIC OrgFarm, Enterprise Edition, 00DgL00000c7pj3UAA.
- Project-local default alias: sport-compass.
- CLI authorization and a read-only Organization query succeeded. Credentials are not stored in this report or Git.
- The org reports IsSandbox=false; treat it as a shared development org and always target the alias explicitly.

## Saved-draft backup

- Location outside the team repository: ../sport-compass-backup-20260907-0SCVPc/
- See that folder's README.md for scope, hashes and recovery caveats.
- Retrieved AiAuthoringBundle:SportCompass_1 through API 67.0. CLI exported SportCompass.agent and SportCompass.bundle-meta.xml.
- Retrieve job: 09SgL00000dsb7QUAQ; Succeeded.
- No committed Bot metadata was returned. No agent version was committed or activated.
- Four sports subagents and global instructions are present. Generic template routes/actions remain, and the exported welcome/error messages are still generic defaults.
- This snapshot does not include referenced permission sets, user assignments, data-library indexes/files, shared action definitions or business records.

## Custom-object validation

Command (validation only):

```sh
sf project deploy start --target-org sport-compass --source-dir force-app/main/default/objects --dry-run --wait 1 --json
```

- Job: 0AfgL00000WscibSAB.
- Completed: 2026-09-07T00:56:41.000Z.
- Status: Succeeded; success=true; checkOnly=true.
- Components: 36 (3 custom objects, 33 custom fields).
- Component errors: 0.
- Objects: Sport__c, Sports_Organization__c, Sports_Program__c.
- Apex tests completed: 0. No Apex was included; this does not establish behavior, permissions, matching quality or agent readiness.
- Nothing was deployed. The report's Created entries describe proposed changes during validation, not persisted objects.

## Next step

Deploy only the validated objects after go-ahead, then configure and test least-privilege access, clearly labeled synthetic seed records, and deterministic matching. Agent cleanup and live retrieval acceptance tests remain separate work. Do not deploy the entire repository or activate the agent as part of the object-only increment.
