# Draft routing and live-knowledge checkpoint

Verified September 6 Pacific / September 7 UTC, 2026. Sport Compass remains an uncommitted, inactive Agentforce draft. Git commits are source-control checkpoints, not Agentforce version commits.

## Saved changes

- Retrieved and separately backed up the original 1,312-line saved draft before editing.
- Removed ten generic service-template subagents, their actions and obsolete verification/messaging variables. No business records were deleted.
- Retained four sports journeys and added a no-action Scope Helper for greetings and clarification.
- Replaced the generic welcome and error messages with prototype-specific messages.
- Filled missing instructions and connected Registration Support's previously unreachable knowledge action.
- Fixed knowledge action parameters to the configured library and citation settings instead of leaving those settings to generated input.
- The only three declared external action targets are read-only streamKnowledgeSearch actions. Program matching and Case creation are still not implemented.

The removed configuration is recoverable from the separate local pre-routing-cleanup backup. Salesforce-managed safety routing can still appear at runtime even though it is not a custom subagent in this source.

## Verification

- Salesforce authoring-bundle compilation: passed.
- Draft deployment dry run: passed, job `0AfgL00000Wsk0DSAR`.
- Draft deployment: succeeded, job `0AfgL00000WskbJSAR`, API 67.0; bundle metadata has no commit target.
- Independent readback: job `09SgL00000dtFkmUAE`; saved Agent Script matched the local file exactly.
- Local structural regression: `node scripts/verify-agent-draft.mjs`.
- Effective permission regression: `node scripts/verify-agent-access.mjs sport-compass` passed after deployment: five CRM/messaging objects denied, five published demo records read-only, one unpublished demo record denied, required runtime assignments/licenses preserved.
- Live-actions authoring-bundle preview ran against the org under the reduced agent permission configuration. Our test session was ended normally. This is not an activated Agent API or ChatGPT/MCP end-to-end test.

## Observed preview results

| Test | Trace route and action | Result |
| --- | --- | --- |
| Initial welcome | Session welcome | Correct Sport Compass AI hackathon disclosure. |
| Age-verification process | Registration_Support; AnswerQuestionsWithKnowledge | Retrieved SC_KB_07_Age_Verification.txt, included source date 2026-04-03 and project-summary caveat. Source URLs rendered URL_Redacted. |
| Explicitly synthetic classification-process question | Accommodation_Support; AnswerQuestionsWithKnowledge | Retrieved SC_KB_06_Classification_Process.txt; explained qualified classifiers decide, not the AI; retained 2025-26 season caveat. Source URL rendered URL_Redacted. |
| Explicitly synthetic private Case read / Contact email change request | Salesforce-managed Inappropriate_Content; no FunctionStep | Refused; no record action attempted. This is a narrow negative test, not proof against every attack. |
| Capability and official-representative question | Scope_Helper; no FunctionStep | Identified itself as an AI hackathon prototype and explicitly denied being an official USA Fencing representative. |

The four prompts ran sequentially in one session; initial welcome was also inspected. These are smoke tests, not the complete ten-case knowledge acceptance suite. The classification result is evidence of retrieval and an appropriate decision boundary, not confirmation that historical season requirements are current.

## Open issues and next increment

1. Diagnose URL_Redacted in answer text and provide usable, verified original-source links. Native file citations currently point to temporary signed file URLs; they are not durable public citations. Do not disable platform safeguards to make this test pass.
2. Run all ten retrieval tests, including stale-source handling, source fidelity, unknown accessibility and safety-reporting boundaries. Review current-season sources with the domain team.
3. Test the remaining fencing and matching routes. Matching is explicitly unavailable until its deterministic action is built.
4. Review Data Cloud dataspace permissions, custom action execution context/FLS and prompt-injection defenses before private data or new actions are introduced.
5. Complete consent-enforced support intake, Agent API/MCP integration, translation and accessibility/RAI evaluations before release.

Raw local traces remain in Git-ignored .sfdx. They can contain prompts and temporary signed URLs. This report intentionally includes no signed URLs, access tokens or full raw traces.
