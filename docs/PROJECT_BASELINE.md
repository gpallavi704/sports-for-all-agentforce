# Sports for All — Current Project Baseline

**Status:** Working baseline received from Jon  
**Track:** Agentforce for Good — Builder Track  
**Delivery constraint:** 24-hour technical MVP  
**Ownership:** Workstreams are intentionally unassigned. Do not assume Ajay or Pallavi owns any item.

## Product objective

Build an accessible **Sports for All Guide** that helps athletes, parents, coaches, and volunteers:

- Discover a suitable inclusive or adaptive sports program.
- Understand accommodations, eligibility, costs, equipment, and participation requirements.
- Receive personalized recommendations and a next-step checklist.
- Escalate uncertain, sensitive, or unresolved requests to a human.
- Explore multiple sports while using fencing and wheelchair fencing as the richest reference journey.

## Proposed experience and architecture

- **Agentforce:** Sports for All Guide agent with topics, actions, instructions, guardrails, tests, and escalation.
- **Data Cloud:** Curated program data, lightweight anonymous participant profiles, segments/insights, and interaction outcomes.
- **ChatGPT app:** Preferred conversational client, connected through an MCP server to the Agentforce Agent API.
- **Fallback:** If ChatGPT/MCP integration becomes risky, demonstrate the working Agentforce journey directly and use a static recommendation card or plain-text response.

## Agent topics

1. **Find My Sport** — Collect only necessary information such as age range, location, interests, experience, accessibility needs, and goals; recommend suitable programs.
2. **Fencing Program Guide** — Explain fencing disciplines, beginner programs, wheelchair fencing, equipment, membership, and competition pathways.
3. **Accommodation Support** — Explain documented accessibility features and collect requests without unnecessary medical information.
4. **Registration Support** — Explain eligibility, fees, scholarships, waivers, and next steps; generate a personalized checklist.

## Agent actions

- Search programs and retrieve program details.
- Match a participant to suitable programs.
- Save interests and accessibility preferences.
- Create a lead, contact, or support case.
- Record unresolved questions, escalation reasons, and friction points.

## Responsible-AI boundaries

- Do not diagnose medical conditions or determine medical eligibility.
- Do not promise that an accommodation is available.
- Minimize collection and retention of sensitive information.
- Clearly distinguish verified program facts from recommendations.
- Escalate low-confidence, sensitive, or unresolved requests.
- Use synthetic or approved data for the prototype.

## MVP data model

- **Participant Profile:** anonymous ID, age range, ZIP/postal code, language, interests, and experience level.
- **Accessibility Preference:** mobility, visual, hearing, cognitive, communication, and requested accommodation.
- **Sport:** name, description, format, adaptive options, and recommended experience level.
- **Program:** location, dates, age range, cost, capacity, and accessibility features.
- **Organization:** name, contact details, region, and supported sports.
- **Agent Interaction:** question category, recommendation, outcome, escalation, and abandonment/friction point.

## Data Cloud MVP

- Import curated seed data from CSV or Salesforce records.
- Map selected fields into appropriate Data Model Objects.
- Use an anonymous or app-generated participant ID for lightweight identity resolution.
- Create useful segments or calculated insights, potentially including:
  - Beginner Athlete
  - Adaptive-Program Seeker
  - Scholarship Interest
  - Registration Assistance Needed
  - Unresolved Accessibility Request
- Expose relevant program and participant context to Agentforce.
- Capture outcomes for the demo analytics story.

## Integration contract

### Request

```json
{
  "participantId": "anonymous-uuid",
  "language": "en",
  "message": "I use a wheelchair and want to try a competitive sport.",
  "location": {
    "postalCode": "84101"
  },
  "conversationId": "optional-existing-session-id"
}
```

### Response

```json
{
  "conversationId": "agent-session-id",
  "message": "Wheelchair fencing may be a strong fit.",
  "recommendations": [
    {
      "programId": "WF-001",
      "sport": "Wheelchair Fencing",
      "programName": "Intro to Adaptive Fencing",
      "location": "Salt Lake City, Utah",
      "accessibilityFeatures": [
        "Wheelchair accessible",
        "Adaptive equipment available"
      ],
      "nextStep": "Request program information"
    }
  ],
  "escalationAvailable": true
}
```

## Primary demo journey

A parent asks the Sports for All ChatGPT app which competitive sport could suit a 12-year-old athlete with limited mobility near Salt Lake City. ChatGPT invokes an MCP tool. Agentforce evaluates trusted Data Cloud program information and recommends wheelchair fencing with documented accessibility, equipment, cost, and location information. The parent requests help, Agentforce creates a Salesforce case, and the interaction is recorded to reveal unmet accommodation demand.

## MVP acceptance criteria

- One end-to-end journey works from ChatGPT through MCP to Agentforce and back, or through the documented fallback.
- Agentforce uses program data provided through Data Cloud.
- The experience uses accessible, plain-language interaction in at least two languages.
- Human escalation works or is credibly demonstrated.
- Outcomes are visible in Salesforce.
- A backup recording exists before submission.

## Explicitly out of scope

- Production-grade OAuth and account linking.
- Multiple external integrations.
- Sophisticated identity resolution.
- Registration or payment processing.
- More than four agent topics.
- A custom analytics dashboard.
- More than two fully tested languages.
- Multiple polished sport-specific journeys.
- More than one custom ChatGPT component.

## Delivery sequence

1. Finalize one primary demo journey.
2. Confirm fields, sample data, environments, and request/response contracts.
3. Establish source control and select one integration owner.
4. Build Agentforce topics, actions, guardrails, and test conversations.
5. Import and map program data in Data Cloud.
6. Build MCP tools initially against mocked Agentforce responses.
7. Connect Agentforce to Data Cloud.
8. Replace mocks with the live Agentforce Agent API.
9. Validate authentication and session handling.
10. Test at least five end-to-end scenarios.
11. Address critical accessibility findings.
12. Add and test one additional language.
13. Complete escalation and error handling.
14. Capture interaction/friction outcomes.
15. Freeze features at hour 20.
16. Record the backup demo and capture screenshots.
17. Rehearse a three-minute presentation.
18. Complete architecture, impact, scalability, and responsible-AI submission sections.
19. Reserve at least two hours for deployment and submission issues.

## Governing delivery principle

> The strongest submission is one complete, credible, accessible journey—not a broad platform with several unfinished flows.

## Decisions still requiring confirmation

- Whether **Sports for All** is the final submission name and scope, or the extensibility vision around a fencing-first implementation.
- Whether the primary client is ChatGPT/MCP, native iOS with the Agentforce Mobile SDK, or one primary channel with the other shown as a roadmap/fallback.
- Which additional language will be fully tested; Korean, Simplified Chinese, or Traditional Chinese.
- Translation provider, API contract, quality controls, and audit behavior.
- Exact source and approval status of non-fencing program data.
- Human-escalation destination and ownership.
- Agent API and Data Cloud capabilities actually enabled in the provisioned Salesforce org.

