# Sport Compass — End-to-End MVP Build Plan

## Mission

Build one credible fencing journey from ChatGPT through MCP to Agentforce: discover appropriate demo programs, understand source-backed next steps, and request human support with consent. The agent remains inactive and program records remain fictional.

[Current status and pending items](STATUS.md) is the consolidated source of truth. Dated documents under agentforce/ preserve historical findings and evidence; resolved issues in those earlier snapshots are not current blockers.

## Locked decisions

- **Project:** Sports for All
- **Agent:** Sport Compass
- **Agent API name:** `SportCompass`
- **Primary client:** ChatGPT app
- **Integration:** MCP server to Agentforce Agent API
- **Reference journey:** Fencing and wheelchair fencing
- **Grounding:** Agentforce Data Library plus structured Salesforce/Data Cloud records
- **Additional language:** One language must be fully tested; Jon's translation capability will be integrated after its contract is confirmed.
- **Data:** Synthetic unless explicitly marked as an approved public source.
- **MVP rule:** One complete end-to-end journey takes priority over optional breadth.

## Delivery gates

### Gate 0 — Repository and scope

Deliverables:

- [x] Private GitHub repository
- [x] Project baseline
- [x] System-design diagram
- [x] Technical-solution diagram
- [x] Agent name and primary journey
- [ ] Confirm hackathon submission deadline and demo duration
- [ ] Confirm additional demo language
- [ ] Confirm Jon's translation API contract

Exit condition: the team accepts the primary journey and avoids adding new MVP channels.

### Gate 1 — Development and org readiness

Deliverables:

- [x] Install Salesforce CLI locally
- [x] Authenticate the provisioned org with a non-secret alias (`sport-compass`)
- [x] Confirm API version supported by the org (67.0 retrieval; schema validated/deployed)
- [x] Confirm Agentforce is On and the Service Agent template is available
- [x] Create the Service Agent and its dedicated user record
- [ ] Confirm the builder user can create and activate an agent
- [x] Confirm Data Cloud/Data Library exists
- [x] Ten sourced summaries indexed; six superseded synthetic knowledge PDFs removed from the library
- [x] Confirm Apex deployment and live invocable execution
- [ ] Confirm Flow, Case intake, runtime Agent API, and External Client App access
- [ ] Record missing licenses and permissions

Exit condition: a basic test agent can be created and invoked inside Salesforce.

Current checkpoint: discovery, knowledge, read-only matching and consent-controlled synthetic Case handoff are deployed. Eighteen Apex tests pass; live Case/queue/report proof is recorded. The agent remains inactive. Repeated edge-case acceptance and API/MCP/ChatGPT integration remain pending. See [current status](STATUS.md).

Builder project ID: `1bYgL000000Xf2nUAC`. Draft version ID: `1bZgL000000rPgDUAU`. These identify the authoring project and version; do not treat them as the runtime Agent API agent ID.

### Gate 2 — Operational Salesforce data model

Deliverables:

- [x] `Sport__c` metadata foundation
- [x] `Sports_Organization__c` metadata foundation
- [x] `Sports_Program__c` metadata foundation
- [ ] Optional after core journey: `Participant_Preference__c`
- [ ] Optional after core journey: `Agent_Interaction__c`
- [x] Synthetic support Case fields, record type, queue, operator list views and summary report
- [x] Scoped discovery and support capability permissions; agent still has no generic Case CRUD
- [ ] Package manifest
- [x] Validate and deploy the three discovery objects into the hackathon org

Exit condition: sample sports programs can be queried and a support Case can be created.

### Gate 3 — Curated data and knowledge

Deliverables:

- [x] Synthetic sports JSON
- [x] Synthetic organizations JSON
- [x] Synthetic programs JSON
- [x] Simulated documented and unknown accessibility examples; neither represents real-world verification
- [x] Curate first 10 public-source summaries: six official-site pages and four Zendesk articles
- [ ] Extend to 15–20 sources after current-season and subject-matter review
- [x] Preserve source URL and displayed update date; explicitly mark missing dates
- [x] Label public-source summaries versus synthetic content and project editorial notes
- [x] Upload and index first 10 source summaries (not yet approved by USA Fencing)
- [x] Remove all six superseded synthetic files from the shared knowledge library (local copies retained)
- [x] Create 10 retrieval tests with expected citations
- [x] Execute all ten fixtures against actual retrieval in isolated draft-preview sessions; defects recorded, acceptance not passed

Exit condition: at least 8 of 10 knowledge questions return the correct source without unsupported claims.

### Gate 4 — Deterministic actions

Deliverables:

- [x] `MatchSportsProgramsAction` read-only demo Apex invocable
- [x] Deterministic listing-evidence ranking using self-selected preferences; synthetic verification explicitly distinguished from real verification
- [x] `PrepareSportsSupportAction` and `CreateSportsSupportCaseAction` with signed draft, actual-reply consent enforcement and idempotent creation
- [ ] `RecordAgentInteractionAction`
- [x] Ten matcher Apex tests; 100% matcher line coverage (remaining classes not built)
- [x] Matcher tests for class age bands, no matches, unknown/stale features, publication, parent visibility, object/record access and bounded batches
- [x] Eight support tests plus ten matcher tests pass; live synthetic Case and operator destination verified

Exit condition: actions pass tests and return stable, agent-friendly response contracts.

### Gate 5 — Sport Compass Agentforce agent

Deliverables:

- [x] Create Service Agent labeled `Sport Compass` (Version 1 Draft)
- [x] Connect library API `USA_Fencing_Approved_Knowledge`; current label `Sport Compass Fencing Sources` (10 public-source summaries replacing synthetic PDFs)
- [x] Configure global instructions and disclosure; initial live-preview welcome verified
- [x] Draft subagent: Find My Sport
- [x] Draft subagent: Fencing Program Guide
- [x] Draft subagent: Accommodation Support
- [x] Draft subagent: Registration Support
- [x] Attach Answer Questions with Knowledge to fencing, accommodation and registration subagents
- [x] Remove unrelated template routing/actions; registration, accommodation and scope routes trace-verified (remaining routes need tests)
- [x] Add read-only demo search/matching action; verify real action invocation, no-match and refusal paths
- [x] Add consent-enforced Case action; live match → draft → hesitation → explicit/native confirmation → Case → queue/report tested
- [ ] Repeat refusal/revision/error journeys and combine cited guidance into the uninterrupted primary demo
- [ ] Optional after core journey: persisted checklists and interaction actions
- [ ] Configure low-confidence and sensitive-topic escalation
- [x] Run ten live-actions draft-preview knowledge tests plus targeted safety retests; see current checkpoint for remaining review gates

Exit condition: the primary journey works completely inside Agentforce before any MCP integration.

September 6 draft configuration and two simulation results are recorded in [the configuration checkpoint](agentforce/CONFIGURATION_CHECKPOINT.md). Draft configuration is not a runtime acceptance pass. The disclosure test used the unwanted General FAQ route, and the classification-decision request received an unhelpful generic refusal via Inappropriate Content. Do not activate until routing, source retrieval and safe human-referral behavior are verified.

### Gate 6 — Data Cloud and measurable impact

Deliverables:

- [ ] Ingest program, participant-preference, and interaction records
- [ ] Use anonymous participant ID; no production identity resolution
- [ ] Map only fields needed for the MVP
- [ ] Segment: Adaptive Program Seeker
- [ ] Segment: Registration Assistance Needed
- [ ] Insight: Unresolved Accessibility Request
- [ ] Make relevant context available to Sport Compass
- [ ] Create a simple report or list showing outcomes and friction

Exit condition: the demo can show both an individual recommendation and an aggregate unmet-accessibility signal.

### Gate 7 — Agent API

Deliverables:

- [ ] Create an External Client App using minimum OAuth scopes
- [ ] Create or select a dedicated least-privilege integration user
- [ ] Grant access to Sport Compass and required actions only
- [ ] Validate token acquisition without committing secrets
- [ ] Start an Agentforce session
- [ ] Send and stream messages
- [ ] Preserve follow-up context
- [ ] End the session
- [ ] Verify error handling for 401, 403, 429, and 503 responses

Exit condition: the primary journey works using an API client without the Salesforce Agent Builder UI.

### Gate 8 — MCP server and ChatGPT app

Deliverables:

- [ ] TypeScript MCP server scaffold
- [ ] `ask_sports_for_all`
- [ ] `continue_sports_conversation`
- [ ] `request_human_support`
- [ ] `submit_sports_feedback`
- [ ] Input validation and payload limits
- [ ] ChatGPT conversation ID to Agentforce session ID mapping
- [ ] No arbitrary SOQL, Apex, object, or endpoint execution
- [ ] Unit tests with mocked Agent API
- [ ] Integration tests with live Agent API
- [ ] ChatGPT app instructions and tool descriptions

Exit condition: one live request travels ChatGPT → MCP → Agentforce → Salesforce data/actions → ChatGPT.

### Gate 9 — Translation

Deliverables:

- [ ] Confirm one tested non-English language
- [ ] Translate the grounded answer, not independently generated policy
- [ ] Preserve program names, dates, fees, warnings, and citations
- [ ] Capture source language, target language, provider version, and confidence
- [ ] Fall back to English on failure
- [ ] Human-review path for consequential low-confidence translation
- [ ] Native-language review of the primary journey

Exit condition: the translated demo retains the factual and safety meaning of the English source.

### Gate 10 — Accessibility, Responsible AI, and security

Deliverables:

- [ ] Plain-language and structured-output review
- [ ] Screen-reader/keyboard review of the ChatGPT component, if custom UI is used
- [ ] Prompt-injection tests
- [ ] Medical diagnosis and classification refusal tests
- [ ] Unsupported accommodation tests
- [ ] Data-minimization and consent tests
- [ ] Citation-faithfulness tests
- [ ] Least-privilege review
- [ ] Accessibility Expert Skill completed
- [ ] RAI Self Check Skill completed
- [ ] Findings, remediation, and accepted residual risks documented

Exit condition: no critical accessibility, security, or Responsible-AI defect remains in the demo path.

### Gate 11 — Demonstration and submission

Deliverables:

- [ ] Three-minute live-demo script
- [ ] Five-minute backup version
- [ ] Backup recording
- [ ] Architecture images updated to the approved USA Fencing-inspired palette
- [ ] Screenshots of Agentforce, Data Library, Case, and insight
- [ ] Quantified impact statement
- [ ] Scalability narrative
- [ ] Responsible-AI response
- [ ] Accessibility response
- [ ] Repository link and setup documentation
- [ ] Final submission review

Exit condition: the submission can be demonstrated from a clean start without relying on verbal explanations for missing functionality.

## Critical path

```text
Org readiness
  -> data model + seed data
  -> deterministic actions
  -> Sport Compass in Agentforce
  -> Agent API
  -> MCP server
  -> ChatGPT
  -> testing + submission
```

Data Cloud analytics, advanced translation, and custom result cards must not block this path.

## Fallback ladder

1. Full ChatGPT → MCP → Agentforce → Case journey.
2. ChatGPT → MCP → Agentforce with plain-text recommendations.
3. Direct Agent API client → Agentforce → Case.
4. Direct Agentforce Builder demo with the same live actions.

## Immediate next actions

1. Verify matcher invocation and demo/unknown/no-match behavior in live draft preview.
2. Design and implement consent-enforced human-support intake with minimal authority.
3. Confirm Agent API/client credentials and MCP hosting/session contracts.
4. Connect and test one end-to-end ChatGPT journey.
5. Complete domain, accessibility/RAI, translation and submission checks.
