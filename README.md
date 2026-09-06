# Sports for All — Sport Compass

An accessible, multilingual Agentforce solution that helps athletes, parents, coaches, and volunteers discover inclusive sports programs, understand accommodations, and receive personalized next steps.

- **Agent name:** Sport Compass
- **Salesforce/API identifier:** `SportCompass`
- **Tagline:** Find your sport. Navigate your next step.

The Builder Track MVP uses fencing and wheelchair fencing as its richest reference journey while demonstrating a reusable architecture for additional sports and governing bodies.

## MVP Architecture

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

## Core Capabilities

- Inclusive sport and program discovery
- Grounded USA Fencing guidance with citations
- Personalized next-step checklists
- Accessibility and accommodation support
- Multilingual interaction
- Responsible-AI boundaries and human escalation
- Interaction and unmet-demand measurement

## Repository Layout

- `force-app/` - Salesforce DX metadata
- `mcp-server/` - ChatGPT/MCP to Agentforce integration
- `data/` - Synthetic MVP seed data
- `tests/` - Agent, integration, accessibility, and Responsible-AI tests
- `docs/` - Architecture, scope, demo, and submission materials

## Current Status

Architecture and MVP scope are established. Salesforce metadata, seed data, Agentforce configuration, and MCP integration will be added incrementally.

## Data Policy

Prototype records are synthetic unless explicitly identified as approved public sources. Do not commit credentials, tokens, personal medical details, Salesforce auth files, or production exports.
