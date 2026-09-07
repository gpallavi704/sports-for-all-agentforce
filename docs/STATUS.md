# Sport Compass current status

Connection blocker at the latest checkpoint: the private tunnel is stopped after
Keychain access failed during restart. The v4 UI is built and locally tested;
ChatGPT refresh failed and its cached manifest remains v3. Restore access to the
existing tunnel credential, restart the local public-guidance tunnel, refresh
the existing app, and test a fresh conversation. No secret values or access
controls were changed. The Salesforce agent itself was not deactivated.

Latest interactive update, September 7: the live ChatGPT app now renders public
club cards and a first-visit planner backed by the existing Salesforce guide.
The latest compact layout puts the optional checklist behind **Plan my visit**
and source details behind **Listing source**, with no three-tab dashboard.
There are four MCP tools and 69 passing local tests. Topic choices, one-step
questions and copying run locally without more AI calls. A live Wasatch card,
choice changes, keyboard navigation and manual-copy fallback passed, including
after approved CSP enforcement was enabled. A fresh combined Kaysville request
now returned Wasatch. A separate comma-free Utah lookup bug was reproduced and
fixed, with 12 Apex tests and three live public MCP search checks passing.
The v4 plan makes copying primary and gates HTML download by host capability.
ChatGPT did not complete the tested download; manual copying remains the demo
path. No additional upload, private-data access or contact integration was added.
Broader query reliability is still pending. See [search/export evidence](agentforce/SEARCH_AND_EXPORT.md) and
[interactive evidence and limits](agentforce/INTERACTIVE_FIRST_VISIT.md).
Everything below records earlier checkpoints, not the current tool count.

Latest connection update, September 7: the Salesforce-backed public MCP smoke test passed three turns and session cleanup. SportCompassGuide version 1 is active, the original SportCompass version 17 is unchanged, and the private tunnel now runs the live public profile. The integration is enabled for this approved demo. All 53 local tests pass. A fresh ChatGPT conversation returned Wasatch Fencing Club and clickable public links through the live connector. The branded Sport Compass app is now connected with its icon and three public-guidance tools. Broader acceptance testing remains pending. See [live public connection](agentforce/LIVE_PUBLIC_CHATGPT.md). Earlier mock-only and disabled-policy statements below describe previous checkpoints.

Checkpoint: September 6 Pacific / September 7 UTC, 2026. This page supersedes active-version and pending-work statements in earlier checkpoints.

Latest update: version 17 is active with mobile-length instructions and no automatic closing offers. Version 11 replaced the historical classification summary in the indexed library and the user's six-turn test returned helpful classification boundaries without old numerical requirements. See [current presentation evidence](agentforce/RESPONSE_PRESENTATION_V12.md). The 43 local tests pass. Historical CLI URL-check failures remain documented in [channel limits](agentforce/RESPONSE_PRESENTATION_V10.md). The full current-version support journey and headless client remain pending.

## Implemented

Latest live API checkpoint: after the user restored the Salesforce credentials privately, the version 17 guidance-only test passed session start, two Inform responses, contextual follow-up and session end. Token revocation was acknowledged and app disablement independently verified after the test. Case aggregates were unchanged. Source-link rendering and equipment wording still need improvement; this is a lifecycle pass, not full answer-quality acceptance. The OpenAI tunnel and connected ChatGPT mock were not changed. See [version 17 API checkpoint](agentforce/LIVE_GUIDANCE_V17.md).

ChatGPT connection checkpoint: **Sport Compass Test** is connected through the **Sport Compass Development** Secure MCP Tunnel. The user reported successful start, message and end tool results in ChatGPT, all explicitly local mock with no Salesforce access. App visibility and local tunnel health were independently checked; the remote raw tool trace was not independently reviewed. All 43 local tests and the stdio smoke test passed at that checkpoint. The separate live Salesforce guidance API test now passes, but Salesforce-backed MCP remains pending. See [tunnel checkpoint](agentforce/CHATGPT_TUNNEL_CHECKPOINT.md).

Email presentation: version 17 uses a copyable draft addressed to Sport Compass Team. The real test inbox stays in org configuration and is omitted from action output. The redacted mailto/button path is removed; sending is not implemented. See [Preview fallback](agentforce/EMAIL_PREVIEW_V16.md).

Latest support checkpoint: the exact confirmation phrase is fixed and a live CLI regression created only synthetic Case 00001012, with no duplicate. The subsequent conversational disclosure deployment passed 12 support Apex tests; its fresh browser retest remains pending. See [support update](agentforce/SUPPORT_CONVERSATIONAL_V12.md). Version 17 remains active.

- Salesforce DX project, dedicated agent runtime identity and scoped permissions.
- Three discovery objects with 39 fields, private sharing and six synthetic records: one sport, one organization, three published programs and one unpublished negative fixture.
- Ten indexed public-source summaries, prepared by the project and not approved by USA Fencing.
- Version 17 active, with seven routes, eight external action definitions and twenty exact public URLs.
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
| Local integration suite | 43 tests passed | Mocks do not prove live ChatGPT behavior |
| Discovery | Two v6 five-turn CLI sessions passed 10 targeted checks and lookup traces | Not a full browser journey or reliability estimate |
| Support | v8 preparation, hesitation, cancellation, revision, confirmation and retries passed | Published-agent CLI preview |
| Actual support record | Synthetic Case 00001011 verified in the support queue; retries produced no duplicate for the request | No real participant or provider contact |
| Knowledge links | v9 browser answer rendered four exact source/navigation destinations without citation suffixes | One answer; destination sites were not opened |
| Least privilege | Five denied CRM objects and six demo records checked | Data Cloud and external caller isolation need separate review |
| Agent API | Current v17 two-turn guidance lifecycle passed after credential restoration; historical v2 matching checks passed | Current matching, adversarial consent/isolation, clickable citations and inclusive equipment wording need separate validation |

Ten synthetic Cases, 00001003 through 00001012, are recorded as test evidence. No Cases were removed during this update.

The native confirmation setting remains enabled, but v8 deterministic execution created the Case after the first exact accepted confirmation without a second native prompt. Only the observed actual-message and signed-draft gates should be claimed. See [support evidence](agentforce/SUPPORT_FIX_V8.md).

Earlier v6 browser and v7 support failures remain documented. Their passing successors do not establish a complete end-to-end acceptance pass.

## Pending, in order

1. Record one uninterrupted current-version Salesforce journey: cited guidance, discovery, support draft, cancellation/revision, explicit confirmation, returned Case and queue verification.
2. Expand failure, expiry, concurrency, grounding and multi-turn tests.
3. Build on the passing v17 guidance API lifecycle with current matching, source-link and equipment-wording regressions. Verify external non-confirmation and caller/session isolation separately. Keep the integration disabled outside approved test windows.
4. Implement and validate the live MCP boundary before connecting Salesforce. ChatGPT mock start/message/end succeeded according to the user's reported results. The executable currently supports mocks only. Tunnel visibility does not prove per-user authentication or session isolation. External writes require a trusted confirmation interface.
5. Obtain domain review, verified provider data, official support routes and an agreed translation contract/language if multilingual output is included.
6. Run the organizer-provided Accessibility Expert Skill and RAI Self Check Skill. They are not installed in this session. Complete keyboard/screen-reader, plain-language and adversarial testing on the chosen client.
7. Confirm submission limits, distinguish built from planned architecture, and prepare captions, recording and evidence-backed impact claims.

## Out of the current MVP

Voice, native mobile, additional sports, enrollment, payments, distance search, live capacity/fees, production participant data and disability/eligibility prediction. Data Cloud analytics are optional; CRM permissions alone do not govern Data Cloud. The synthetic Case report does not demonstrate real population demand.

Conversation context is not a source of truth for changing club results or consent. Matching is deterministic and the credential provider caches short-lived tokens; there is no shared cache of personalized answers or consent capabilities.
