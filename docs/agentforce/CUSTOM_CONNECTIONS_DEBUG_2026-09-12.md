# Custom Connection diagnostic, September 12, 2026

This is the diagnostic snapshot before the subsequent [direct API fallback](DIRECT_CLUB_API_HANDOFF.md). That fallback is deployed with 16 passing Apex tests and dedicated-token validation. It omits Schoolhouse's HTTP website URL at the action output boundary and supplies its official directory link. This is not evidence that native Custom Connection formatting or Agentforce-generated text redaction has been repaired; no further Agentforce conversation was run for the fallback.

## Status

Partial remediation only. `SportCompassGuide` version 8 is active (agent ID `0XxgL000002YosTSAS`). Club lookup works, but live responses still have an empty `result` array. No rich club payload has been captured successfully. Do not advertise working cards based on metadata deployment success.

## Verified configuration and changes

- Retrieved the active version 7 planner, response format, surface and Apex action. Format JSON was valid, enabled on the Custom surface, and attached to the active planner with adaptive responses allowed.
- Direct Apex search for ZIP 84060, Para, 50 miles returned three club records. Its canonical JSON validated against the deployed response schema. Source retrieval time was September 8; the action disclosed delayed refresh.
- Reworded surface and format descriptions as selection criteria. This did not produce rich data.
- Version 7's compiled graph omitted the Custom connection despite the planner reference. Added `connection SportCompassChannels_SCClub01:` with `adaptive_response_allowed: True` to the source script. Version 8 compiled and published successfully. Retrieved graph and planner both include the connection; standard Messaging and Customer Web Client handoff routes remain present.
- The missing graph entry was a configuration discrepancy, NOT an established explanation for empty results: version 8 still reproduced the failure.
- A token-gated minimal format with only a string and an array of strings also returned no surface action on versions 7 and 8. It was detached after testing. This reduces confidence that the club schema alone explains the failure; it does not prove a Salesforce platform defect.

## URL redaction

Added exact Trusted URL hosts for `https://www.valkyriefencingclub.com` and `https://www.schoolhousefencing.com`, using the existing image-only configuration. No wildcards, CORS, frame, connection, camera or microphone permissions were added. Readback regression passed for nine project hosts and four preserved existing entries.

Valkyrie's HTTPS URL now appears intact in both the website trace and direct API reply. Schoolhouse's returned source URL uses HTTP and remains `URL_Redacted`, despite its HTTPS host entry. Scheme mismatch is a hypothesis, not a confirmed root cause. The HTTPS site returned 403 during inspection. Do not invent a replacement website URL or weaken global URL protection. A safe alternative for adapters is its returned official USA Fencing directory profile, clearly labeled as the directory link rather than the club website.

## Reproduction evidence for Salesforce / Jon

All tested sessions used `surfaceConfig: {"surfaceType":"Custom"}` and `bypassUser: true`. The website trace confirms those fields, and HTTP 200 is not proof that a response format ran.

| Test | Result | Plan ID |
| --- | --- | --- |
| v7 baseline club lookup | Empty result, two redacted club links | `4ea51118-6eed-4933-8926-40a6de50a944` |
| v7 selection-instruction change | Empty result | `c8851414-1866-43cd-8db4-5dd4758c6c9e` |
| v7 minimal-format probe | Empty result | `00f4c6fc-7f84-4f8f-a3c4-500cb6790f9e` |
| v8 website, 11:53:14 AM Pacific | Empty result, Valkyrie fixed, Schoolhouse redacted | `cac55b60-54a1-48ad-a382-a6545b830638` |
| v8 direct API, normal club question | Same failure without website prompt rewriting | `78d24126-8ede-42ad-9b97-23c3c604e12b` |
| v8 minimal-format probe | Empty result | `baa51c52-c64f-4749-ab45-cca8d2ec8fe7` |

Jon's Admin > Agentforce console contains the website test above, labeled `mcp` because the site's club route uses that tool. Its prompt wrapped the user question in an instruction to summarize programs. Direct testing also failed, so that wrapper is not established as the sole cause. Direct diagnostic sessions were explicitly ended; no automatic agent retry loop was used.

Question: `Find fencing clubs offering Para within 50 miles of ZIP 84060. Show club names and website links.`

Expected: `result[].type` equal to `SURFACE_ACTION__SportCompassClubResults`, with JSON in `value`. Observed: `result: []` and a normal Inform message containing the club names.

Response format: `SportCompassClubResults_SCClub01`. Client schema: [club-results-v1.schema.json](../../contracts/club-results-v1.schema.json), unchanged by this diagnostic. Keep normal text fallback and URL validation. Apple, ChatGPT and website card rendering remain unverified until a real structured reply exists.

## Next supported investigation

Ask Salesforce to inspect the plan IDs for Custom Connection response-format selection/generation and any feature or runtime prerequisites in this org. Their public documentation says selection failures and generation errors can both fall back to text without diagnostic logs for the caller. Avoid repeated credit-consuming trials without a new testable hypothesis.

References: [Custom Connection troubleshooting](https://developer.salesforce.com/docs/ai/agentforce/guide/custom-connections-troubleshooting.html), [setup](https://developer.salesforce.com/docs/ai/agentforce/guide/custom-connections-get-started.html), [selection behavior](https://developer.salesforce.com/docs/ai/agentforce/guide/custom-connections.html).
