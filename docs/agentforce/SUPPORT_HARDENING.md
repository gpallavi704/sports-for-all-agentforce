# Support cancellation and integration checkpoint

September 6 Pacific / September 7 UTC, 2026. Supersedes the cancellation-pending
state in the earlier [support handoff checkpoint](SUPPORT_HANDOFF.md).

## Defect found and corrected

The baseline preview acknowledged “no” but retained the signed pending draft.
A later “yes” reopened native confirmation. No Case was created in that test.
Native confirmation meant the write action was not necessarily called on refusal,
so cleanup could not depend on that action running.

The new pure Apex ReviewSportsSupportReplyAction executes before LLM reasoning
and classifies the actual system user_input. Decline/revision clears draft state.
The confirmation action is only available for an exact confirmed reply and an
existing token. Preparation is unavailable for an isolated confirmation, decline
or revision instruction. A cancelled draft cannot be silently recreated by yes.

This adds a small deterministic Apex invocation, not another generative-model
review. Native write confirmation remains enabled. It may require a second yes.

## Verification

- Initial tightened run passed data-mutation checks, but one response still
  misleadingly invited another yes after cancellation. We strengthened the
  availability rule and test assertions before accepting the final version.
- Final suite: three fresh cancellation sessions and three fresh revised-request
  sessions. Each cancellation sequence included “I guess so”, “no”, “yes”, “yes”:
  zero new Cases and no additional Prepare/Confirm action after cancellation.
- Each revised-request sequence changed Equipment question to Accessibility
  information needs verification, rejected “probably”, created exactly one Case
  after explicit/native confirmation, then retained exactly one after retries.
- Final Cases: 00001007, 00001008, 00001009, all owned by Sport Compass Support.
  Earlier test Cases 00001004–00001006 and baseline 00001003 are retained. These
  are fictional queue records, not real support demand or staff callbacks.
- All preview sessions ended. Evidence is sanitized in
  [the regression report](support-cancellation-regression-2026-09-07.json).
- Twenty Apex tests passed, including pure-review/no-query/no-DML checks and a
  new test that prefixed external model text cannot authorize Case creation.
- KB06/KB07 retests retained citations and public links, refused personal
  classification and directed identity uploads away from chat. Observed answers
  were manually reviewed; this is not comprehensive knowledge acceptance.
- Local integration core: 15 mocked tests. No live Agent API/MCP claim.

## Deployment evidence

- Reply-review/service/runtime-permission deployment: `0AfgL00000Wt01lSAB`.
- Final test-class deployment, 20 tests / 0 failures: `0AfgL00000Wt1fNSAR`.
- Final inactive authoring-bundle deployment: `0AfgL00000Wt00ASAR`.
- Independent retrieve: `09SgL00000dtlKnUAI`.
- Final Agent Script SHA-256:
  `b07f77b2160e43ed4107e2b899ee4d9b2b5d3fa8bb9e1e5edb1e4b6e98b95b7b`.

## Boundaries not solved by this checkpoint

Cancellation removes conversation state; it does not create a server-side token
revocation record. Signed capabilities are runtime-user-bound, not yet verified
external-person/session-bound. Live concurrency, expiry, credential lifecycle,
distributed session storage and a trusted external confirmation interface remain
release gates. Prompt instructions and three successful runs are not proof of
production readiness.

Reply classification uses explicit English phrases, not multilingual intent
understanding. Unrecognized free-form cancellation/revision language does not
authorize creation, but may leave the pending draft until a recognized cancel or
revision is entered. Expand and test this before claiming natural-language or
multilingual cancellation coverage.

The [integration core](../../mcp-server/README.md) deliberately forwards only
non-confirming model input. API activation, OAuth-protected MCP hosting and a live
ChatGPT connection still require setup and approval. No broad permissions, public
endpoint, real participant data or outbound contact was introduced.
