# Human handoff review

September 9, 2026. This review updates the public Salesforce agent's handoff
instructions and checks existing routing configuration without starting a chat.
SportCompassGuide version 6 compiled and published successfully, and its active
status was confirmed through the Salesforce API.

## Visitor experience

For native AI-to-human transfer, the agent briefly summarizes the selected club,
first-visit goal and unanswered question before asking whether the project team
may read the conversation. A club is included only when selected from the latest
successful directory results. No club selection is required to ask for general
help. Personal or medical details are not repeated in the summary.

The summary is text in the existing conversation. It does not remove information
already in that conversation or limit what an operator can read. Consent covers
the conversation, not only the summary. No referral or Case is created.

| Situation | Intended response |
| --- | --- |
| Visitor requests a person | Brief summary, project-team destination and consent question. |
| Visitor agrees in a later reply | Attempt the existing Messaging transfer once. |
| Visitor corrects the summary without agreeing | Correct it and ask permission again. |
| Visitor declines | Continue club or fencing guidance without routing. |
| Routing starts | Say the team is being checked and acceptance is still needed. |
| Transfer fails and control returns to the agent | Acknowledge the failed connection and give the selected club's contact link or the official finder. |
| Client confirms a human participant has joined | The client can show connected status based on that real event. |
| Channel has no linked Messaging session | Link to the Salesforce public page's separate Chat with a person option. Explain that the existing chat is not transferred. |

No fixed waiting time, staffing schedule, callback or USA Fencing staff connection
is promised. Unknown routing failures are not described as confirmed offline status.

## Existing routes checked

- The active `SportCompass_Web_Handoff` version was inspected through Salesforce
  metadata on September 9. It matches the existing channel validation,
  availability check and queue-routing design in source.
- The AI-first flow accepts sessions only from `SportCompass_PublicChat` and
  routes to `SportCompass_Web_Fallback` after a positive online-operator count.
- Online operator count does not establish spare capacity or acceptance. See
  [Salesforce availability documentation](https://help.salesforce.com/s/articleView?id=sf.omnichannel_check_availability_for_routing.htm&type=5).
- The separate direct-human source configuration uses
  `SportCompass_HumanSupport`, a queue handler, availability checking and a queue
  threshold of two. It bypasses the AI agent and its instructions.
- The Salesforce public page already distinguishes a ready/open chat window from
  a human accepting it. Switching from AI to direct-human mode opens a separate
  conversation and does not copy previous messages.

The routing flow and direct-human channel were not changed by this wording update.
Its live flow currently has no explicit fault connectors on availability or route
actions. Platform handling of routing faults, no-capacity, declined offers and
offline returns still needs an authorized real Messaging test. Prompt fallback
instructions apply only if control returns to the agent; they do not create a
transport-level timeout or recover a disconnected client.

## Team website and private ChatGPT app

Jon's direct-human polling integration controls its own interface and is deployed
separately. Updating this Salesforce agent does not change those client messages.
For that client, use the following state wording with real routing and participant
data retrieved by the backend:

| Confirmed state | Suggested text |
| --- | --- |
| Support conversation created, no acceptance yet | Your support chat is open. Waiting for a team member to accept. |
| Human participant joined | You are connected to the Sports for All project team. |
| Platform reports no operator available | No team member is available right now. You can continue with the AI guide or contact the club directly. |
| Request failed or status is unknown | We could not confirm a connection. Please try again later. |
| Conversation ended | This support chat has ended. |

Do not infer acceptance from token issuance, session creation or successful message
submission. Polling must retrieve participant/routing state as well as messages.
Do not automatically copy a prior Agent API transcript into a separate Messaging
conversation. The visitor can choose to paste a short summary.

## Verification

All 15 existing local public-page checks passed, including waiting wording,
unavailable fallback, separate human routing and no session launch before readiness.
These checks run locally with a simulated browser; they do not invoke Agentforce.
Salesforce compilation/publication and a read-only active-version check verify the
configuration. No new conversation, routing request or operator availability
change was made for this review.

Behavioral checks still to run with authorization: consent and refusal, summary
correction, selected-club context, acceptance, no online operators, full capacity,
declined or expired offers, client disconnect and separate-visitor isolation.
Agent preview alone is insufficient for escalation testing; use real Messaging
with a test operator. See [Salesforce preview limitations](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-dx-nga-preview.html).
