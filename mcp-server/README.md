# Sport Compass integration core — local, not deployed

Implemented: a bounded Agent API client, caller-bound in-memory session broker,
three tool contracts and dependency-free mocked tests. **This is not yet an MCP
HTTP server, OAuth implementation, connected ChatGPT app or live API proof.** No
credentials are stored here and outbound calls are disabled by default.

Run tests with Node 22 or later:

```sh
cd mcp-server
npm test
```

## Design

Planned flow: ChatGPT → OAuth-protected MCP transport → dispatcher → session
broker → Agent API → Sport Compass. The future middleware supplies a verified
issuer/subject principal out-of-band. A caller name passed to the library is not
authentication. Tool arguments cannot select users, agents, orgs, raw Salesforce
sessions, arbitrary actions, SOQL, or agent variables.

The broker generates opaque handles, binds each to the principal, serializes
messages, limits sessions/messages and blocks reuse after ambiguous upstream
failure. Upstream errors are sanitized; messages are not automatically retried.
Only Inform text is projected; internal variables/action payloads and unapproved
URLs are omitted. Text is still untrusted content, not a general PII/secret filter.

The outbound client uses a fixed Salesforce API host and validated My Domain.
It starts with `bypassUser: true`, meaning the agent-assigned runtime identity,
not a permissions bypass. Tokens must come from a scoped server-side credential
provider; never reuse the developer's Salesforce CLI/admin token.

## Critical consent boundary

MCP message text is model-supplied, not proof that the person approved a draft.
Every forwarded message is therefore prefixed as unverified external input.
With the current exact-match Apex consent check and fixed system-input binding,
this cannot be a bare allowlisted yes. No confirmation/Reply tool is exposed.
The external path is **non-confirming guidance**. Native Agentforce draft preview
remains the demonstrated consent → Case → queue experience.

The prefix is not a universal security sandbox. Revalidate the actual deployed
agent's action inventory, exact-match consent service and system-input behavior
before enabling outbound access. Changing any of these invalidates the safety
assumption. Future writes require a trusted human confirmation UI, draft digest,
caller/session binding and replay-safe server verification; tool annotations or
an LLM boolean cannot substitute for that.

## Release gates — still open

1. Obtain explicit approval to commit/activate Sport Compass; verify its runtime
   `0Xx…` agent ID. The existing `1bY…`/`1bZ…` authoring IDs are not usable here.
2. Configure a scoped Salesforce External Client App and run-as identity. Verify
   minimum scopes/entitlements, credential storage, expiry/refresh and revocation.
3. Choose hosting and OAuth provider with Jon. Implement Streamable HTTP MCP,
   protected-resource metadata, issuer/audience/signature/expiry/scope checking,
   authorization-code/PKCE support and the actual registered ChatGPT redirect.
4. Wire verified principals into dispatch. Do not expose dispatch directly to
   JSON callers. Add request-level limits, body/time limits and safe error mapping.
5. Replace in-memory state for multiple processes; implement cleanup retries,
   bounded credential acquisition, shutdown cleanup and transcript/telemetry
   retention. Current expiry cleanup runs on new starts or explicit `expire()`;
   it is not a background job. Failed upstream cleanup is currently best-effort.
6. Live-test start/send/end, caller separation, limits, prompt injection, citations
   and the external-consent boundary. Mock tests prove code contracts only.
7. Connect ChatGPT; complete keyboard/screen-reader and required hackathon skill
   reviews. No translation, live callback or real provider data is implemented.

## Sources checked September 6–7, 2026

- [Salesforce Agent API examples](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-examples.html)
- [Salesforce Agent API reference](https://developer.salesforce.com/docs/ai/agentforce/references/agent-api?meta=type%3AExternalSessionKey)
- [Salesforce API setup](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-get-started.html)
- [OpenAI MCP server guidance](https://developers.openai.com/plugins/build/mcp-server)
- [OpenAI authentication guidance](https://developers.openai.com/plugins/build/auth)

The OpenAI Docs review shaped the separate OAuth boundary and tool contracts;
it does not establish that this org or ChatGPT account is integration-ready.
