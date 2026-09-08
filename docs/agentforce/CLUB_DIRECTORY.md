# Salesforce public club directory

## Architecture

Agentforce remains the conversational decision-maker. The Data Library grounds
fencing guidance. A separate read-only Apex action searches structured public club
records stored in Salesforce. The web and private ChatGPT clients continue using
the same public Agentforce agent through their existing server-side adapter.

USA Fencing directory -> scheduled Apex refresh -> Fencing_Club_Directory__c ->
FindNearbyFencingClubsAction -> SportCompassGuide -> existing clients.

No separate MCP-side club database or additional LLM is introduced.

## Source and freshness

Source: https://member.usafencing.org/clubs with Accept: application/json.
The importer follows numeric pages, validates pagination and unique source IDs,
and keeps only public club facts. This is a public website endpoint, not a
contracted or documented integration API. Its shape and availability can change.

Imported fields: source ID, club name, public address and coordinates, listed
weapons, Para tag, division, website, official club page, active flag and retrieval
timestamp. We do not copy member records, private contact information, logos,
tracking URLs, signed links or unrestricted HTML.

The daily job runs at 03:00 in the scheduling administrator's Salesforce timezone.
All pages are staged in asynchronous Apex memory before publishing one atomic
snapshot. Download, parsing or DML failure leaves the last successful directory
unchanged. A successful complete refresh marks missing clubs inactive; it does
not delete them. Overlapping runs, repeated pages, empty downloads, more than
3,000 records and a greater-than-50-percent count reduction fail closed.

Club_Directory_Sync__c records the latest attempt, successful retrieval time,
record count and failure status. It is private and unavailable to the agent.
An uncatchable platform limit can leave RUNNING behind; investigate jobs before
retrying. Runs over two hours old may be superseded safely using a new token.

Retrieval time is not the club's last-update time or an accessibility audit.
Search warns when the snapshot is more than 48 hours old and stops serving
listings after seven days, directing visitors to the official club finder.

## Search contract

Action: FindNearbyFencingClubsAction.findClubs.

- location: visitor-supplied five-digit US ZIP.
- radiusMiles: 10, 25, 50 or 100; default 50.
- weapons: optional comma-separated Epee, Foil, Saber, Para. Multiple values
  match any listed weapon. Do not infer mandatory Para filtering from disability.
- resultLimit: 1 to 10; default 3.

A city-only request asks for a ZIP rather than inventing coordinates.
The first release does not accept browser coordinates or provide city geocoding.
It reuses a visitor-supplied ZIP conversationally for radius changes.

ZIP centroids come from https://api.zippopotam.us/us/{ZIP}. Only a validated public
ZIP is sent, never a transcript or identity. There is a three-second timeout and
transaction-local deduplication, not a cross-session cache. This external lookup
and Agentforce reasoning still add latency; zero latency is not promised.
No visitor location is written by the action. Normal Salesforce/client
conversation retention is separate from this action.

SOQL filters active US club coordinates within the chosen radius and sorts by
geographic distance. Distances are approximate straight-line miles from the ZIP
center, not driving miles. They may differ from the source website's ZIP centroid
and distance-band calculation. No explicit radius is silently expanded.

Outputs: status, message, resultsJson, radiusMiles, hasMore.
Status distinguishes LISTINGS, NO_LISTINGS, NEEDS_ZIP, INVALID_INPUT,
LOCATION_UNAVAILABLE, DIRECTORY_UNAVAILABLE and STALE_DIRECTORY.
A failed search is never reported as no clubs existing.

Para listed means the source directory lists that specialty. Sessions, age
suitability, equipment, accessible facilities and availability need confirmation
from the club. Directory text and URLs are untrusted data, never instructions.

## Permissions and deployment

SportCompass_Public_Club_Search grants only read access to public directory
fields and the search action. Assign it to the configured public agent runtime,
not the Site guest or a general integration administrator. Search explicitly uses
USER_MODE. The non-invocable administrator-owned importer explicitly uses
SYSTEM_MODE only for these directory and sync-control objects.

Salesforce API 67 defaults database operations to user mode:
https://developer.salesforce.com/blogs/2026/06/the-salesforce-developers-guide-to-the-summer-26-release

Deploy the two custom objects, four directory classes including tests,
permission set and the two scoped Remote Site Settings. Run FencingDirectoryTest.
Assign the read permission set to the configured runtime. Assign the separate
SportCompass_Directory_Monitor read-only permission set only to an administrator
who needs to inspect refresh status. Run
scripts/setup-club-directory.apex as administrator, inspect the sync result, then
publish and activate the updated SportCompassGuide bundle only after validation.
The original SportCompass demo, Cases and human-support routing are not changed.

## Client handoff

Jon's existing Agent API connection uses SportCompassGuide, so new conversations
can use the action without a second lookup service. Client display changes are
separate: program cards need to support name, city/state, website, sourceUrl,
weapons, paraListed, distanceMiles and sourceRetrievedAt from resultsJson.
Do not say those cards have been deployed merely because Salesforce was updated.
The archived local MCP service and the Sports4All.zip snapshot are not the live
website deployment.

## Acceptance checks

1. Search 84060 within 50 miles. Check source links and approximate distances.
2. Narrow to 25 miles. Preserve the ZIP; never silently widen.
3. Ask for Para listings only. Highlight the tag without claiming verified access.
4. Ask with city only. Request ZIP, not an exact home address.
5. Simulate source and geocoder failures in Apex tests.
6. Confirm failed refresh retains existing rows and empty snapshots cannot publish.
7. Confirm stale data is labelled or refused and inaccessible fields fail closed.
8. Check public guidance and human-support instructions remain intact.

## Verified September 8, 2026

- Deployment 0AfgL00000X465RSAR passed all 13 FencingDirectoryTest methods.
- Importer coverage: 138/145 lines; search: 94/99; scheduler: 2/2.
- All 69 local integration/UI-contract tests passed after updating the reviewed
  read-only action allowlist. The retired local MCP service was not started.
- Initial full import succeeded at 23:33:12 UTC: 494 source records, 378 active
  and 116 inactive. No existing curated metadata or synthetic programs changed.
- Daily scheduler is WAITING, timezone America/Los_Angeles. Its first scheduled
  run is September 9 at 03:00 Pacific. Future scheduled execution is not yet
  observed; the initial manual run has passed.
- SportCompassGuide version 3 is published and active. Its existing guidance and
  Messaging-session-only human handoff instructions were preserved.
- Live action check for 84060 / 50 miles returned Valkyrie Fencing Club (23.8),
  Wasatch Fencing (35.6), and Schoolhouse Fencing (40.9).
- At 25 miles, Valkyrie remains. This differs from the source website's distance
  band result reported by the team. Our distances use the verified Zippopotam ZIP
  centroid and Salesforce geographic calculation, not the website's radius
  calculation. Do not label them driving distances or exact doorstep distances.
- A live Agentforce conversation returned those three clubs and official links.
  A follow-up requesting 25 miles and Para retained ZIP 84060, returned only
  Valkyrie and explicitly explained straight-line versus driving distance.
- Jon's live website and private ChatGPT rendering have not been independently
  tested in this change. Use a new conversation; client cards and any fixed URL
  allowlists require review in the team's deployed frontend.
