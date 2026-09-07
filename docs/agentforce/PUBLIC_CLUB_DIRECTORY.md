# Source-checked public club discovery

Source review: September 6, 2026 (Pacific). Deployment/testing status is recorded in STATUS.md.

## Reviewed scope

| Club | Exact city/state | Primary sources |
| --- | --- | --- |
| Salt City Swords Fencing Club | Salt Lake City, UT | [Division directory](https://www.usafencingutah.com/utah-idaho-clubs), [club website](https://www.saltcityswords.com/) |
| Wasatch Fencing Club | Kaysville, UT | [Division directory](https://www.usafencingutah.com/utah-idaho-clubs), [club website](https://www.wasatchfencing.com/) |

The directory and each club website support these identities and locations. These are real public listings, not fictional class records. The selected pages do not establish wheelchair fencing availability, mobility access or frame/equipment provision. General inclusive marketing is not accessibility evidence. No on-site or provider audit was performed. The reviewed date is not a source effective date or a guarantee of current membership, opening hours or availability.

Only club name, city/state and public source/website URLs are loaded; no individual contact information, athletes or diagnoses. The national directory was not bulk imported. This two-club set is not comprehensive and Kaysville is not silently substituted for Salt Lake City.

## Implementation and entitlement

`Public_Fencing_Club__mdt` stores a small administrator-reviewed public reference set, with an enabled flag and review date. `FindPublicFencingClubsAction` returns only enabled, source-allowlisted entries reviewed within 90 days, excluding missing/future dates. Invalid or expired listings are suppressed until reviewed. Maintenance is manual; no automatic recrawl or review reminder is implemented. Larger inventories should move to an appropriately governed data source rather than growing this MVP configuration indefinitely.

The read-only Apex action returns exact-city/state matches in alphabetical order, capped at three. Agent Script runs it before reasoning on each real-club turn, binding the actual latest user message. A bounded parser accepts an explicit `City, ST` location (and Utah as a full state name); missing, unsupported or ambiguous location formats trigger clarification rather than history-based guessing. The parser is not general natural-language understanding, geocoding or a full address parser. Structured city/state inputs remain available for direct code callers; the bound current message takes precedence when present.

The action exposes no record IDs, participant fields, private CRM queries, booking or Case creation. All accommodation and parafencing attributes remain unknown. The existing class-access permission set grants the new action; no new CRM object/field access is granted. Custom metadata is intentionally public configuration, not a private-record entitlement mechanism.

`Find_Real_Clubs` is the default route for real or unspecified club/program searches. Explicit fictional/demo requests use `Find_My_Sport`. Both routes now execute their respective lookup before reasoning, bound to the actual current message; the demo matcher's synthetic-only, user-mode and sharing boundaries remain intact. Its bounded English parser recognizes explicit location, volunteered numerical age, experience and feature keywords; it does not infer a diagnosis or support general multilingual parsing. Each subagent can transition to the other, without relabeling fixtures or passing real club listings to the synthetic support flow. Real-club discovery offers direct public sources and a contact checklist, not a staff referral promise.

Initial live testing returned the correct club and unknowns but Salesforce redacted its links. Three exact public hosts were added to Trusted URLs using the existing image-only pattern; connection, frame, media, camera and microphone grants remain false. No callout credentials or integration access are added. Future live MCP response projection must include this reviewed URL inventory; the current MCP process is mock-only.

## Checks

- Eight Apex tests: source/expiry/enabled gates, no CRM writes/callouts, unknown feature fields, no IDs, exact location/no silent widening, invalid input/batch cap, deduplication/order/result cap, installed configuration, current-message precedence and missing/ambiguous location handling.
- `node scripts/verify-agent-draft.mjs`: seven known routes, eight approved external action definitions, 20 exact public URLs, fixed knowledge bindings and existing consent guards.
- `node scripts/test-public-clubs-live.mjs`: published-agent real Salt Lake City → Kaysville → no listing → explicit demo → real again; checks sources, unknowns and action traces. Requires authenticated CLI and an active reviewed version; incurs Agentforce usage.

These checks do not establish universal hallucination resistance, accessibility compliance, verified parafencing suitability, live class inventory or production readiness.

## Context and cost decision

Conversation history supplies continuity, not authoritative search results. Current lookup outputs replace the route's three session variables before every real-club or demo-search response. Public lookup is deterministic Apex over a small custom metadata set; demo lookup uses user-mode database queries. Neither requires a second LLM call. No external cache service, persistent preference memory or whole-answer cache is added. Future caching must separate public reference data from private or user-specific data and preserve review expiry/invalidation; it must never reuse consent or imply live capacity. No token-savings or latency benchmark has been claimed.
