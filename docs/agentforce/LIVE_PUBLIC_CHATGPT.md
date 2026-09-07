# Salesforce-backed public ChatGPT connection

September 7, 2026. The user selected public guidance only and approved connecting
the existing ChatGPT app to Salesforce. Salesforce remains the agent backend.
The integration is for private development testing, not public app distribution.

Latest update: the app now has four tools, including the read-only
`show_visit_planner` resource. All 63 local tests pass. A live interactive Wasatch
card, topic choices, keyboard navigation and clipboard fallback were checked
after enabling developer CSP enforcement with the user's approval. A broader
combined-query lookup failed and remains a documented limitation. See
[interactive implementation and evidence](INTERACTIVE_FIRST_VISIT.md).
The three-tool and 53-test counts below describe the earlier text-only checkpoint.

## Implemented and observed

- Published and activated `SportCompassGuide` version 1 in the authorized org.
  Runtime ID: `0XxgL000002YosTSAS`.
- Reused the existing indexed public knowledge library and public club Apex
  action. The new configuration binds exactly two external targets:
  `FindPublicFencingClubsAction` and `streamKnowledgeSearch`.
- The original `SportCompass` version 17 remains active and unchanged.
  Its native support demo was not removed.
- Added a separate, explicitly opted-in stdio entrypoint for the public guide.
  Org, runtime agent and public URL allowlist are fixed in code. Tool input cannot
  select an agent, user, org, raw session, Salesforce action or credential.
- Three MCP tools support start, ask and end. Real Salesforce session start,
  guidance, Kaysville club lookup, denied Case/email request and session end
  passed through the actual SDK stdio client. Replies returned `mock: false`.
- The live test returned Wasatch Fencing Club, with accessibility and equipment
  explicitly unverified. The write request was declined.
- Before and after checks both returned 13 Cases and the same latest modification
  time, `2026-09-07T07:52:37.000+0000`. This is a Case-only aggregate check,
  not an audit of every Salesforce session, logging or telemetry record.
- The integration policy is now enabled for the approved public demo.
  Enablement deployment: `0AfgL00000Wump8SAB`.
  Pre-change non-secret backup retrieval: `09SgL00000dyxwPUAQ`.
- Stopped only the verified original mock tunnel process and started a live
  profile on the same private tunnel. The original mock profile/code is retained.
  Existing Sport Compass Test therefore targets the live public guide while this
  profile runs; it is no longer an isolated mock endpoint.
- All 53 local integration tests pass. The live smoke test is separate evidence.
- Browser end-to-end club lookup passed in ChatGPT. A fresh conversation asked
  Sport Compass Test to start and find a real club in Kaysville. The response
  returned Wasatch Fencing Club with clickable club and division-directory links.
  The expanded work summary reported starting Sport Compass and finding the
  club. The live tunnel logged two forwarded MCP commands, and readiness was 200.
  Conversation:
  https://chatgpt.com/c/6a9e8f72-4b44-83e8-b2d0-8b3d21f449d9
- The follow-up in the same ChatGPT conversation returned a first-visit checklist
  and explicitly said that accessibility and equipment were not publicly confirmed.
- The user completed the branded Sport Compass app creation with the uploaded
  icon. Settings independently show connected status, all three live guidance
  tools and `noauth`, with authorization supported/used both None.
  App ID: `asdk_app_6a9e92e61bb0819188860969c347a274`.
  App: https://chatgpt.com/plugins/plugin_asdk_app_6a9e92e61bb0819188860969c347a274
  The earlier OAuth discovery error does not describe this successful connection.
  This is a private development app, not a reviewed public-directory listing.
- A fresh chat launched with the branded app selected passed a natural-language
  test: "Where can I try wheelchair fencing in Kaysville, Utah?" No explicit
  start/session command was included. ChatGPT started the conversation and used
  the connector, then returned Wasatch Fencing Club and the public division
  directory link. It explicitly said wheelchair fencing was not confirmed and
  advised confirming coaching, step-free access and equipment. The visible work
  summary confirmed Sport Compass navigation. Local tunnel readiness was 200.
  Conversation: https://chatgpt.com/c/6a9e93c4-a5fc-83e8-95ef-417e5a614d04
  This proves the selected-app flow for one query, not automatic routing in every
  unrelated chat or long-running session reliability.

## Anonymous public boundary

OpenAI documents that read-only anonymous MCP servers are permitted for public
information: [authentication guidance](https://developers.openai.com/plugins/build/auth).
This mode does not identify or authenticate individual athletes. Random,
short-lived conversation handles are bearer capabilities, not identity proof.
Do not submit personal, medical, identity or member-account data. Knowledge and
club listings are public, but conversations can still be processed/logged by
ChatGPT and Salesforce. No zero-retention claim is made.

The Salesforce service identity is reused; it still has permissions required by
the original native demo. The public agent binds no support or generic CRM
actions. This is action-surface restriction, not a claim that the shared runtime
identity has lost all write permissions. Review deployments whenever that action
surface or knowledge library changes. A dedicated runtime identity is a future
hardening step. Private records or business-write features require a separate
authenticated design and trusted confirmation, not this anonymous adapter.

Only a private developer tunnel is configured. There is no public HTTP listener,
paid hosting, new identity provider, mobile app or actual email service.
The [tunnel documentation](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
describes its development purpose and org/workspace access boundary.

## Operations

The live tunnel was started from this Codex task. Keep this Mac awake and the
process running during the demo. Starting the old mock profile for the same
tunnel can serve mock traffic instead; do not run both profiles simultaneously.

Local-only profile and launcher are Git-ignored:
`tmp/sport-compass-tunnel.nEQiht/sport-compass-live.yaml` and
`tmp/sport-compass-tunnel.nEQiht/run-live-tunnel.mjs`.
Credentials stay in their existing Keychain items, not the profile or repository.
The child MCP process receives an empty environment rather than the tunnel key.

To stop external access, stop the live tunnel. To additionally disable the
Salesforce client, deploy the saved disabled policy from
`tmp/public-guide-live-before/extlClntAppPolicies/` after checking current org
state for unrelated changes. Disabling a client is not proof that all previously
issued tokens were revoked.

## Remaining limits

The live API responses still sometimes add closing questions and source text
needs presentation testing. The first smoke run suppressed some punctuation-
suffixed approved links. The projection now allows only canonical root-slash and
sentence-punctuation normalization; unapproved paths/query strings remain blocked.
A regression test covers this, but full citation grounding is not proven by a
rendered source link. Domain review, accessibility/RAI checks, translations,
persistent hosting and broader adversarial testing remain pending.
