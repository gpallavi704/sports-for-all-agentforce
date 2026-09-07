# Sports for All - Sport Compass

Sport Compass helps athletes, families and coaches navigate fencing and wheelchair-fencing resources, discover club listings and understand their next steps.

**Find your sport. Navigate your next step.**

This Agentforce for Good Builder Track MVP focuses on fencing. Other sports, reviewed translation and additional client channels are planned, not implemented capabilities.

## What works today

- Version 12 is active in the development org.
- Ten indexed, project-prepared summaries ground guidance in USA Fencing and Zendesk sources. They are not USA Fencing-approved.
- Two source-checked public club listings are separate from explicitly fictional program examples. Accessibility, equipment and parafencing availability require provider confirmation.
- Apex performs deterministic discovery using mandatory current-message lookups.
- Synthetic support requests use signed drafts, explicit confirmation, server-side validation and idempotent Case creation in a fixed support queue.
- A local mock-only MCP server, Agent API client and caller-bound session broker have 43 passing local tests. ChatGPT is not connected.

The latest deployed Apex suite passed 30 selected tests. Support tests passed on version 8; version 9 changes knowledge-link formatting and passed a separate browser check. An uninterrupted current-version browser-to-Case demo remains pending. These results are not production-readiness or accessibility certification.

The [version 10 presentation fix](docs/agentforce/RESPONSE_PRESENTATION_V10.md) adds shorter guidance and suppresses native file citations while keeping original public links. The fresh browser retest passed. CLI preview strips Markdown, so URL-presence assertions for two CLI fixtures failed; the limitation is recorded rather than treated as a pass.

## Architecture

Current:

```text
Agentforce Preview -> Sport Compass
    -> Data Library: source-backed guidance
    -> Apex: public club lookup and synthetic program matching
    -> Signed draft -> explicit confirmation -> synthetic Case -> support queue
```

Planned external channel:

```text
ChatGPT -> authenticated MCP transport -> Agentforce Agent API -> Sport Compass
```

The external integration app remains disabled. External model text cannot serve as human consent. A trusted confirmation interface and live caller/session-isolation tests are required before external write access. The configured native confirmation flag did not produce a separate second prompt in the latest deterministic support test. Do not describe it as two independent gates.

## Repository layout

- `force-app/`: editable Agent Script, Apex, objects, public club metadata, permissions and reporting.
- `knowledge/`: curated sources and retrieval fixtures.
- `data/`: labeled synthetic seed data.
- `mcp-server/`: integration source, mock transport, credential helper source and tests.
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

Start with [current status](docs/STATUS.md), [build plan](docs/BUILD_PLAN.md), [support evidence](docs/agentforce/SUPPORT_FIX_V8.md) and [MCP setup](mcp-server/README.md). Earlier checkpoint documents are historical. Architecture images show the intended design, not proof that every component is live.

## Data and safety

Never commit credentials, authentication files, raw capability-bearing traces, private exports or participant medical details. Synthetic examples must remain labeled. Public sources do not establish accessibility, eligibility or endorsement. The agent does not diagnose impairments or make official classification decisions.
