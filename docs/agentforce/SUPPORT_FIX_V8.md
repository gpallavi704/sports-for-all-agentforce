# Support execution regression checkpoint

Tested September 6 Pacific / September 7 UTC, 2026. Test observations below describe
the org at that checkpoint; Git publication is tracked separately.

## Fixes and results

Preparation now runs before reasoning, bound to the actual current message and the session's latest demo matcher results. It requires an exact returned program name and one explicit allowed category. The service rechecks record access and synthetic/publication flags before returning a signed draft. It saves nothing. Missing or ambiguous inputs return clarification instead of a draft.

Version 7 passed preparation, revision and cancellation checks but failed creation. The LLM claimed Case number and ID 1 without calling the creation action. The independent query found no new Case. Failed local report: `temp/support-live/2026-09-07T06-18-29-701Z.json`.

Version 8 runs the existing confirmation action deterministically only when there is a signed pending token and the actual reply is an exact accepted confirmation. Token signature, expiry, runtime-user binding, current program validation, fixed queue and idempotency remain enforced in Apex. No permissions were expanded.

The version 8 regression passed one cancellation session and one revision/confirmation session:

- Preparation displayed the service-generated full disclosure.
- Hesitation created nothing.
- Cancellation followed by two yes replies created nothing and did not prepare a replacement draft.
- Revision discarded the old draft and prepared the new category.
- Explicit yes created Case 00001011, ID 500gL00001WZFNpQAP.
- Two subsequent confirmation replies left exactly one new Case for the tested request.
- Both preview sessions ended successfully.
- Independent query verified New status, Sport Compass Support queue, demo and consent flags true, Accessibility information needs verification category, and Demo queue only response channel.

Passing local report: `temp/support-live/2026-09-07T06-23-50-947Z.json`. Raw Salesforce traces stay ignored and must not be exported because they contain internal capabilities. Reports are bounded synthetic test evidence, not production reliability estimates.

## Native confirmation caveat

`require_user_confirmation: True` remains configured. The deterministic-run preview created the Case after the first exact yes and did not show a separate native confirmation prompt. Therefore the earlier double-confirmation UI behavior is not verified for this execution mode. Do not advertise two independent confirmation gates. The actual-user-message and signed-draft checks are verified in this test. A separate trusted confirmation interface and external caller/session isolation remain release gates before external write access.

## Tests

Deployment `0AfgL00000WtgtpSAB`: 30 selected Apex tests passed, including current-message draft preparation; preparation wrapper line coverage was 34/34. Local integration tests: 42 passed. Least-privilege check passed for five denied CRM objects and six demo records. These do not replace broader security or accessibility review.

## Citation work

Version 7 browser inspection confirmed corrected title links for Try Fencing, Parafencing 101 and Parafencing Myths, but the final club finder still had a malformed citation suffix. Source dates were correctly labeled not provided. Version 9 adds an explicit formatting rule in each knowledge topic for all links, including the final navigation link. Version 9 is now active. A fresh browser test of the original beginner/equipment question displayed four correctly titled links with exact destinations: Try Fencing, Parafencing 101, Parafencing Myths and USA Fencing Club Finder. No encoded citation suffix or URL redaction appeared in those destinations. Project-prepared-summary limitations, unavailable source dates, equipment confirmation and supervision caveats were present. No em dash appeared in that answer. This verifies rendered link destinations for this response, not universal formatting or destination-site availability.

Support execution was tested on v8; v9 changes only the three knowledge-topic formatting instructions relative to v8. A single uninterrupted v9 browser journey through Case creation has not been rerun. The consent regression is a published-agent CLI preview test and the citation check is a separate actual browser test.

The synthetic Case is retained as test evidence. No real participant data, external email, SMS, phone call or official USA Fencing staff response is involved. The external integration app remains disabled.
