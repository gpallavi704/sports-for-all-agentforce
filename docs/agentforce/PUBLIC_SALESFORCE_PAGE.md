# Salesforce-hosted Sport Compass

Checkpoint: September 7, 2026, 2:43 PM Pacific.

Public URL: https://orgfarm-4d89d5ac56.my.salesforce-sites.com/sportcompass

## Delivered

- `SportCompassPublic`: controller-free Visualforce landing page.
- `SportCompass_Public`: active Salesforce Site with `/sportcompass` path.
- `Sports4AllLogo` and `SportCompassTeamAvatar`: public static resources matching
  the team's current website. The earlier compass icon is preserved separately.
- `SportCompass_PublicChat`: existing Web v1 native Enhanced Chat deployment.
- `?support=human`: separate direct-to-team view using the published
  `SportCompass_HumanSupport` Web deployment. The default remains AI guidance.
  Only one deployment is initialized per page load. Mode-switch links disclose
  that the chat window resets and previous-channel messages are not transferred.
- Native chat branding uses navy `#101832`, blue `#0756CF`, pale blue `#EDF4FC`
  and the same fencing avatar. Salesforce's locked aspect ratio saved 373 by 560
  as the desktop chat dimensions. The host page uses system fonts.
- Responsive host layout, keyboard-visible focus, skip link, live loading/error
  messages, suggested-question copying and expandable privacy information.

The native client is a floating chat window, not a reimplementation of Jon's
custom inline interface. Suggested questions copy text; they do not send it.
The public page does not include microphone, callback or email features.

## Verification

1. Deployment `0AfgL00000WxJk9SAF` created the page, static resources and inactive
   Site. `0AfgL00000WxK9xSAF` activated only this Site after the domain was registered.
2. HTTP request without credentials or cookies returned 200 and the intended page
   title. An HTTP request redirected to HTTPS. The avatar returned 200 image/png.
3. Guest user `005gL00000NgSx7QAF`, profile `00egL00000CgGkbQAF`, had zero
   `ObjectPermissions` records. `SetupEntityAccess` contained the public ApexPage
   and its default TabSet, with no Apex class grants. No object access was added.
4. Public browser visit displayed the logo, avatar and matching chat theme. The
   Start a conversation button opened the native client without a login prompt.
5. Asked: "What should I ask a coach before my first wheelchair fencing visit?"
   The actual agent replied with loaner gear/frame guidance, a USA Fencing source
   link and a follow-up question. This was not a mocked response.
6. Test MessagingSession `0MwgL00000ER70XSAT` started at 20:49:56 UTC and was
   ended at 20:52:49 UTC. No Case or outbound email action was executed.
7. Fifteen local page and metadata contract tests passed with
   `node --test scripts/test-public-page.test.mjs`. These cover readiness, launch,
   timeout, failure/retry, copying, public scope, mode selection, channel-scoped
   history configuration, human-deployment dependencies, judge read-only access
   and basic markup invariants.
8. Main text color pairs were calculated: white/blue 6.48:1, muted/pale-blue
   6.45:1, gold/navy 10.22:1. These checks are not an accessibility certification.
9. Deployment `0AfgL00000WxRL7SAN` updated the public page with the direct-human
   choice. A fresh public browser tab loaded the human view, reached Support chat
   ready, and opened the native chat window with an empty message composer and
   no AI greeting. No test message was sent during this page-level check.
   The existing public tab initially timed out; a fresh tab loaded successfully.
   The previously verified direct-channel two-way test is recorded in
   [direct human chat evidence](DIRECT_HUMAN_CHAT_TEST.md). A new two-way exchange
   specifically from this landing page remains pending.

Full screen-reader, mobile-device and independent browser-profile isolation tests
remain pending. Anonymous HTTP testing plus the public-browser happy path does not
establish all multi-visitor isolation, abuse-prevention or production-readiness properties.

## Routing and operations

The default view reuses the AI-first `SportCompass_PublicChat` channel and opens
`SportCompassGuide`. Its existing consent-based Omni-Channel handoff is preserved.
The **Chat with a person** choice navigates to
`/sportcompass?support=human#main`, using `SportCompass_HumanSupport`, which routes
directly to `SportCompass_Web_Fallback` without an AI agent. **Ask the AI guide**
returns to the default view. Both set Salesforce's
`restrictSessionOnMessagingChannel` option to keep displayed history scoped to the
selected channel. This is a separate conversation, not a transcript-transfer feature.
See [human handoff evidence](WEB_HUMAN_HANDOFF.md).

An operator's current presence must be checked before the demo. A staffed
demo requires an operator in Sport Compass Support with Available - Sport Compass Chat
selected. No callback or immediate response is guaranteed. Do not identify the
project operator as USA Fencing staff.

The generated ESW supporting site and Parth's Marketing Landing Pages were not
changed. Jon's hosted site, ZIP and API implementation were not modified. No custom
domain, paid infrastructure, new licenses, visitor record permissions or additional
LLM service was introduced.

## Redeployment notes

Site metadata omits legacy `requireHttps`, `requireInsecurePortalAccess` and
`cspUpgradeInsecureRequests` fields rejected by this org's API 67 deployment parser.
The actual public endpoint redirects HTTP to HTTPS. Domain registration and its
terms are an org-owner setup step, not something to automate through source deploys.

The branding set references this org's public static-resource URLs. Update them
when deploying to another org. Publish changes from Embedded Service Deployments
after editing branding, then allow Salesforce's publication/cache propagation.
The `areGuestUsersAllowed` value is preserved exactly as retrieved rather than
being used as an assumption about messaging authentication. The messaging channel
uses UnAuth and the observed native public session succeeded.
