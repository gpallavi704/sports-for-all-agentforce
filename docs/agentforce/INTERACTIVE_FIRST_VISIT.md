# Interactive first-visit planner

September 7, 2026. The Sport Compass private ChatGPT app now includes an MCP Apps
resource and a separate, read-only rendering tool. Salesforce remains the agent
backend. This update does not change either Salesforce agent or enable business
writes.

## Experience

1. Ask a natural fencing or first-visit question with Sport Compass selected.
2. Salesforce Agentforce supplies public guidance and club links.
3. ChatGPT calls `show_visit_planner` with the same opaque conversation handle.
4. The card shows a public club identity, sources and explicit unknown access,
   wheelchair-fencing and equipment statuses.
5. Choose topics, build a checklist, switch to one-question-at-a-time mode, copy
   the plan or copy an unsent contact draft. Personal progress marks are optional.

Explore, Prepare and Take away controls run entirely inside the rendered card.
They make no further AI or Salesforce calls. The card does not send email, contact
clubs, book visits, create Cases, collect diagnoses or update Salesforce records.

## Architecture

`ChatGPT -> public MCP adapter -> Agentforce API -> public guidance`

`latest successful reply -> bounded visit snapshot -> show_visit_planner -> card`

The first three tools remain `start_sport_compass`, `ask_sport_compass` and
`end_sport_compass`. The fourth tool accepts only a conversation handle, not
model-provided club facts, destinations or URLs. Rendering reuses a session-bound
snapshot. It does not call Salesforce again. Failed follow-ups invalidate the
snapshot; expired, ended, unknown and wrong-principal handles cannot render it.

The private public adapter remains anonymous. Handles are short-lived bearer
capabilities, not athlete identities. Do not use this connection for private
records or authenticated business actions. See the
[existing integration boundary](LIVE_PUBLIC_CHATGPT.md).

## Source limitations

The two supported card identities mirror the committed Salesforce public-club
metadata. A card appears only when the latest projected Salesforce reply contains
both its full name and exact allowlisted website. A regression test checks local
metadata parity. Identities older than 90 days are suppressed until reviewed.

This is presentation of an identity mentioned in generated Salesforce guidance,
not a direct structured Apex search result, a new live directory search or
independent verification. Accessibility and equipment always remain
`Needs confirmation`. Selecting a preference or marking personal progress cannot
change those facts. An unsupported or empty result offers the official club
finder instead of inventing a club. Broader structured search provenance is a
future improvement.

## UI implementation and boundaries

- Semantic HTML, native buttons and checkboxes, visible focus, labelled controls,
  44-pixel minimum controls, mobile layout and host light/dark themes.
- No external fonts, asset requests, analytics, storage or runtime fetch calls.
  The CSP declares no connect, resource or nested-frame domains.
- Public links use the host's explicit open-link action. No automatic navigation.
- Untrusted text is inserted with `textContent`, not interpreted as HTML.
- Clipboard access is requested only on a copy-button click. When unavailable,
  a labelled text area selects the content for manual copying.
- Choices and progress exist only in the mounted card. They are not shared with
  the model or Salesforce and can reset on reload or rerender. ChatGPT and
  Salesforce may still retain the separate conversation according to their own
  settings. No zero-retention claim is made.
- No medical assessment, eligibility prediction, attendance verification or
  accessibility certification is implemented.

## Build and local verification

```sh
cd mcp-server
npm ci --ignore-scripts
npm test
npm run preview:ui
```

`npm test` builds the self-contained resource before running the suite. The
generated `dist/first-visit.html` is Git-ignored and must be built before starting
the live public entrypoint. The UI uses pinned `@modelcontextprotocol/ext-apps`
1.7.5 and esbuild 0.28.2, alongside the existing MCP SDK 1.30.0. The bundle is about
520 KB. No new paid service or public hosting was added.

The preview listens only on `127.0.0.1:4177`. It is clearly labelled as a fixture
test, does not call Salesforce and captures link attempts instead of opening a
provider website. It is not evidence of live retrieval.

Observed local checks: 63 automated tests pass; the fixture card renders at
375-pixel width and in dark mode; topic selection, four-question checklist,
one-step navigation, clipboard copy and personal progress marks work. Full
screen-reader testing and the organizer's Accessibility Expert and RAI Self Check
reviews are still pending. These observations are not a WCAG certification.

## Live ChatGPT verification

The refreshed private app exposes all four tools and the HTML template. In this
[live test conversation](https://chatgpt.com/c/6a9e99d5-8ac0-83e8-82f0-5d2cf6ea4ce4),
the focused request `Find a real fencing club in Kaysville, UT. Show the interactive
club card.` returned the Wasatch card with public links and unknown access labels.
The first, combined search-and-planning prompt incorrectly returned no reviewed
listing. That query/routing limitation remains open; the passing focused query
does not establish reliable results for all natural-language phrasing.

With the user's explicit approval, ChatGPT's account-wide `Enforce CSP in
developer mode` setting was enabled and the conversation reloaded. The card still
rendered. Live tests confirmed editing topic choices, building the updated
checklist, and Enter/Tab/Return navigation into one-step mode and the next
question. This is a targeted keyboard check, not a complete keyboard audit.

Direct clipboard writing was blocked in the ChatGPT iframe. The copy action
correctly displayed and selected the full plan in its manual-copy text area.
Users can press Command-C after this fallback. No club was contacted. The UI
clears any previous copy fallback when the plan or panel changes so old text is
not presented as the updated plan.

## Deployment notes

The existing private tunnel must run the public entrypoint, with the resource
built. Refresh the existing Sport Compass app's tools in ChatGPT settings after
changing the manifest. A fresh chat avoids stale tool catalogs and expired
conversation handles. Keep the Mac awake and the tunnel process running.

A unique widget domain is not configured. ChatGPT flags this as required for
public app submission; this remains a private development app, not a published
directory listing.

## References

- [OpenAI ChatGPT UI guidance](https://developers.openai.com/plugins/build/chatgpt-ui)
- [OpenAI Apps reference](https://developers.openai.com/plugins/reference)

The UI/UX skill informed focus handling, responsive controls and the optional
one-step display. OpenAI guidance informed the separate data/render tools and
the MCP Apps host bridge.
