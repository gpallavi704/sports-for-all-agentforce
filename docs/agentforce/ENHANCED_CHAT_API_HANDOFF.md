# Enhanced Chat API integration handoff

September 7, 2026. Native Salesforce visitor-to-human transfer and direct-human
chat passed. Both Custom Client deployments are published and guest authorization
was verified. The team subsequently reported successful website human chat using
polling. The older AI-first integration instructions below remain a separate option.

## Current direct-human configuration

Use `SportCompass_HumanClient` for the website's **Chat with a person** choice:

```json
{
  "OrganizationId": "00DgL00000c7pj3",
  "DeveloperName": "SportCompass_HumanClient",
  "Url": "https://orgfarm-4d89d5ac56.my.salesforce-scrt.com"
}
```

This uses the `SportCompass_HumanSupport` channel, routed directly to the project
queue without Agentforce. Start a separate Messaging conversation and disclose
that earlier AI messages are not automatically shared. Native two-way verification
is in [direct human chat evidence](DIRECT_HUMAN_CHAT_TEST.md).

Jon reported using polling in the MCP integration instead of forwarding SSE to
the client. Do not require a frontend SSE connection for that implementation.
The backend must still retrieve messages and routing/session state, deduplicate
entries, bind each conversation to its visitor, handle expiry/errors and stop
polling when the session ends. Receiving a token or creating a session is not
proof of operator acceptance. Failure paths and visitor isolation remain pending.

## Earlier AI-first Custom Client option

## Ownership

Salesforce side: Custom Client created and published, SportCompassGuide routing
configured, existing channel reused and operator presence access tested.

Website side: preserve Jon's React UI; implement guest tokens, Messaging
conversations, message sending and server-sent events. The supplied ZIP is a
source snapshot, not evidence that this repository deploys his live website.
Changing or committing that ZIP does not update the live site. Jon must apply
the integration in his deployment-connected project and publish it there.

## Configuration to send Jon

Copied from Salesforce's generated Custom Client code snippet:

```json
{
  "OrganizationId": "00DgL00000c7pj3",
  "DeveloperName": "SportCompass_CustomClient",
  "Url": "https://orgfarm-4d89d5ac56.my.salesforce-scrt.com"
}
```

For the guest-token request, map `OrganizationId` to `orgId` and `DeveloperName`
to `esDeveloperName`. The verified request to
`POST /iamessage/api/v2/authorization/unauthenticated/access-token` was:

```json
{
  "orgId": "00DgL00000c7pj3",
  "esDeveloperName": "SportCompass_CustomClient",
  "capabilitiesVersion": "1",
  "platform": "Web",
  "context": {
    "appName": "SportCompass",
    "clientVersion": "1.0.0"
  }
}
```

Smoke-test result: HTTP 200, guest token issued, deployment type `API`, auth
mode `UnAuth`, uploads disabled and transcript downloads disabled. The token
stayed in process memory and was not logged or saved. No conversation, Case or
email was created. An initial probe with spaces in `appName` failed validation;
use an alphanumeric name with underscores or periods, at most 40 characters.
The API documentation shows lowercase `api`; this org returned uppercase `API`.

## Verified configuration

| Setting | Value |
| --- | --- |
| Organization ID, 15 characters | `00DgL00000c7pj3` |
| Public guide | `SportCompassGuide`, version 2 active |
| Existing Agent API agent ID | `0XxgL000002YosTSAS` |
| Existing Messaging channel | `SportCompass_PublicChat` |
| Channel ID | `0MjgL000000hP4nSAE` |
| Published Custom Client deployment | `SportCompass_CustomClient`, type `API` |
| Custom Client deployment ID | `04IgL000000fHsvUAE` |
| Existing deployment | `SportCompass_PublicChat`, type Web, NOT Custom Client |
| Existing deployment ID | `04IgL000000fHZZUA2` |
| Existing service endpoint | `https://orgfarm-4d89d5ac56.my.salesforce-scrt.com` |
| Outbound Flow | `SportCompass_Web_Handoff` |
| Project queue | `SportCompass_Web_Fallback` |
| Operator app | `SportCompass_Support` |

Use the Custom Client service URL and deployment name above. Do not send the
existing Web deployment name as the Custom Client `esDeveloperName`.
The Agent API agent ID does not replace the Messaging deployment name.

These are routing identifiers, not credentials. Use a scoped guest Messaging
token, not an administrative Salesforce OAuth token. Keep tokens out of logs,
URLs, screenshots and source control. Never expose Salesforce client secrets.

## Client implementation

1. Obtain an Enhanced Chat access token for an unverified guest.
2. Create the Messaging conversation and retain its conversation identifier.
   Bind server-side sessions to the correct visitor. Do not share a global
   conversation or accept arbitrary conversation IDs without authorization.
3. Establish the SSE listener and render messages from both AI and human senders.
   Send turns through Enhanced Chat for this conversation, not also Agent API.
4. Ask permission before sharing the native conversation with the project team.
   Salesforce's outbound Flow requests routing if an operator is online.
5. Render waiting, accepted, failed and ended states from actual platform events.
   A routing request does not prove that a human has accepted the conversation.
6. Handle token expiry, dropped SSE connections, event replay/deduplication and
   unknown future event types. Reconnect using the documented last-event mechanism.

Relevant events include `CONVERSATION_MESSAGE`, `CONVERSATION_PARTICIPANT_CHANGED`,
`CONVERSATION_ROUTING_RESULT` and `CONVERSATION_SESSION_STATUS_CHANGED`.
Use sender roles to distinguish AI and human replies.

Use Messaging from the beginning of a new conversation for the simplest coherent
handoff. Existing Agent API sessions do not automatically become Messaging
conversations. A separate support chat is an acceptable fallback, but explain
that previous messages are not copied. Transcript ingestion needs separate
consent and implementation; do not silently import it.

The current Flow only allows `SportCompass_PublicChat`. The new Custom Client
reuses that exact channel, so no allowlist expansion was needed.

## Joint acceptance test

- New visitor receives a public fencing answer from the Salesforce agent.
- Request a person: explain project-team destination and transcript sharing.
- Decline: no routing; AI remains available.
- Agree with an operator online: the operator receives and accepts the session.
- Website shows the real human participant; exchange a synthetic message each way.
- End the conversation and verify the client reflects the final session state.
- Test offline, capacity limits, declined/timed-out offers and disconnected SSE.
- A separate visitor cannot read or continue the first visitor's conversation.
- No private records, uploads, Cases, email or callback promise is introduced.

Keep the existing Agent API experience available until this test passes.
The Custom Client is provisioned. Native Web testing passed operator acceptance,
two-way replies and session closure after fixing the operator record page.
This earlier AI-first API/SSE option is not the team's reported direct-human
polling route. Its full website acceptance remains pending. See
[native test evidence](WEB_HUMAN_HANDOFF.md).

## Official documentation

- [Custom Client prerequisites](https://developer.salesforce.com/docs/service/messaging-api/guide/get-started.html)
- [Guest and verified authorization](https://developer.salesforce.com/docs/service/messaging-api/guide/authorization.html)
- [Guest token request reference](https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=generateAccessTokenForUnauthenticatedUser)
- [SSE and reconnect responsibilities](https://developer.salesforce.com/docs/service/messaging-api/references/about/server-sent-events.html)
- [Message and routing events](https://developer.salesforce.com/docs/service/messaging-api/references/about/server-sent-events-structure.html)
