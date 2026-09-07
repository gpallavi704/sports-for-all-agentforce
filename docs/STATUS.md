# Sport Compass build status

Updated September 6 Pacific / September 7 UTC, 2026. Current product: fencing reference MVP, extensible to other sports. Primary planned client: ChatGPT through MCP and Agentforce API. The Agentforce agent is still an inactive draft.

The [architecture-aligned findings](ARCHITECTURE_ALIGNED_FINDINGS.md) preserve this architecture and prioritize a provable consent → Case → human-queue handoff. They also identify proposed matcher fields not yet implemented; no scope expansion is silently marked complete.

## Implemented and verified

- Private GitHub repository, Salesforce DX project, authenticated CLI and source-control checkpoints.
- Dedicated agent user, three discovery objects with 39 fields, private sharing and six synthetic records (one sport, one organization, three published programs, one unpublished negative fixture).
- Discovery read permissions and publication-based sharing. Effective Account, Contact, Case and messaging CRUD denied. No general read-all API user.
- Ten indexed public-source knowledge summaries with source metadata. These are project-prepared, not USA Fencing-approved.
- Six custom routing paths including demo support, AI/prototype disclosure, source-grounded knowledge actions, classification/process boundaries and historical-source caveats.
- Four exact Trusted URL hosts with image-only CSP; no new wildcard or connection/frame/media/camera/microphone grants.
- Ten knowledge fixtures returned expected source documents and readable public URLs; targeted classification/privacy/navigation checks passed in observed tests. Broader acceptance remains open.
- Read-only MatchSportsProgramsAction and its class-access-only permission set deployed. Ten Apex tests passed with 100% matcher line coverage, including object denial, record sharing and hidden parent records. Line coverage is not proof of every security property.
- Matcher wired into Find My Sport in the inactive draft. Live demo matching, no-match and private-data/write-request refusal checks passed; unknown accessibility remains visible.
- Consent-controlled demo Case service, signed draft preparation, actual-user-message binding, native confirmation and idempotent retries deployed; 18 combined Apex tests passed.
- Sport Compass Support queue, Case record type/fields, builder operator access, two list views and an unresolved-category summary report deployed.
- Live matching → displayed draft → hesitant consent/zero Cases → explicit/native confirmation → actual Case 00001003 → queue/list/report verified. One synthetic Case retained for the demo; no real participant data or external callback channel.

See [program matching](agentforce/PROGRAM_MATCHING.md) and [support handoff](agentforce/SUPPORT_HANDOFF.md) for evidence and limits. The older dated checkpoints are historical evidence, not the current build state.

## Pending — critical path

| Work | Completion condition |
| --- | --- |
| Support acceptance/hardening | Repeat live refusal/revision/error paths; validate cancellation and expiry across turns, concurrency and caller/session isolation. Keep intake synthetic and structured; no callback channel is implemented. |
| Agent API | Confirm external-client-app capability and minimum OAuth scopes; scoped runtime identity; commit/activation only after approval; start/send/end session, error and isolation tests. |
| MCP and ChatGPT | Tool contracts, protected server deployment, secret management, caller-to-session binding, input/rate limits, no arbitrary SOQL, live end-to-end test. Confirm integration ownership/hosting with Jon. |
| End-to-end demo | Combine tested knowledge guidance and matching/support components into one recorded journey, then repeat through the chosen client. Current proof uses direct draft preview, not ChatGPT. |

## Pending — evidence and team decisions

- Domain team: review current-season classification, registration, clubs and accessibility content; identify verified real program data and official support routes. Until then, matching stays synthetic.
- Jon/team: translation API contract, test credentials and data-handling terms; select one additional language and arrange native-language review. No translation integration is currently implemented.
- Confirm submission deadline, demo duration, actual Builder Track deliverable rules and required skill access.
- Run the hackathon's Accessibility Expert Skill and RAI Self Check Skill; record findings and fixes. Neither skill is available in this Codex session's installed skill list; obtain the organizer-provided tools/environment.
- Keyboard/screen-reader review of the actual client, plain-language review, prompt-injection and multi-turn regressions, stale/conflicting-source handling, failure/rate-limit tests.
- Repeat key agent scenarios at least three times, including hesitant consent creating zero Cases and retries creating exactly one Case. One live positive/hesitation journey and unit-level retry checks currently pass; broader repeated acceptance remains pending.
- Complete Data Cloud dataspace policy review before private ingestion. CRM permissions alone do not govern Data Cloud.
- Privacy/retention design for public interaction telemetry and support intake; authenticated own-member-record access is not implemented or required for anonymous discovery.
- Demo recording, architecture update, setup guide, reproducible test evidence and honest impact/scalability claims.

## Optional after the core journey works

- Consent-based saved preferences and interaction records; do not create them just to add objects.
- Broader interaction reporting on unresolved access needs and successful next steps. A minimal synthetic Case category report already works; do not equate it with real population demand. Data Cloud calculated insights are optional; no real participant identity resolution for the prototype.
- More reviewed content, real provider integrations, advanced multilingual coverage, voice or native mobile experiences.
- Predictive ML is not required: current ranking is deterministic evidence matching, not disability/ability or eligibility prediction.

## What matching does not yet promise

No real club recommendation, distance/radius search, live capacity/fees, booking, enrollment or eligibility decision. Exact city/state lookup only; the current city validator supports Latin unaccented letters, spaces, periods, apostrophes and hyphens. Unknown accessibility is retained. Real-data release and broader geography require separate review, not simply clearing a demo flag.
