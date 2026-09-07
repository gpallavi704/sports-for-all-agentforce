# Public web human handoff checkpoint

Updated September 7, 2026, 1:28 PM Pacific. The native Salesforce test client
passed consent, operator acceptance, two-way messaging and operator-ended chat.
This records the native AI-first test. Later direct-human native testing passed,
and the team reported successful website human chat using polling. That report
is not an independent transport or failure-path test. See
[direct human evidence](DIRECT_HUMAN_CHAT_TEST.md). Never promise callbacks.

## Scope

The human destination is the Sport Compass project team, not USA Fencing staff.
The original SportCompass version 17 recorded demo remains unchanged. No new
Case, email, booking, contact-data collection or private-member action is included.
Salesforce retains messaging records and conversation history according to
org/platform configuration; disabling transcript download does not delete it.

## Verified state

| Component | State |
| --- | --- |
| SportCompass_Web_Fallback | Deployed MessagingSession queue, project admin only, email notifications off |
| SportCompass_Web_Routing | Deployed most-available routing, priority 1, weight 1, 30-second offer timeout |
| SportCompass_Web_Operator presence config | Capacity 2, manual acceptance, project admin only |
| SportCompass_Web_Available | Messaging-only presence status |
| SportCompass_Support | Deployed console with Omni-Channel utility |
| SportCompass_Messaging_Session | Enhanced Conversation record page, activated only for the Sport Compass Support desktop app |
| SportCompass_Web_Operator permission set | Assigned to admin with scoped presence access |
| MessagingUser and EnhancedChatUser | Existing seats assigned to admin; no seats purchased |
| SportCompass_Web_Handoff | Active Flow validating the native channel/session and checking online operators |
| SportCompass_PublicChat | Existing Web deployment/channel; uploads disabled in channel metadata |
| SportCompass_CustomClient | Published API deployment reusing the existing channel; guest authorization HTTP 200 |
| SportCompassGuide v2 | Active with consent instructions and MessagingSessionId-gated handoff |
| Native visitor test | AI greeting and source-backed wheelchair-fencing answer worked |
| Operator test | Admin successfully went online; switched offline when pausing tests |
| Human acceptance and two-way replies | PASSED in native Salesforce test client; website not tested |
| Consent declined | AI continued, no operator transfer appeared |
| Visitor uploads | Absent in refreshed native client |
| Operator-ended session | PASSED; session status verified Ended |

Deployment evidence:

- Queue/presence foundation: `0AfgL00000WwiuJSAR`.
- Console and permission set: `0AfgL00000Wwyz6SAB`.
- Active Flow: `0AfgL00000WxAlhSAF`.
- Final guide draft: `0AfgL00000WwuPCSAZ`, then committed and activated as version 2.
  Builder showed zero errors.
- Upload restriction: `0AfgL00000WxD8TSAV`.
- Enhanced Conversation page fix: `0AfgL00000WxG4jSAF`, followed by app-only activation.

## Native handoff test evidence

The first transfer reached the operator, but the default record page contained
the legacy Conversation component and rendered an empty transcript pane. Created
`SportCompass_Messaging_Session`, replaced `runtime_service_livemessage:chatBody`
with `scrt:conversationBody`, and assigned it to `SportCompass_Support` only.
The org-wide default and original Agentforce demo were not changed.

A fresh test session, `0MwgL00000ER4sHSAT` (`MS-00000003`), passed:

1. AI disclosed project-team destination and conversation sharing.
2. Visitor explicitly agreed in a later turn.
3. Routing offered the session to the online project operator, who accepted.
4. Visitor saw the operator join as `Pallavi G`.
5. The operator's test message appeared in the visitor chat; the visitor's
   confirmation appeared in the operator console.
6. The operator ended the chat. Salesforce reported `Status=Ended` and
   `EndTime=2026-09-07T20:26:35Z`.

The operator was returned to Offline after testing. A separate offline scenario
was started but not completed. Offline behavior, capacity limits, timed-out or
declined offers, reconnects and cross-visitor isolation still need verification.
No Case or email action was used. Messaging records and the test conversation
remain in Salesforce; this is not a claim that nothing was stored.

The Flow accepts only the `SportCompass_PublicChat` channel. The Custom Client
reuses that exact channel. Online status does not guarantee capacity or acceptance.

## Team website

The supplied `Sports4All.zip` contains `src/lib/mcp/agentforce.ts`, which uses
Salesforce Agent API sessions/messages, not Enhanced Chat. The website's existing
specialist follow-up tool is separate from live chat. No follow-up form was
submitted during inspection.

See [API integration handoff](ENHANCED_CHAT_API_HANDOFF.md). Keep the existing
experience working until the new path passes joint testing. Do not overwrite or
execute the archive wholesale.

## Salesforce-hosted public fallback

The branded `SportCompassPublic` Visualforce page and `SportCompass_Public` Site
are deployed and active at
[Ask Sport Compass](https://orgfarm-4d89d5ac56.my.salesforce-sites.com/sportcompass).
Anonymous HTTP returned 200, HTTP redirected to HTTPS, and a fresh public-page
conversation received a source-linked Agentforce answer. Both the page and native
chat use the team's current logo/avatar and navy/blue theme. The guest profile has
no object-permission grants and has access to the single public Visualforce page.

The default channel is AI-first. The public page now also offers **Chat with a
person**, which selects the separate direct-human Web deployment. The existing
consent-based AI handoff remains available. Neither mode copies Jon's website
transcript. See [verification](PUBLIC_SALESFORCE_PAGE.md).

## Still required

1. Capture evidence for the team's reported Custom Client polling integration.
2. Test the website's offline behavior, capacity limits,
   declined/timed-out offers, routing errors and cross-visitor isolation.
3. Confirm the website respects disabled uploads and transcript downloads. The
   guest-token configuration and refreshed native client already reflect this.
4. Regression-test Agent API public guidance after v2 activation.
5. Confirm privacy wording, retention and actual operator coverage.

Only announce that a human joined after a real participant/session event. Explain
the project-team destination and transcript sharing before asking permission.
Do not promise a callback or ask for medical or identity documents.

## References

- [Agent Script escalation](https://developer.salesforce.com/docs/ai/agentforce/guide/ascript-ref-utils.html)
- [Enhanced Chat setup](https://developer.salesforce.com/docs/service/messaging-api/guide/get-started.html)
- [Server-sent events](https://developer.salesforce.com/docs/service/messaging-api/references/about/server-sent-events.html)
- [Blank transcript with the legacy Conversation component](https://help.salesforce.com/s/articleView?id=005094225&language=en_US&type=1)
