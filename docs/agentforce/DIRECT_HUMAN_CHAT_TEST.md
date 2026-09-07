# Direct human chat verification

Verified September 7, 2026 in the Salesforce native Enhanced Web Chat test page.

## Separate human route

- Channel: `SportCompass_HumanSupport` (`0MjgL000000hPPlSAM`).
- Routing: `Queue`, directly to `SportCompass_Web_Fallback`.
- Web deployment: `SportCompass_HumanSupport` (`04IgL000000fHw9UAE`).
- Custom Client deployment: `SportCompass_HumanClient` (`04IgL000000fHxlUAE`).
- Organization ID: `00DgL00000c7pj3`.
- Service URL: `https://orgfarm-4d89d5ac56.my.salesforce-scrt.com`.
- Guest-token request for the Human Client returned HTTP 200 with deployment type `API`.
- Customer attachments and transcript downloads are disabled.
- Web chat visibility checks operator availability; configured queue limit is 2.

Existing `SportCompass_PublicChat` and `SportCompass_CustomClient` remain AI-first.
Use a new Messaging conversation for human support, not an existing Agent API
session or resumed AI Messaging conversation. The native test browser initially
resumed an older AI conversation; the verified test below used a fresh chat.

## Native round-trip evidence

Session: `MS-00000012`, record `0MwgL00000ER97BSAT`.

1. Visitor began a new chat at 14:16:27 Pacific with a synthetic support question.
2. Omni displayed an inbound request for Sport Compass Human Support.
3. The operator accepted it as Pallavi G at 14:16:56 Pacific.
4. The visitor message appeared in the support console.
5. A reply sent through the operator console appeared in the visitor window.
6. The visitor's confirmation appeared in the operator console.
7. No Agentforce participant joined the fresh conversation.
8. The operator ended the chat at approximately 14:18 Pacific; the visitor saw
   the ended event and the operator leave. Operator presence was returned offline.

The distinctive test reference in the transcript was manually entered solely to
identify the test. It is not a prompt, UI label, required phrase or agent output.
No Case, contact, outbound email or club communication was created by this test.

## Website and public page follow-up

This proves the native Web channel's direct human route. The team later reported
a successful website exchange through `SportCompass_HumanClient` using polling.
That report does not independently verify the entire Custom Client implementation.
The Salesforce-hosted public page now also opens this human channel through its
native Web deployment; a new two-way landing-page test remains pending.
For website tests, start a new support conversation, show the project-team
destination, and exchange messages after an operator accepts.
Do not copy the AI transcript without consent. Render actual waiting, accepted,
offline/error and ended events; do not promise a callback or guaranteed staffing.
