# Sport Compass architecture diagrams

Updated September 7, 2026. These are current MVP architecture illustrations, not
a production-readiness certification. Use the v2 files for project sharing.

## Current images

- [System architecture](system-design-v2.png): user-facing channels, Salesforce
  guidance, direct human support and the separate Builder demo.
- [Technical solution design](technical-solution-design-v2.png): APIs,
  deployments, tools, routing and access boundaries.
- [Image-generation briefs](image-prompts.md): reproducible design specifications
  and final edit prompts. Created with the built-in image generation tool.

Both images were visually checked for labels and routing. Earlier concepts are
preserved in [archive/](archive/README.md), outside the current design set. They
contain proposals that do not describe the current deployment.

The v2 images predate the isolated judge self-test addition below. The main README's
Mermaid diagram and judge-access runbook include that addition. The public routes
shown in these images are unchanged.

## System architecture text description

The public team website and the team's ready private ChatGPT app, **Sports 4 ALL**,
use a server-side adapter and the Salesforce Agent API to reach
`SportCompassGuide`. The private app is not publicly listed in the ChatGPT app
directory. Its readiness was reported by the team; it is not the retired local
development app or tunnel.

The Salesforce public Site uses a controller-free Visualforce page and native
Web Chat to reach the same public guide. The guide can retrieve project-prepared
USA Fencing and Zendesk public-source summaries from its Agentforce Data Library,
backed by Data Cloud retrieval, or use deterministic Apex to look up reviewed
public-club Custom Metadata. It returns short guidance and source links without
guaranteeing classification, eligibility or accessibility.

Human support is a separate journey. The visitor chooses human help, then the
team UI uses the HumanClient API deployment or the Salesforce public page uses
the HumanSupport Web deployment. Both reach the direct-human Messaging channel
and Omni-Channel queue. An available project operator must accept the work.
The base judge role has read-only access to the Messaging Session and conversation.
An additional time-limited operator permission allows a separate judge self-test
through `SportCompass_JudgeDemo` and `SportCompass_Judge_Queue`. It does not add
the judge to the public support queue or grant general Messaging Session Edit.
Opening a chat does not mean a human has accepted it, and switching modes on the
Salesforce public page does not copy the earlier AI conversation.

The native AI-first Messaging channel also has a consent-based handoff Flow to
the same queue. This is not an automatic transfer of a headless Agent API
session into Messaging.

The original `SportCompass` version 17 Builder demo is preserved separately. Its
explicitly synthetic program matching and consented demo Case creation are not
exposed through the public guide. More sports, other NGB orgs and reviewed
multilingual support remain future work.

## Technical design text description

1. **Headless guidance:** team website or private Sports 4 ALL ChatGPT app,
   server-side Salesforce OAuth, Agent API session start/message/end,
   `SportCompassGuide`, then knowledge retrieval or
   `FindPublicFencingClubsAction`.
2. **Native guidance:** Salesforce Site and Visualforce,
   `SportCompass_PublicChat` Web deployment, then `SportCompassGuide`.
3. **Direct human support:** `SportCompass_HumanClient` for the team's API client
   or `SportCompass_HumanSupport` for native Web. The latter is selected on the
   public page with `?support=human`. The human channel routes to a queue, not to
   Agentforce.
4. **Routing and operator:** `SportCompass_Web_Fallback` queue, an available
   operator accepting in `SportCompass_Support`, and the Enhanced Conversation
   component `scrt:conversationBody`. The native AI-first alternate route is
   `SportCompass_Web_Handoff`, subject to its Messaging/session and consent checks.
5. **Records and roles:** Messaging Session and conversation history are visible
   to a time-limited judge viewer. The base viewer permission cannot send messages
   or end sessions. A separate temporary judge operator role, presence status and
   isolated queue support self-guided testing until the end of September 22 Pacific.
   Live acceptance succeeded and the user reported that the test worked; the final
   reply text and closure were not independently captured.

The public Site guest profile has no CRM object-permission grants. Messaging
still creates and retains platform conversation records. Credentials remain
server-side. Adapter session isolation, expiry and authorization are security
requirements; broader failure and isolation testing is still necessary. The
shared Salesforce runtime identity is not globally read-only merely because
the public guide exposes limited actions.

Native two-way human chat, public chat loading, scoped permission checks and
local tests have evidence. The team reported custom UI polling and successful
human chat. These are different evidence levels, not a guarantee that every
client and failure path has been tested. Further testing covers isolation,
failure handling and accessibility.

## Supporting implementation notes

- [Main architecture and technical stack](../../README.md#system-architecture)
- [Salesforce public page](../agentforce/PUBLIC_SALESFORCE_PAGE.md)
- [Direct human chat test](../agentforce/DIRECT_HUMAN_CHAT_TEST.md)
- [Enhanced Chat API handoff](../agentforce/ENHANCED_CHAT_API_HANDOFF.md)
- [Native Web handoff](../agentforce/WEB_HUMAN_HANDOFF.md)
- [Judge chat access](../agentforce/JUDGE_CHAT_ACCESS.md)
