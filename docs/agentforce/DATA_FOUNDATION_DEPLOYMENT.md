# Data foundation deployment checkpoint

September 6, 2026 Pacific / September 7 UTC. Target: sport-compass, org 00DgL00000c7pj3UAA.

## Applied

1. Original schema: deployment 0AfgL00000Wse7hSAB, Succeeded, 36 components (3 objects, 33 fields), checkOnly=false.
2. Security increment: dry run 0AfgL00000WsePRSAZ succeeded; deployment 0AfgL00000WsF9KSAV succeeded, 51 components, checkOnly=false. Scope: three custom objects and 39 fields total, two permission sets, one group and three sharing criteria rules.
3. SportCompass_Discovery_Read assigned to the existing Sport Compass agent user.
4. SportCompass_Data_Curator assigned to the builder user. Initial import failed before creating any record due to missing FLS; after this scoped assignment and a duplicate check, the retry succeeded.
5. Discovery group 00GgL00000J1HofUAF contains agent user 005gL00000Nf47FQAR through membership 011gL000004OnIDQA0.
6. Six synthetic records imported: one sport, one organization, four programs (three published, one private negative test). See data/synthetic/ and access-test-results.json.

## Verification

- All three objects report Private internal/external sharing.
- Published demo records: agent read only; no edit/delete.
- Unpublished demo program: agent has no access.
- Parent references, publication flags and demo markers verified.
- No Apex included or tested. No custom action, runtime agent integration or complete security certification implied.
- No Accounts/Contacts/Cases created or modified; their sharing defaults were not changed.
- No agent commit or activation.
- Git publication is tracked by repository history; it is separate from org deployment and agent activation.

## Remaining work

Resolve the existing Contact/Case grants documented in ENTITLEMENTS.md before activation. Build deterministic matching with user-mode access and publication filters; then consent-enforced support intake, actual retrieval tests, agent routing cleanup, Agent API and MCP.

The original draft backup remains in ../sport-compass-backup-20260907-0SCVPc/. Do not use it as a full-org rollback. No records were deleted in this increment.
