# Version 17 controlled API test: lifecycle passed

September 7, 2026. The user approved temporary enablement of Sport Compass MCP
for guidance and follow-up testing, followed by restoring the disabled policy.
After the user restored the Salesforce credentials privately, the retry passed
the two-turn live Agent API lifecycle. The earlier failed attempt is preserved
below. This is not a Salesforce-backed ChatGPT test or an overall quality pass.

## Successful retry after credential restoration

- The private credential-reader check succeeded. Only success flags were printed;
  credentials were not placed in arguments, chat or project files.
- Rechecked the org identifier and retrieved the current non-secret app policy.
  It exactly matched the disabled backup before the temporary change.
- Temporarily enabled the integration, then used the existing outbound credential
  provider and fixed runtime agent to start one Agent API session.
- Question 1 asked how to start wheelchair fencing. One Inform answer returned.
- Question 2 asked what equipment to ask the club about for that first visit.
  One relevant Inform answer returned in the same session.
- The request adapter retained its external non-confirmation prefix. No support,
  email, booking, registration, personal classification or write request was made.
- Session DELETE succeeded with HTTP 200. Token revocation was acknowledged.
  No post-revocation request was made to independently prove token invalidation.
- Restored app disablement in the finally block and independently retrieved
  `isEnabled=false` afterward.
- Before and after aggregate checks returned 13 Cases and the unchanged latest
  Case modification time. No Case changes were observed. Salesforce session,
  telemetry and audit artifacts are not covered by this Case-only comparison.
- The controlled runner returned `lifecyclePassed=true` and the orchestration
  returned `completed=true`.

### Answer-quality limits

The first answer discussed finding a parafencing club and supervised introductory
learning. The follow-up suggested asking about loaner equipment and confirming
availability. Both identified project-prepared public-source summaries.

Both answers returned source titles without original clickable URLs. The first
included an insufficiently qualified statement about not requiring a personal
frame; the second included blanket athletic-shoe advice. These need domain review
and more inclusive wording before the polished demo. No per-turn retrieval/action
trace was collected in this API test, so source titles alone do not prove grounding.
The lifecycle result must not be presented as a semantic, accessibility or
responsible-AI acceptance pass.

### Successful retry evidence

- Fresh disabled-policy preflight: `09SgL00000dxO6IUAU`.
- Temporary enablement: `0AfgL00000WuvcHSAR`.
- Restore-disabled deployment: `0AfgL00000WuF5JSAV`.
- Independent disabled readback: `09SgL00000dx7WsUAI`.

## Earlier attempt

- Confirmed the authorized org identifier with a read-only query.
- Retrieved only the non-secret integration policy, Sport Compass Bot and
  authoring bundle into a Git-ignored backup. The policy initially had
  `isEnabled=false`; the retrieved Bot included version 17. The retrieved Agent
  Script matched the local source. No global OAuth metadata was retrieved.
- Added an explicit `--guidance-only` option to the existing approved API runner.
  This selects its first two fixed questions: beginner guidance and equipment
  follow-up. The five-turn matching scenario remains available separately.
- All 43 local tests passed. An unsupported runner flag was rejected before
  credential access. Local tests do not prove live authentication or grounding.
- Temporarily deployed only the policy's `isEnabled=true` change.
- The test produced no accepted lifecycle evidence. The first orchestration
  report parser did not handle a report with no preceding turn output; that
  local reporting issue was corrected. No live success is inferred from it.
- Restored the original policy in the orchestration's finally block and retrieved
  it independently. `isEnabled=false` was confirmed.
- Before and after aggregate Case checks both returned 13 Cases and the same
  latest modification time. No Case changes were observed. These aggregate
  checks are not a full audit of every org object or concurrent activity.

## Earlier credential diagnosis

The existing native Keychain helper passed its credential-free self-check.
A private call to the credential reader returned `KEYCHAIN_UNAVAILABLE`.
A metadata-only lookup for the exact expected Salesforce service/account in the
login Keychain returned item-not-found (exit code 44). No secret was requested by
that metadata lookup or printed by the credential-reader check.

This is the Salesforce client-credentials item, not the OpenAI tunnel API key.
No existing Keychain items were changed, deleted or overwritten. The ChatGPT
tunnel and its mock server were not changed.

## Earlier attempt evidence

- Initial policy/agent retrieval: `09SgL00000dwPUFUA2`.
- Temporary policy enablement: `0AfgL00000WutvRSAR`.
- Policy restore-disabled deployment: `0AfgL00000WuJf4SAF`.
- Independent disabled readback: `09SgL00000dyj8fUAA`.

## Next

Keep the integration disabled outside approved test windows. Implement and verify
the live MCP transport's authorization and caller/session isolation before
connecting Salesforce to the existing ChatGPT app. Its executable remains
mock-only. Recheck the external non-confirmation boundary against the deployed
agent separately; these two guidance turns did not exercise it adversarially.
Improve source-link rendering and equipment wording, then test the live-backed
ChatGPT journey. No external write capability is approved or enabled.
