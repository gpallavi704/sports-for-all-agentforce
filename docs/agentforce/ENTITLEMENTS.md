# Sport Compass entitlement model

Current update: the direct Secure Base assignment has been removed from this agent and replaced with SportCompass_Knowledge_Runtime. Effective Account/Contact/Case and Messaging object checks now deny read/create/edit/delete. Runtime licenses and published program read access remain. See [security cleanup](SECURITY_CLEANUP.md). Live retrieval, generic-action removal and Data Cloud policy review are still activation gates.

## MVP identities

| Identity | Current implementation | Boundary |
| --- | --- | --- |
| Builder/admin | Existing builder user plus SportCompass_Data_Curator | Curator grants create/read/edit on only the three custom discovery objects; no delete or View All. Existing administrator privileges are additive and remain unchanged. |
| Public discovery agent | Existing Einstein Agent User plus SportCompass_Discovery_Read and membership in SportCompass_Discovery_Readers | New set grants read-only object/field access; criteria sharing grants read only when Published__c=true. This is a Salesforce group, not anonymous internet access. |
| Public visitor | Conversational persona, not a Salesforce user/profile | No own-account/case access. The future MCP/Agent API must use the intended agent identity and bind sessions to callers. |
| Authenticated member | Not implemented | Requires verified identity mapped to the member's records, explicit record authorization and own-versus-other-member tests. |

No new profiles or human users were created. Do not give anonymous users administrator or generic Salesforce API credentials. Minimum-access profiles plus additive permission sets are preferable to cloning broad profiles.

## Deployed discovery controls

- Sport__c, Sports_Organization__c and Sports_Program__c: internal and external sharing Private.
- Added Published__c=false and Is_Demo__c=false by default on each object.
- A criteria rule on each object shares Published__c=true records read-only with SportCompass_Discovery_Readers.
- That group contains only the dedicated Sport Compass agent user at this checkpoint. It does not include managers automatically.
- Reader set has no create/edit/delete/View All/Modify All grants. Organization contact email, phone and accessibility-contact fields are deliberately not granted by this set.
- Curator set grants create/read/edit to owned/shared records; it is not a substitute for system-administrator permissions.
- A program matcher must additionally enforce publication and active flags, parent publication, explicit field selection and user-mode queries. Sharing alone does not ensure business-policy eligibility.
- Published demo records remain fictional: every output must preserve their demo status. The program data has no real participant or member information.
- These rules are additive. Future grants, ownership, role hierarchy, administrator privileges or system-mode code can change effective access; maintain negative tests.

## Verified results

Salesforce UserRecordAccess was queried by the administrator for the dedicated agent user across six synthetic records:

- Published sport, organization and three programs: Read=true, Edit=false, Delete=false.
- Unpublished program: Read=false, Edit=false, Delete=false.
- See access-test-results.json for record-level evidence.
- Object metadata reports Private internal and external sharing for all three custom objects.
- Four program records have valid parent lookups and Is_Demo__c=true; their parents also carry Is_Demo__c=true.

These are effective record-access checks, not an end-to-end agent-session or Apex user-mode test. Agent activation and API integration remain pending.

## Historical CRM access finding — assignment now removed

The existing Salesforce AgentforceServiceAgentSecureBase permission set grants:

| Object | Existing object grants |
| --- | --- |
| Contact | Read and Edit |
| Case | Read and Create |

No View All Data or Modify All Data grants were observed in the inventoried agent assignments. Nevertheless, naming the set Secure Base does not make the agent discovery-only. Effective accessible CRM records depend on sharing and other execution contexts.

The shared standard set was NOT edited or deleted. Its direct assignment to this agent was subsequently removed; no other users were changed. Effective CRM object access now tests as denied. Generic service-template actions remain, and live retrieval under the reduced baseline is not yet verified. New restrictive permission sets cannot subtract existing grants; this is why the broader assignment had to be removed rather than overlaid.

## Interpreting Ajay's suggestion

An admin persona and a restricted member persona are a sensible future design. Use **least privilege**, not least restrictive. A profile controls object/field privileges, not all record visibility. Account/Contact/Case access requires separately configured sharing and identity mapping; records belonging to a member may be staff-owned, so OwnerId alone is not the identity model.

For this public MVP, expose only deliberately published discovery data. Do not make test Accounts, Contacts or Cases public merely because they are synthetic. Standard CRM sharing and records were not changed in this increment.
