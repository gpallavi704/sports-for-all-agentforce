# First published Agent API test - transport passes, matching fails

Historical v1 checkpoint. See [version 2 remediation](MATCHING_FIX_V2.md) for the
subsequent greeting/routing changes and targeted passing regressions. Version 2 is
active for controlled testing; the integration app remains disabled.

September 6 Pacific / September 7 UTC, 2026.

## State

Sport Compass was published as version 1 and activated with user approval.
Runtime agent ID: `0XxgL000002YnZpSAK`. After detecting a grounding failure,
version 1 was **deactivated** successfully. The External Client App is also
**disabled**. The authoring draft is preserved for debugging and preview.
No Git commit/push, ChatGPT connection or public endpoint was created.

## Tested

One authenticated Agent API session completed three synthetic turns:

1. Beginner wheelchair-fencing guidance with public source URLs.
2. A contextual follow-up about first-visit equipment, including a loaner-gear
   caveat and a project-prepared-source disclosure.
3. Adult beginner program discovery in Salt Lake City with mobility/equipment
   preferences and unknown-feature disclosure.

Session start, three Inform responses and session DELETE succeeded. Token
revocation was acknowledged. This establishes API transport/lifecycle operation,
not semantic correctness or a complete external security/consent test.

## Failed acceptance: invented program records

Turn 3 returned names not present in the live Salesforce records:

- Salt Lake Parafencing Starters (Demo Data)
- Wasatch Wheelchair Fencing Intro (Demo Data)
- Salt Flats Inclusive Fencing (Demo Data)

The actual published seed names are `DEMO - Youth Wheelchair Fencing Intro`,
`DEMO - Adult Wheelchair Fencing Intro` and `DEMO - Youth Program Needs Confirmation`.
A fourth security fixture is unpublished and must remain excluded. The live
read-only admin query confirmed those source names. The response's demo notices
do not excuse inventing records or simulated accessibility attributes.

Root cause is not yet established. Published metadata contains a matcher action
link, but that does not prove it executed. Investigate compiled-script association,
runtime topic routing, action invocation and response grounding before republishing.
Do not simply rename the invented examples to make the test appear to pass.

Knowledge answers included public URLs and retrieval dates, but no per-action
trace was collected here to prove retrieval for every assertion. The first answer
made a broad introductory classification/disability statement requiring review;
the footwear guidance should also be tailored rather than treated as universal
for wheelchair participants. These turns are observations, not a completed
domain or accessibility acceptance review.

## Evidence

- Before publish, the retrieved org Agent Script matched the local source.
- `sf agent publish authoring-bundle --api-name SportCompass` succeeded.
- `sf agent activate --api-name SportCompass --version 1` succeeded.
- BotDefinition query resolved the runtime ID above.
- Integration-app temporary enable: `0AfgL00000WtOLpSAN`.
- Integration-app restore-disabled: `0AfgL00000WtGwASAV`.
- Disabled app readback: `09SgL00000duXNpUAM`.
- `sf agent deactivate --api-name SportCompass` succeeded for version 1.
- Post-publication authoring draft retrieval: `09SgL00000duXajUAE`.
- Runner: `mcp-server/scripts/check-agent-session.mjs`. It reports
  `lifecyclePassed`, deliberately not an overall quality pass. It closes a known
  session and requests token revocation in a finally block. An ambiguous start
  failure before receiving a session ID remains a cleanup limitation.

## Next

Fix and retest the grounded program path in both a fresh session and a
knowledge-to-matching topic transition. Verify exact record names, no invented
features, private-fixture exclusion, unknown accessibility and explicit demo
disclosure. Recheck classification and external non-confirmation boundaries.
Only then resume activation and ChatGPT/MCP integration.
