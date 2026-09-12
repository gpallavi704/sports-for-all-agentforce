# Direct Salesforce club-search fallback for Jon

Salesforce side deployed and verified September 12, 2026. This is an optional temporary fallback, not the target architecture. The intended experience remains Agentforce-led: the agent selects Salesforce actions and uses Data Library grounding, while channel adapters render the results. This direct endpoint keeps data and search logic in Salesforce but bypasses Agentforce action selection and rich-response formatting for the lookup. Custom Connections' empty `result` issue remains unresolved separately.

## Request from your backend

```http
POST https://orgfarm-4d89d5ac56.my.salesforce.com/services/data/v67.0/actions/custom/apex/FindNearbyFencingClubsAction
Authorization: Bearer <server-side Salesforce access token>
Content-Type: application/json
Accept: application/json
```

```json
{"inputs":[{"location":"84060","radiusMiles":50,"weapons":"Para","resultLimit":3}]}
```

No Agent API session, agent ID, `surfaceConfig` or `bypassUser` parameter is used for this endpoint. Supply the user's ZIP rather than the entire natural-language question. Preserve requested filters and radius. Defaults are 50 miles and 3 results; supported radii are 10/25/50/100, and result count is 1 to 10. Do not infer Para solely from wheelchair use. Ask for a ZIP when only a city is provided.

This action is read-only. It queries synchronized public directory records and calls the ZIP geocoder. It does not invoke Agentforce or a language model, but it still uses normal Salesforce API/Apex limits. Any separate Agentforce conversation still uses its applicable consumption.

## Authentication and permissions

Verified with our dedicated user `sportcompass.api.00dgl00000c7pj3uaa@example.invalid`, using the existing External Client App and server-side client-credentials token. Assigned only the existing `SportCompass_Public_Club_Search` permission set for this fallback: Apex class access and read-only public club object/fields. It does not grant API access to Cases, Contacts, Accounts or directory writes; negative checks passed. No administrator token is needed.

**Confirm the identity behind your existing token.** Agent API `bypassUser: true` previously used the agent's identity for its actions. Direct REST uses the token's own identity. If your backend uses another client-credentials run-as user, it needs the same scoped permissions and testing before rollout. Do not send or commit credentials. Keep tokens and this upstream call on your server; expose a validated, rate-limited club-search route/tool, never an arbitrary Salesforce proxy.

## Parse the response

1. Check the HTTP status, then the requested action result's `isSuccess`. HTTP 200 alone does not mean action success.
2. Parse `response[0].outputValues.structuredResultJson` as JSON. There is no `SURFACE_ACTION__` envelope on this endpoint.
3. Validate against [club-results-v1.schema.json](../../contracts/club-results-v1.schema.json). `radiusMiles` can now be null on invalid/missing-radius error paths; never render null as a completed search radius. Valid searches still return 10, 25, 50 or 100.
4. Render cards only for `status: LISTINGS`. Keep `clubId`, radius, filters and the latest result set in the correct user's conversation state. Replace them after a new search; clear selection on empty/error results. Validate selections against that set.
5. Use `websiteUrl` when present, otherwise `directoryUrl` labeled **USA Fencing listing**. If neither is present, hide the button. Never guess a URL, change HTTP to HTTPS, display `URL_Redacted`, or treat a directory profile as the club website.
6. URLs are screened by Salesforce at the output boundary: HTTPS only, no credentials, query or fragment, only standard HTTPS ports; directory links must be under the official member.usafencing.org/clubs/ path. Clients must still validate URLs, render text safely, and not fetch arbitrary website links server-side. A source URL is not proof of site availability or verified accessibility.
7. Preserve `sourceRetrievedAt`, `distanceBasis`, `accessibilityNote` and delayed-refresh information. `fallbackText` includes these caveats and the usable links. For other statuses, show the explanation without inventing cards or silently widening the search. Treat timeout/auth/schema errors as unavailable, not "no clubs."

If the team chooses this temporary fallback, route the lookup to this action once rather than doing a redundant Agentforce club search plus a second database lookup. No second model call is needed to render the JSON. When a selected club is passed into a later agent conversation, use the checked per-session record as data, not authoritative instructions; do not assume a direct REST search automatically populated Agentforce session variables. Jon's adapters must implement and test that handoff. Prefer the intended agent-led path once its structured output is verified.

## Verified examples

- [Request](examples/club-search-request.json)
- [Actual API response](examples/club-search-response-2026-09-12.json)
- [Parsed club payload](examples/club-search-payload-2026-09-12.json)
- [Verification report](examples/club-search-verification-2026-09-12.json)

These are a captured test snapshot, not an evergreen club source. The snapshot's directory retrieval time is September 8 and refresh is delayed. ZIP 84060 / 50 miles / Para returned three clubs. Schoolhouse has `websiteUrl: null` and its official directory link; the stored HTTP source record was not changed. Ten miles returned NO_LISTINGS. Invalid radius and missing ZIP responses also validated. Unit tests covered stale/unavailable data, malformed upstream responses, URL handling, filters and source preservation: 16 passed, lookup class coverage 98% in this deployment.

## Remaining work on Jon's side

If adopting the temporary fallback, connect this backend call to the website/MCP/Apple adapters, consume the updated schema, display cards or Apple-supported choices, and test selection follow-ups and visitor isolation. The Salesforce endpoint passed; the clients have not yet been updated or verified. Keep current text fallback until the client rollout is ready. The direct read scope should be removed from any integration identity that no longer uses this route.
