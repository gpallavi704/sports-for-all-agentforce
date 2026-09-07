# Judge access to Enhanced Chat

Checkpoint: September 7, 2026. Temporary self-test operator setup was added after
the initial read-only review role. The user confirmed the judge presence status
is visible when signed in as the judge in an incognito window. Salesforce confirms
the judge accepted the retry, and the user reported that the test worked. The
visitor reply and final closure were not independently captured in this check.

Use **App Launcher > Sport Compass Support > Messaging Sessions**. The generic
Command Center for Service is not the project's conversation-review entry point.

The `SportCompass_Judge_Chat_Read` permission set provides:

- Visibility of the Sport Compass Support console and Messaging Sessions tab.
- Read access to Messaging Session and its required Messaging User dependency.
- Access Conversation Entries and Lightning Console User permissions.
- Read-only access to the CaseId lookup needed by the record page's related-Case panel.
- No Create, Edit, Delete, View All or Modify All object grants.
- No Enhanced Chat Rep, End Messaging Session or queue membership grants.

Salesforce documents the non-rep viewer pattern in
[Give Non-Reps Access to Enhanced Chat Transcripts](https://help.salesforce.com/s/articleView?id=service.miaw_non_agent_permissions_1.htm&language=en_US&type=5).

Deployment `0AfgL00000WxTJhSAN` succeeded. The permission set was assigned only to
the existing Sport Compass judge user, with expiration at the end of September 22
Pacific. Existing Builder and Case permissions were preserved. No additional
permission-set license or paid capacity was assigned at this read-only checkpoint.

Server-side verification confirmed read access, with no edit or delete access,
to the completed synthetic direct-human demonstration **MS-00000012** and its
Messaging User record. Operator permissions were initially disabled; the separate
operator setup below was added later. No org-wide sharing defaults were changed; record
visibility still follows existing sharing.

## Judge smoke test

1. Refresh the existing judge session, or sign out and sign in again.
2. Open Sport Compass Support from the App Launcher.
3. Select Messaging Sessions. Change Recently Viewed to All if the list is empty.
4. Open MS-00000012 and inspect the Enhanced Conversation panel.
5. Confirm the conversation can be read and no operator participation is needed.

Admin-visible transcripts and permission queries are not substitutes for a
judge-login browser test. The normal public support channel still requires a
project operator to be Available and accept the visitor's chat. The isolated
self-test below lets the judge play both roles without routing public visitors
to the judge account.

The team's screenshot showed the record opening inside **My Service Journey**,
which does not use the project's Enhanced Conversation app override. The intended
page is `SportCompass_Messaging_Session`, activated as the MessagingSession desktop
page in `SportCompass_Support`. Opening a bare record link retains the current app.
Use the support app first, then the record; do not change the org-wide default.

## Self-guided human-chat test

Visitor test page:
https://orgfarm-4d89d5ac56.my.salesforce-sites.com/sportcompass/SportCompassJudgeDemo

Operator console:
https://orgfarm-4d89d5ac56.lightning.force.com/lightning/app/02ugL00000HaCqTQAV

1. Sign in as the existing judge user in a separate or incognito window. Open
   Sport Compass Support, then Omni-Channel in the bottom utility bar.
2. Select **Available - Judge Demo Chat** and leave that window open.
3. Open the visitor test page in a different window. Reload if it was opened
   before the judge went Available. Select **Open judge test chat**.
4. Send: "This is a judge self-test. What equipment should a beginner ask a fencing club about?"
5. Accept the incoming request in the judge's Omni-Channel panel within 60 seconds. Reply:
   "Test reply received. Please confirm loaner equipment with the club."
6. Confirm that reply appears in the visitor chat. End the conversation from
   the visitor menu, close the work tab, and return the judge to **Offline**.

Use fictional information only. This visitor link is publicly reachable and is
not authentication-protected. It is not linked from the main public landing page.
Isolation is by its dedicated queue, not by secrecy of the URL. Messages are
stored in Salesforce and are visible to authorized project users. The shared
judge login is not isolated between individual judges; test one session at a time.

## Temporary operator scope

- `SportCompass_JudgeDemo`: active human-only Messaging channel and Web deployment.
  Direct Omni-Queue routing, no Agentforce recipient.
- `SportCompass_Judge_Queue`: only the judge user, separate from
  `SportCompass_Web_Fallback`. No public support membership was added.
- `SportCompass_Judge_Available`: separate presence status, granted through
  `SetupEntityAccess` on the new operator permission set.
- `SportCompass_Judge_Operator`: permission set plus presence configuration.
  Capacity two, manual acceptance, one existing Enhanced Chat User license seat.
  No purchase, admin grant, general Messaging Session Edit, Delete, View All,
  Modify All or End Messaging Session permission was added.
- Permission assignment expires at `2026-09-23T06:59:59Z`, the end of September 22
  Pacific. The queue, presence configuration and license seat do not expire with
  that assignment and require cleanup after judging.
- Attachments and transcript downloads are disabled. The native chat button
  follows representative availability. No forced-show bypass is used.

This org's internal Messaging Session sharing default is ReadWrite. Granting
general object Edit would therefore broaden editing of existing public sessions.
The setup deliberately grants the narrower Enhanced Chat Rep permission without
general record Edit. Acceptance succeeded with this narrower permission set, and
the user reported the test worked. Do not broaden permissions or change
org-wide sharing to bypass a failed test.

## Setup and verification evidence

- Foundation deployment `0AfgL00000WxbM5SAJ` and narrowed-permission deployment
  `0AfgL00000WxYssSAF` succeeded. Channel deployment `0AfgL00000WxZowSAF` succeeded.
- `scripts/setup-judge-chat.apex` ran successfully and assignment expiration was
  queried independently. It asserts the org, queue isolation, absence of general
  object writes and an available existing license seat before mutation.
- Page and Web config deployment `0AfgL00000WxXokSAF` succeeded. Publication was
  requested from the deployment UI, which reports up to ten minutes propagation.
- `scripts/setup-judge-visitor-page.apex` granted only the controller-free page to
  the existing Site guest profile. Guest object permissions remained absent.
- An unauthenticated HTTP request returned the intended page. A browser visit
  rendered the branded instructions and correctly waited for judge availability.
- An existing public-support session remained readable but not editable or
  deletable by the judge after the new permission assignment.
- All 22 local checks passed:
  `node --test scripts/test-public-page.test.mjs scripts/test-judge-chat.test.mjs`.
- User confirmed presence-status visibility in the judge's incognito console.
- The first test, MS-00000018, reached the judge but was not accepted within its
  60-second window. AgentWork recorded `DeclinedOnPushTimeout`. The test was
  ended through the visitor menu before retrying; no permission change was made.
- Retry MS-00000019 (`0MwgL00000ERGOnSAP`) was assigned at 22:53:15 UTC and accepted
  by the judge at 22:53:54 UTC on September 7. AgentWork was `Opened` and the
  active Messaging Session owner was the judge, not a project operator.
- The user reported "it worked" after the acceptance/reply instructions.
  Visitor-side reply text and final closure were not independently captured.
- After acceptance, the existing public-support session MS-00000012 still had
  read access but no edit or delete access for the judge.

The live acceptance is verified; the user's success report is separate evidence
from a captured two-way transcript. These checks do not establish production-grade
anonymous abuse prevention or per-judge identity isolation. If an offer disappears,
check its AgentWork status before changing permissions or creating more sessions.
