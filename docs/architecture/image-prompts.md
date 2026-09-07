# Architecture image-generation briefs

Mode: built-in image generation and editing. Use case: infographic-diagram.
The original hand-drawn PNGs were used as edit targets. Current selected outputs
are `system-design-v2.png` and `technical-solution-design-v2.png`.

## Shared visual specification

Bright whiteboard-style infographic, pure white background, dark navy hand-drawn
outlines, royal blue and restrained gold accents. Large legible lettering,
spacious grouped sections, small fencing illustrations. No dark backgrounds,
em dashes, official organization mascots, credentials or production-certification
claims. Keep the Sport Compass name and distinguish current implementation,
team-reported availability, testing evidence and future capabilities.

## System architecture specification

Title: SPORT COMPASS | SYSTEM ARCHITECTURE.
Subtitle: Fencing for All: public guidance and a separate path to human help.
Current MVP | September 2026.

Two lanes: AI guidance and chat with a person. Public team website plus the ready
private Sports 4 ALL ChatGPT app connect through a server-side adapter and
Salesforce Agent API to SportCompassGuide. The Salesforce public page uses native
Web Chat to reach the same guide. Show its Data Library/Data Cloud retrieval from
USA Fencing and Zendesk public-source summaries, and its parallel Apex public-club
lookup against reviewed Custom Metadata. Responses are short, cited and honest
about unknown accessibility.

The human lane runs from visitor choice through the HumanClient API or
HumanSupport Web deployment, Enhanced Chat, Omni-Channel queue, operator
acceptance, then Messaging Session/history and read-only judge review. Show
native Messaging consent-based AI handoff to the queue as an alternate dashed
route. Do not imply that an Agent API session converts into a Messaging Session.
Show that team availability is needed and the Salesforce page does not copy the
AI conversation into a new human chat.

Bottom panels: public safety, separate SportCompass v17 synthetic Builder demo,
and future sports/NGB/multilingual expansion. Footer distinguishes verified
native two-way chat from reported team website success and broader testing.

## Technical design specification

Title: SPORT COMPASS | TECHNICAL SOLUTION DESIGN.
Subtitle: Salesforce AI reasoning, separate Messaging transport, scoped access.
MVP architecture | September 2026.

Three bands: public guidance, direct human support, trust and state boundaries.
Show server-side Salesforce OAuth and Agent API start/message/end, plus the
Salesforce Site and SportCompass_PublicChat native Web deployment. Both reach
SportCompassGuide, with Public_Guidance, Find_Real_Clubs and a native-only
Human_Support route. Show Agentforce Data Library/Data Cloud retrieval and
FindPublicFencingClubsAction with Apex/Custom Metadata as distinct tools.

Show SportCompass_HumanClient API and SportCompass_HumanSupport Web merging into
the direct-human channel with Queue handler, then SportCompass_Web_Fallback,
operator acceptance in SportCompass_Support, and MessagingSession/Enhanced
Conversation. Use the exact component label scrt:conversationBody. The separate
native AI handoff path runs from the guide through SportCompass_Web_Handoff
directly to the queue, not to the human channel. Judge viewer has read-only
session/transcript access, with no sending or ending rights. Render waiting,
accepted, messages and ended as actual lifecycle states.

Boundary panels cover server-side credentials and session isolation/expiry,
one native deployment per page load and channel-scoped history, guest/operator/
judge permissions, and the separate v17 signed-draft/consent/idempotent Case demo.
Do not claim that the shared runtime identity is globally read-only.
Footer: verified native chat/public window/permission checks/local tests;
further isolation/failure/accessibility testing; future sports/multilingual/
multi-org routing. Do not include a pending judge UI label.

## Final applied edit prompt: system

Edit this existing system architecture infographic. Preserve its bright whiteboard style, main title SPORT COMPASS, all technical content and routes. Make one update to the leftmost box in AI GUIDANCE: replace the current "Team website / headless UI" with two clearly distinguished client entries inside a slightly wider or taller box: "Team website" with a small "Public" label, and "Sports 4 ALL" with a small "Private ChatGPT app" label. Use a browser icon and small chat icon if space permits. Both share the existing arrow to "Server-side adapter + Salesforce Agent API" and SportCompassGuide. This represents a ready private ChatGPT app reported by the team, NOT a future item and NOT publicly listed in the ChatGPT app directory. Keep the Salesforce public page as its own unchanged lower entry. Preserve every other label, route, safety boundary and footer, and retain no em dashes. Do not add a separate AI model or bypass Salesforce.

## Final applied edit prompt: technical

Edit this existing technical solution design infographic. Keep all layout, icons, arrows, other labels and bright whiteboard theme unchanged. Make only these two updates:

1. In band 1, path A, replace the first box "Team UI / MCP adapter" with readable labels identifying both ready client surfaces: "Team website" and "Sports 4 ALL" followed by "(private ChatGPT app)". If needed widen this box slightly and move adjacent boxes modestly without breaking arrows. Both continue through the SAME existing server-side Salesforce OAuth and Salesforce Agent API into SportCompassGuide. Do not bypass Salesforce. Treat the private ChatGPT app as current, not publicly listed or future.
2. In the footer, remove "Pending: judge UI confirmation,". Replace that footer sub-block with exactly "Further testing: broader isolation, failure handling and accessibility." Keep the adjacent Verified statement and Future statement unchanged. Do NOT turn the removed judge UI note into a verified claim, and do not remove the Judge viewer access box.
All other current labels, deployment names, native handoff routing and content remain unchanged. No em dashes. Render only the updated infographic.
