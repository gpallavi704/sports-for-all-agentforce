# Sport Compass Custom Connection

Salesforce remains the source of club facts. `FindNearbyFencingClubsAction` searches synchronized `Fencing_Club_Directory__c` records and returns both the existing planner output and a versioned channel-neutral payload in `structuredResultJson`.

The optional [direct action API fallback](DIRECT_CLUB_API_HANDOFF.md) is now deployed and tested separately. It can obtain card data while the Custom Connection runtime issue is investigated, but bypasses Agentforce action selection for that lookup. The target remains Agentforce-led. It preserves the same payload field names; `radiusMiles` now also permits null for invalid-radius errors, and unsafe/non-HTTPS website URLs are omitted in favor of the returned official directory link. Do not assume the Agentforce session receives the direct lookup's state automatically.

The `Sport Compass Channels` custom surface offers one response format, `Sport Compass Club Results`. Web, Apple Messages and future clients must validate the payload against `contracts/club-results-v1.schema.json` before rendering it.

As of September 12, 2026 (Pacific), guide version 8 is active with the named Custom connection compiled from Agent Script. Live website and direct API tests still returned `result: []`, including a token-gated minimal response format. Rich output is NOT verified working. See the [diagnostic evidence](CUSTOM_CONNECTIONS_DEBUG_2026-09-12.md). The previous Apex validation passed 13 selected tests; no Apex code changed in this diagnostic.

## Client flow

1. Start the Agent API session with `surfaceConfig.surfaceType` set to `Custom`.
2. If a message contains `result`, accept `SURFACE_ACTION__SportCompassClubResults` and parse its `value` as JSON.
3. Validate the parsed value against the repository schema, including safe URLs, before rendering it. Schema validity does not independently prove that the model copied the source facts correctly.
4. Render website cards, Apple quick replies or an Apple list picker from the same club records.
5. If the result is absent or invalid, display the normal Agent API `message`. The canonical payload also includes `fallbackText` for adapters that receive the action result directly.

Channel adapters generate transport identifiers, select supported presentation components, hide buttons for null URLs and return `clubId` when a user selects a club. They must not call another model or rewrite Salesforce facts.

For Apple Messages, use quick replies for two to five clubs and a list picker for larger sets. A club selection is followed by the selected club details and a rich link when a safe URL is available. The adapter sends each 1440 message separately and owns `conversationId` and `requestMessageId`.

`Para` means the directory lists that specialty. It does not verify sessions, accessible facilities, coaching, equipment or suitability. Clients must preserve: `Contact the club to confirm access and equipment.`

## Deployment order

1. Deploy `FindNearbyFencingClubsAction` and its test.
2. Deploy `SportCompassClubResults_SCClub01`.
3. Deploy `SportCompassChannels_SCClub01`.
4. Include the named connection below in the `SportCompassGuide` Agent Script, then publish a new inactive version. Retrieve it and verify both the compiled graph and the generated `plannerSurfaces` reference. Preserve Messaging and Customer Web Client routing. Activate only after checking the generated configuration. Version 8 uses this approach; version 7 had only a post-publication planner attachment.
5. Start a test Agent API session with the Custom surface and validate both rich and plain-text fallback behavior.

```xml
<plannerSurfaces>
    <adaptiveResponseAllowed>true</adaptiveResponseAllowed>
    <callRecordingAllowed>false</callRecordingAllowed>
    <surface>SportCompassChannels_SCClub01</surface>
    <surfaceType>Custom</surfaceType>
</plannerSurfaces>
```

The compiler resolves the custom surface by its developer name, not the literal word `custom`:

```text
connection SportCompassChannels_SCClub01:
    adaptive_response_allowed: True
```

Generated planner bundles are excluded from Git by the existing repository policy. Verify the generated connection and the action output `structuredResultJson` after publication or migration. The editable Agent Script, response format and surface are maintained in source. Run `node scripts/verify-custom-connection.mjs` for local consistency checks without Agentforce usage. Those checks do not prove live rich rendering.

Steps 1 through 4 do not start an Agentforce conversation. Step 5 can consume Agentforce usage and requires explicit approval.
