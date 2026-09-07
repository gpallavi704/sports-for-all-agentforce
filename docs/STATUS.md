# Sport Compass current status

Checkpoint: September 6 Pacific / September 7 UTC, 2026. This page supersedes active-version and pending-work statements in earlier checkpoints.

## Implemented

- Salesforce DX project, dedicated agent runtime identity and scoped permissions.
- Three discovery objects with 39 fields, private sharing and six synthetic records: one sport, one organization, three published programs and one unpublished negative fixture.
- Ten indexed public-source summaries, prepared by the project and not approved by USA Fencing.
- Version 9 active, with seven routes, eight external action definitions and twenty exact public URLs.
- Two source-checked public club identities: Salt City Swords in Salt Lake City and Wasatch Fencing in Kaysville. Accessibility, equipment and class availability remain unverified.
- Separate real-club and fictional-program actions bound to the actual current message before reasoning.
- Signed support drafts, deterministic reply review and confirmation, expiry and server-side validation, idempotent synthetic Case creation and a fixed queue. Cancellation and revision invalidate pending drafts.
- Support fields, record type, operator list views and a category summary report. No real callback, email or official staff-response integration.
- Local Agent API client, caller-bound session broker, three MCP contracts, mock-only stdio server, outbound credential provider and macOS Keychain helper source.
- Dedicated API-only identity and scoped External Client App configured. The app is disabled; secrets stay local.

## Verified evidence and limits

| Check | Observed result | Limit |
| --- | --- | --- |
| Selected Apex suite | 30 tests passed on deployment `0AfgL00000WtgtpSAB` | Not all org tests or security certification |
| Local integration suite | 42 tests passed | Mocks do not prove live ChatGPT behavior |
| Discovery | Two v6 five-turn CLI sessions passed 10 targeted checks and lookup traces | Not a full browser journey or reliability estimate |
| Support | v8 preparation, hesitation, cancellation, revision, confirmation and retries passed | Published-agent CLI preview |
| Actual support record | Synthetic Case 00001011 verified in the support queue; retries produced no duplicate for the request | No real participant or provider contact |
| Knowledge links | v9 browser answer rendered four exact source/navigation destinations without citation suffixes | One answer; destination sites were not opened |
| Least privilege | Five denied CRM objects and six demo records checked | Data Cloud and external caller isolation need separate review |
| Agent API | Historical v2 lifecycle and targeted matching checks passed | Current-version API regression remains pending |

Nine synthetic Cases, 00001003 through 00001011, remain as test evidence. No Cases were removed during repository cleanup.

The native confirmation setting remains enabled, but v8 deterministic execution created the Case after the first exact accepted confirmation without a second native prompt. Only the observed actual-message and signed-draft gates should be claimed. See [support evidence](agentforce/SUPPORT_FIX_V8.md).

Earlier v6 browser and v7 support failures remain documented. Their passing successors do not establish a complete end-to-end acceptance pass.

## Pending, in order

1. Record one uninterrupted v9 Salesforce journey: cited guidance, discovery, support draft, cancellation/revision, explicit confirmation, returned Case and queue verification.
2. Expand failure, expiry, concurrency, grounding and multi-turn tests.
3. Revalidate the current agent through the API in a controlled enable/test/disable window. Verify external non-confirmation and caller/session isolation.
4. Implement authenticated MCP transport and a connection method, then connect ChatGPT. The executable currently supports mocks only. External writes require a trusted confirmation interface.
5. Obtain domain review, verified provider data, official support routes and an agreed translation contract/language if multilingual output is included.
6. Run the organizer-provided Accessibility Expert Skill and RAI Self Check Skill. They are not installed in this session. Complete keyboard/screen-reader, plain-language and adversarial testing on the chosen client.
7. Confirm submission limits, distinguish built from planned architecture, and prepare captions, recording and evidence-backed impact claims.

## Out of the current MVP

Voice, native mobile, additional sports, enrollment, payments, distance search, live capacity/fees, production participant data and disability/eligibility prediction. Data Cloud analytics are optional; CRM permissions alone do not govern Data Cloud. The synthetic Case report does not demonstrate real population demand.

Conversation context is not a source of truth for changing club results or consent. Matching is deterministic and the credential provider caches short-lived tokens; there is no shared cache of personalized answers or consent capabilities.
