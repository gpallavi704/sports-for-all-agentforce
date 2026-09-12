# Sport Compass Custom Connection

Salesforce remains the source of club facts. `FindNearbyFencingClubsAction` searches synchronized `Fencing_Club_Directory__c` records and returns both the existing planner output and a versioned channel-neutral payload in `structuredResultJson`.

The `Sport Compass Channels` custom surface offers one response format, `Sport Compass Club Results`. Web, Apple Messages and future clients must validate the payload against `contracts/club-results-v1.schema.json` before rendering it.

As of September 11, 2026 (Pacific), guide version 7 is activated with this surface. The action, test class, response format and surface passed Salesforce validation with 13 selected Apex tests. No Agentforce conversation was started to test the new format. Client rendering and selection callbacks remain pending.

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
4. Publish the updated `SportCompassGuide` authoring bundle as a new version. Retrieve that inactive version's planner bundle and add the `plannerSurfaces` entry below, preserving all existing surfaces and routing settings. Deploy the updated planner and activate that version. Version 7 was used for this rollout; active planner versions cannot be edited directly.
5. Start a test Agent API session with the Custom surface and validate both rich and plain-text fallback behavior.

```xml
<plannerSurfaces>
    <callRecordingAllowed>false</callRecordingAllowed>
    <surface>SportCompassChannels_SCClub01</surface>
    <surfaceType>Custom</surfaceType>
</plannerSurfaces>
```

Generated planner bundles are excluded from Git by the existing repository policy. Repeat the attachment step after publishing or migrating a version and verify the generated action output schema includes `structuredResultJson`. The editable Agent Script, response format and surface are maintained in source.

Steps 1 through 4 do not start an Agentforce conversation. Step 5 can consume Agentforce usage and requires explicit approval.
