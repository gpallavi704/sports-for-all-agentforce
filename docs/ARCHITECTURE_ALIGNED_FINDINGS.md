# Architecture-aligned findings from the team's other chat

User supplied September 6, 2026, following discussion of another hackathon submission. This records the supplied direction and our implementation reconciliation; the original competitor submission and judging results have not been independently reviewed here. Treat proposals as requirements to evaluate, not evidence of completed features.

## Preserve the architecture

Sports for All / Sport Compass; fencing and wheelchair fencing as the reference journey; ChatGPT → protected MCP server → Agentforce Agent API; existing five journeys, ten curated public-source summaries, trusted URLs and three discovery objects. Direct Agentforce is the demo fallback. No redesign, new public website, extra sports, voice, payments or registration processing.

## Strongest demonstration

A fictional parent near Salt Lake City seeks a sport for a 12-year-old with self-selected mobility preferences. Show cited guidance, structured demo matches, reasons and unknowns, classification boundaries, a support draft, clear confirmation, the real created Case identifier and its appearance in a Salesforce support queue. Measure unresolved information without retaining transcripts or diagnoses.

The differentiator is a visible completed handoff, not a broader chatbot feature list. This is product judgment, not a prediction of winning or a verified judging score.

## Reconciliation with what is built

This section records the state when the findings arrived. Subsequent support implementation is tracked in [current status](STATUS.md) and [support handoff](agentforce/SUPPORT_HANDOFF.md); do not treat the following historical pending list as today's status.

- Matcher: core read-only deterministic demo matching is deployed and live-tested. Current inputs are city/state, optional age, experience and feature preferences. Postal/radius lookup, interests, competitive/recreational goals, costs/scholarships and source/verification output fields remain gaps against the broader proposal.
- Knowledge: source-grounded guidance is tested separately. Do not claim the combined end-to-end journey is already complete.
- Support: Case action, confirmation state, record type, queue, consent fields, list views and report are not built.
- Integration: Agent API activation/configuration, MCP hosting/authentication/session binding and ChatGPT connection remain pending.
- Measurement, additional language and final accessibility/RAI evidence remain pending.

## Engineering refinements before implementation

1. Bind approval to the exact displayed support draft and caller/session; edits invalidate prior approval. A model-supplied consent boolean is not sufficient. Hesitation, silence or refusal creates no Case.
2. Enforce idempotency in the server action with a unique request key bound to the draft/session. Repeated confirmation or network retry returns the existing result rather than another Case.
3. Keep support reasons structured and summaries minimal. Do not depend solely on a prompt to exclude medical data. Define safe input validation and decline sensitive narrative intake.
4. Define the support identity and narrowly scoped creation authority before granting Case permissions. Do not restore the broad Secure Base assignment.
5. Choose a reply channel and contact-handling policy honestly. A preferred channel without contact information cannot support a real callback. No email/SMS delivery is included by default.
6. Do not assume ChatGPT provides a trustworthy stable conversation ID. Verify available connector metadata; use authenticated server-owned session handles and bind them to the caller. Never accept an arbitrary Agentforce session ID as authorization.
7. Separate preparing and confirming support requests. Tool names/contracts are proposed until the runtime integration is validated. Feedback/analytics must not become an unnecessary third-party or transcript collection path.
8. Return the actual created Case identifier and human-readable Case number where appropriate, only after successful creation; restrict record visibility and public navigation links.
9. Scope minimized interaction analytics and retention explicitly, including whether the synthetic MVP needs a new interaction object or a Case-based aggregate report is enough.

## Acceptance and evidence

Run key scenarios at least three times: citations, no invented programs, demo disclosure, unknown accessibility, classification refusal, historical-rule caveats, unpublished access denial, injection handling, hesitant consent/zero Cases, explicit consent/one Case, failed-action/no false success, queue visibility and translation fidelity. Three runs are a demo baseline, not statistical proof of reliability.

Prepare one uninterrupted confirmation → Agentforce action → returned Case → queue demonstration, captions, judge test prompt/guide, screenshots, sanitized tests, updated architecture and limitations. Three-minute primary and five-minute backup videos are proposed; verify actual organizer limits. Mandatory Accessibility Expert and RAI Self Check still require the organizer-provided environment.

## Execution order

1. Complete current matcher checkpoint and source-control it.
2. Design/build consent-enforced, idempotent support action together with its minimum Case fields and queue dependencies.
3. Wire persistent confirmation state and test the complete flow directly in Agentforce.
4. Build protected MCP/Agent API integration and ChatGPT connection.
5. Add minimized reporting, one reviewed additional language and repeated evaluations.
6. Freeze scope; produce submission evidence.
