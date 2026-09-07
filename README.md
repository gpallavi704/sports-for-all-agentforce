# Sports for All — Sport Compass

An Agentforce hackathon prototype helping athletes, parents, coaches and volunteers navigate fencing guidance, synthetic inclusive-program examples and next steps. Accessibility and reviewed multilingual support are product goals, not completed certifications.

- **Agent name:** Sport Compass
- **Salesforce/API identifier:** `SportCompass`
- **Tagline:** Find your sport. Navigate your next step.

The Builder Track MVP uses fencing and wheelchair fencing as its richest reference journey while demonstrating a reusable architecture for additional sports and governing bodies.

## Target MVP Architecture

```text
ChatGPT App
    -> MCP Server
        -> Agentforce Agent API
            -> Sport Compass Agent
                -> Agentforce Data Library
                -> Data Cloud
                -> Flow / Apex actions
                -> Service Cloud Case escalation
```

## Scope and capabilities

- Inclusive sport and program discovery
- Grounded USA Fencing guidance with citations
- Personalized next-step checklists
- Accessibility and accommodation support
- Planned reviewed multilingual interaction
- Responsible-AI boundaries and human escalation
- Synthetic unresolved-support reporting; broader interaction measurement is planned

## Repository Layout

- `force-app/` - Salesforce DX metadata
- `mcp-server/` - ChatGPT/MCP to Agentforce integration
- `data/` - Synthetic MVP seed data
- `tests/` - Agent, integration, accessibility, and Responsible-AI tests
- `docs/` - Architecture, scope, demo, and submission materials

## Current Status

The inactive Salesforce draft includes ten sourced knowledge summaries, deterministic demo-program matching and a consent-controlled synthetic Case → support queue handoff. Twenty Apex tests and three repeated support journeys pass. Seven synthetic Cases are retained as demo/test evidence.

The [local integration core](mcp-server/README.md) includes an Agent API client, session broker and proposed MCP contracts with 15 mocked tests. It is **not deployed or connected to ChatGPT**; authentication, hosting and activation remain release gates. External model-produced text is not accepted as human consent.

See [current status and open items](docs/STATUS.md), [build plan](docs/BUILD_PLAN.md) and [support hardening](docs/agentforce/SUPPORT_HARDENING.md). Historical diagrams describe the intended architecture, not proof that every component is live.

## Data Policy

Prototype records are synthetic unless explicitly identified as approved public sources. Do not commit credentials, tokens, personal medical details, Salesforce auth files, or production exports.
