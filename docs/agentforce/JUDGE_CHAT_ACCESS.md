# Judge access to Enhanced Chat

Checkpoint: September 7, 2026.

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
permission-set license or paid capacity was assigned.

Server-side verification confirmed read access, with no edit or delete access,
to the completed synthetic direct-human demonstration **MS-00000012** and its
Messaging User record. The transcript-view permission is enabled and operator
permissions remain disabled. No org-wide sharing defaults were changed; record
visibility still follows existing sharing.

## Judge smoke test

1. Refresh the existing judge session, or sign out and sign in again.
2. Open Sport Compass Support from the App Launcher.
3. Select Messaging Sessions. Change Recently Viewed to All if the list is empty.
4. Open MS-00000012 and inspect the Enhanced Conversation panel.
5. Confirm the conversation can be read and no operator participation is needed.

The final browser test under the judge's own login is pending confirmation from
the team. Admin-visible transcripts and permission queries are not substitutes
for that check. A live demonstration still requires a project operator to be
Available and accept the visitor's chat. Judges can test the visitor experience
through the public page without signing in.

The team's screenshot showed the record opening inside **My Service Journey**,
which does not use the project's Enhanced Conversation app override. The intended
page is `SportCompass_Messaging_Session`, activated as the MessagingSession desktop
page in `SportCompass_Support`. Opening a bare record link retains the current app.
Use the support app first, then the record; do not change the org-wide default.
