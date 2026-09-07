# Synthetic support handoff checkpoint

September 6 Pacific / September 7 UTC, 2026. Implemented within the existing Salesforce/Agentforce architecture. The agent remains inactive and uncommitted; no external API, MCP or ChatGPT deployment is claimed.

## Delivered

- PrepareSportsSupportAction: validates a selected published demo program and its visible parents, accepts one of four structured reasons, returns the complete proposed support summary and a signed, expiring internal draft token. No Case or participant record is created during preparation.
- CreateSportsSupportCaseAction: validates the signature, runtime user, expiry and current program snapshot, then accepts only exact allowlisted confirmation phrases. It never accepts a model-generated consent boolean. Agent Script binds latestUserMessage to the read-only system user_input variable.
- SportCompassSupportService: explicit custom-permission check; user-mode discovery reads; a narrow private privileged broker creates only the fixed synthetic Case projection and reads only the matching runtime-user/request-key Case result. The runtime agent still has no generic Case CRUD.
- A unique Case request key makes retries return the same Case. The same token cannot change the support data; stale program data requires a new draft. Atomic unique-key enforcement protects insertion races; a simultaneous-race integration test remains pending.
- Support_Request is a sixth journey. Internal conversation variables retain the draft, token, state and real Case result. Pending drafts route back to support; there is no model setVariables action for the token.
- Native Agentforce action confirmation is enabled as an additional gate. In the tested preview it asks for a second yes after the initial conversational yes. Do not remove this gate without re-evaluating consent behavior; reduce friction only after the safety tests pass.
- Case record type/business process, ten custom Case fields, Sport Compass Support queue, two filtered list views and a summary report of unresolved synthetic Cases by category.
- Existing builder is the human queue member and receives Support Operator permissions. The public agent is not a queue member and receives only class access plus the custom support capability, not general Case object access.

## Live evidence

One uninterrupted draft-preview session performed matching, selected DEMO - Youth Program Needs Confirmation, displayed the complete support draft, refused hesitant consent and created a real synthetic Case only after explicit/native confirmation.

| Stage | Observed result |
| --- | --- |
| Before preparation | Zero synthetic support Cases |
| Draft shown | Program, location, reason, unknown accessibility, destination, no-callback limitation and exact stored-data categories disclosed |
| “I guess so” | No creation claim; org query still returned zero synthetic Cases |
| First “yes” | Native action confirmation prompt; zero synthetic Cases |
| Native “yes” | Case 00001003, ID 500gL00001WYXJZQA5 created |
| Queue check | Owner is Sport Compass Support; New status; demo and consent flags true |
| Waiting list view | REST returned the actual Case as its single row |
| Summary report | Returned one unresolved request under Accessibility information needs verification |
| Duplicate-request conversation | Returned the same Case identifiers; did not prepare or claim another Case. Apex tests independently exercise actual repeated service invocation. |

The synthetic Case is intentionally retained for the demo. It contains no participant, diagnosis, age, contact information or transcript. Standard Salesforce audit fields and the runtime identity are retained.

## Security and operational limits

- HMAC key is generated inside Salesforce by scripts/setup-support.apex and is never printed, embedded in metadata, or committed. Only the hierarchy-setting schema is in Git. Do not export its record data or raw preview traces. Setup is idempotent and does not rotate a configured key.
- Direct agent access to the signing-setting object was checked as read/create/edit/delete false. Org administrators can still access configuration; this prototype does not claim managed-package secret isolation or external KMS support.
- Tokens are internal capabilities, hidden from model output and bound to the Salesforce runtime user. This is not proof of authenticated end-user/session isolation across an external API. MCP caller binding, rate limits, token replay/revocation policy and deployment secret lifecycle remain release gates.
- Agentforce session memory and native confirmation remain part of the consent boundary. Cancellation/revision conversation behavior and adversarial sequences need repeated live tests; unit-level refusal/revision is tested. Token expiry is 30 minutes; cancellation clears conversation state but there is no server-side revocation store before consent.
- No contact channel is implemented. Demo queue only means no actual callback or official USA Fencing staff service. No emails/SMS are sent by this service; email flags are disabled. No active Case Apex triggers or Case record-triggered flows were found in the pre-test inspection. This is not an exhaustive workflow/security audit.
- Human operators remain subject to record sharing. The builder already has administrator privileges; this increment does not prove a separate restricted human-operator persona.
- One synthetic Case report measures demo operations only, not population demand, conversion or social impact. An anonymous interaction analytics action/object is still deferred.
- No real providers, fees, scholarships, medical/eligibility decisions, registration or payments.

## Tests and deployment

- Apex deployment: 0AfgL00000Wsx0fSAB; all 18 combined tests passed.
- MatchSportsProgramsAction: 101/101 covered lines.
- PrepareSportsSupportAction and CreateSportsSupportCaseAction: 9/9 each.
- SportCompassSupportService: 84/88 covered lines. Error/race branch coverage and a true concurrent retry test remain improvements; line coverage is not full security assurance.
- Report deployment: 0AfgL00000WsxK1SAJ. Builder operator permission deployment: 0AfgL00000Wsx3tSAB.
- Six-journey Agent Script compiles and local structural checks verify actual-user-input binding, fixed token binding, native confirmation and no commit target.
- Inactive draft deployment: 0AfgL00000Wsy81SAB. KB06 and KB07 retrieval/boundary regressions passed after the support route was added. Sanitized evidence: support-handoff-verification.json.

Implementation references: [Salesforce system variables](https://developer.salesforce.com/docs/ai/agentforce/guide/ascript-ref-variables-system.html), [action confirmation and bindings](https://developer.salesforce.com/docs/ai/agentforce/guide/ascript-ref-actions.html), and [Apex cryptographic techniques](https://developer.salesforce.com/blogs/2023/12/encryption-and-signature-techniques-in-apex). Runtime compilation and actual tests, not documentation alone, validate the org-specific implementation.

## Operator links in this hackathon org

- [Synthetic Case 00001003](https://orgfarm-4d89d5ac56.lightning.force.com/lightning/r/Case/500gL00001WYXJZQA5/view)
- [Waiting for assistance](https://orgfarm-4d89d5ac56.lightning.force.com/lightning/o/Case/list?filterName=00BgL00000l5KO3UAM)
- [Accessibility verification](https://orgfarm-4d89d5ac56.lightning.force.com/lightning/o/Case/list?filterName=00BgL00000l5KO2UAM)
- [Unresolved demo support by category](https://orgfarm-4d89d5ac56.lightning.force.com/lightning/r/Report/00OgL00000DwurxUAB/view)

## Next

Repeat full consent/refusal/revision/error journeys, including three-run acceptance and attempts to override the raw-user-input binding. Validate one minimal externally authenticated Agent API session only after explicit activation approval; then add protected MCP/ChatGPT integration, one reviewed language, accessibility/RAI evidence and the submission recording.
