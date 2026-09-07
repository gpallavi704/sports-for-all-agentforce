# Sports for All - Sport Compass

Sport Compass helps athletes, families and coaches navigate fencing and wheelchair-fencing resources, discover club listings and understand their next steps.

**Find your sport. Navigate your next step.**

This Agentforce for Good Builder Track MVP focuses on fencing. Salesforce Agentforce powers both the native Salesforce experience and a private Sport Compass app inside ChatGPT. Other sports, reviewed multilingual support and a standalone mobile app remain planned.

Latest checkpoint: September 7, 2026.

## What works today

- The original Sport Compass version 17 is active in the development org. Its native support-request demo remains intact.
- Ten indexed, project-prepared summaries ground guidance in USA Fencing and Zendesk sources. They are not USA Fencing-approved.
- Two source-checked public club listings are separate from explicitly fictional program examples. Accessibility, equipment and parafencing availability require provider confirmation.
- Apex performs deterministic discovery using mandatory current-message lookups.
- Synthetic support requests use signed drafts, explicit confirmation, server-side validation and idempotent Case creation in a fixed support queue.
- A separate Salesforce public guide, SportCompassGuide version 1, powers the connected private ChatGPT app. It uses the same public knowledge library and club lookup, with no Case, email, booking or private-record actions.
- The branded ChatGPT app has its own Sport Compass icon and four MCP tools: start, ask, end and show the first-visit planner. The user can ask natural questions without typing technical session commands.
- Compact club cards show the club name, location, website and one visible `Needs confirmation` note. Listing sources expand on demand; **Plan my visit** opens the optional checklist.
- The first-visit planner offers selectable preparation topics, a checklist, one-question-at-a-time mode, a copyable contact draft and personal progress marks.
- There are 64 passing local integration/UI-contract tests. Live Salesforce-backed ChatGPT text and interactive-card checks are recorded separately.

The planner's controls run locally in the card. They do not make additional AI calls or update Salesforce. Copying produces an unsent draft, not an email integration. In ChatGPT, clipboard restrictions can trigger a selected-text fallback for manual copying.

The latest recorded Apex deployment suite passed 30 selected tests. An uninterrupted current-version native browser-to-Case demo remains pending. None of these results establish production readiness, full grounding accuracy or accessibility certification.

## Try the interactive demo

With the private Sport Compass app selected in ChatGPT, ask:

> Find a real fencing club in Kaysville, UT. Show the interactive club card.

The compact result appears first, without a three-tab dashboard. Use **Plan my visit**, choose preparation topics and select **Build my checklist**. Try **One step at a time**, **Copy my plan**, or the expandable friendly message. **Back to club result** returns to the compact card. If manual-copy text appears, use Command-C on Mac. General fencing questions should stay conversational unless an interactive plan is requested.

The focused lookup returned Wasatch Fencing Club in the live test. A combined search-and-planning question incorrectly returned no listing, so query/routing reliability still needs improvement. Unknown accessibility must never be treated as proof of inaccessibility or as a verified accessible match.

This is an account-connected private development app, not a publicly published ChatGPT directory listing. The Mac and approved private tunnel must remain running. See [interactive setup and evidence](docs/agentforce/INTERACTIVE_FIRST_VISIT.md).

## Architecture

Native Salesforce demo:

```text
Agentforce Preview -> Sport Compass
    -> Data Library: source-backed guidance
    -> Apex: public club lookup and synthetic program matching
    -> Signed draft -> explicit confirmation -> synthetic Case -> support queue
```

Working private ChatGPT channel:

```text
ChatGPT -> private Secure MCP Tunnel -> public-guidance MCP adapter
        -> Salesforce Agentforce API -> SportCompassGuide
        -> public knowledge and public club lookup

Latest successful guidance -> session-bound snapshot -> interactive first-visit card
                                                      -> local choices and copying
```

The Salesforce integration policy is enabled for the approved private public-guidance demo. Salesforce credentials stay server-side in the existing macOS Keychain setup, not in ChatGPT tool arguments or the widget.

The public adapter is anonymous, not athlete login or end-user OAuth. Short-lived conversation handles are bearer capabilities. The shared Salesforce runtime identity still has permissions required by the native demo; the public guide restricts its action surface rather than claiming that identity is globally read-only. Do not connect private records or business-write actions to this adapter. Those require a separate authenticated authorization and trusted human-confirmation design.

## Repository layout

- `force-app/`: editable Agent Script, Apex, objects, public club metadata, permissions and reporting.
- `knowledge/`: curated sources and retrieval fixtures.
- `data/`: labeled synthetic seed data.
- `mcp-server/`: live public and mock entrypoints, session handling, UI resource, credential helper source and tests.
- `mcp-server/ui/`: interactive first-visit HTML, CSS and JavaScript.
- `assets/branding/`: original icon, compact ChatGPT upload asset and design notes.
- `scripts/`: scoped setup and verification. Live tests can create synthetic Cases; review before running.
- `docs/`: current status, build plan, architecture and historical test evidence.

Generated snapshots, org-bound OAuth exports, credentials, dependencies and raw traces are excluded from Git. This is not a complete org backup. See [repository guide](docs/REPOSITORY_GUIDE.md).

## Local checks

Node 22 or later:

```sh
cd mcp-server
npm ci --ignore-scripts
npm test
npm run smoke:mock
cd ..
node scripts/verify-agent-draft.mjs
```

These checks need no Salesforce credentials and create no CRM records.

To inspect the UI with labelled fixture data:

```sh
cd mcp-server
npm run build:ui
npm run preview:ui
```

Open `http://127.0.0.1:4177`. The local preview supports phone-width and dark-theme checks and does not contact Salesforce. Build the UI before starting the live public entrypoint. Generated `mcp-server/dist/` output is excluded from Git.

The UI uses the official MCP Apps SDK with a self-contained bundle. Existing MCP SDK, MCP Apps and esbuild versions are pinned in the package lock. No additional paid service or public web hosting was introduced.

## Verified and still pending

- Verified locally: 64 tests, compact card at 375-pixel width, dark theme, optional checklist, one-step keyboard controls and return navigation. Earlier checks covered copying and progress marks.
- Verified in ChatGPT: the compact v2 Wasatch card, opening and building its checklist, and returning to the compact result. Earlier checks covered source links, changing topics, keyboard navigation and manual-copy fallback with developer-mode CSP enforcement enabled. ChatGPT can still add a short summary beneath the card.
- Still pending: combined-query reliability, broader multi-turn/adversarial tests, domain review, complete screen-reader/keyboard review and the organizer-provided Accessibility Expert and RAI Self Check skills.
- Not implemented: email sending, calls, bookings, payments, external Case creation, permanent saved plans, verified provider-accessibility feeds, public app submission or production hosting.

The two supported card identities mirror committed Salesforce public-club metadata and appear only when the latest Salesforce reply includes the exact identity and approved website. This is not a direct structured Apex result or an accessibility audit. Card choices reset when the card is recreated; they are not persisted to Salesforce or used as proof of attendance.

Start with [interactive planner](docs/agentforce/INTERACTIVE_FIRST_VISIT.md), [live Salesforce/ChatGPT connection](docs/agentforce/LIVE_PUBLIC_CHATGPT.md), [current status](docs/STATUS.md), [support evidence](docs/agentforce/SUPPORT_FIX_V8.md) and [MCP setup](mcp-server/README.md). Earlier checkpoint documents are historical. Architecture images show the intended design, not proof that every component is live.

## Data and safety

Never commit credentials, authentication files, raw capability-bearing traces, private exports or participant medical details. Synthetic examples must remain labeled. Public sources do not establish accessibility, eligibility or endorsement. The agent does not diagnose impairments or make official classification decisions.
