# Sport Compass MCP

Latest: the public Salesforce-backed connection now includes interactive club
cards and an optional first-visit planner. All 69 local tests pass. The private tunnel uses
the live public profile with four tools, including `show_visit_planner`. Its latest
restart failed on Keychain access, so it is currently stopped and the ChatGPT
manifest is still v3. Restore credential access and refresh the app after restart.
The card
reuses the latest guidance snapshot; checklist controls make no further AI calls.
The `first-visit-v4.html` resource starts with a compact club result and a
**Plan my visit** button. Source details and preparation controls expand on demand.
The source-linked plan can be copied without another model call. HTML download
is capability-gated and is not a verified ChatGPT feature; the tested ChatGPT
view fell back to manual copying. No files are silently uploaded.
The shared Apex lookup now accepts comma-free Utah wording. Three live public
search checks passed after deployment, separate from the local mock tests.
See [interactive UI evidence and limits](../docs/agentforce/INTERACTIVE_FIRST_VISIT.md)
and [search/export evidence](../docs/agentforce/SEARCH_AND_EXPORT.md).

Run `npm ci --ignore-scripts` and `npm run build:ui` before starting the public
entrypoint. The generated UI is not committed. `npm test` also builds it.

The public entrypoint is `src/stdio-public.mjs --approved-public-guidance`.
It pins SportCompassGuide version 1, whose only external actions are public club
lookup and knowledge retrieval. This private development connection is anonymous
with short-lived bearer conversation handles, not end-user OAuth. Do not submit
private data or reuse this adapter for an agent with business-write actions.
The Salesforce integration policy is enabled for the approved demo.

The original `src/stdio.mjs --mock` remains available and credential-free.
Do not run mock and live tunnel profiles simultaneously on the same tunnel.

## Previous checkpoints

The mock-only and disabled-policy descriptions below record earlier checkpoints
and do not override the current live connection status above.

Implemented: a bounded Agent API client, caller-bound in-memory session broker,
three tool contracts and a working SDK-based local MCP stdio server. A separate
Salesforce outbound token provider and macOS Keychain helper are now implemented;
see [private credential setup](../docs/agentforce/LOCAL_CREDENTIAL_SETUP.md).
**The connected ChatGPT app is mock-only. This is not an MCP HTTP server,
inbound OAuth implementation or live-backed ChatGPT connection.** A controlled Salesforce token/identity/read-denial
check passed; see [evidence](../docs/agentforce/LIVE_AUTH_CHECKPOINT.md). The app was
restored to disabled. No credentials are stored here. The executable is
mock-only; the separate outbound API client remains disabled by default.

Latest controlled version 17 retry: after private credential restoration, session
start, two guidance replies, session end and token-revocation acknowledgment
succeeded. App disablement was independently verified afterward; Case aggregates
were unchanged. This does not prove answer quality or a Salesforce-backed ChatGPT
connection. The runner supports `--guidance-only` after its existing
approval flag and runtime agent ID to limit a controlled test to two questions.
Do not use it outside an approved enable/test/disable window. See the
[version 17 API checkpoint](../docs/agentforce/LIVE_GUIDANCE_V17.md).

Run tests with Node 22 or later:

```sh
cd mcp-server
npm ci --ignore-scripts
npm test
npm run smoke:mock
```

`smoke:mock` launches a child process, performs MCP initialization, discovers the
three tools, runs start → ask → end and closes the process. It requires no account
credentials, Salesforce org connection or running ChatGPT session.

For a local stdio-compatible MCP test client, use the Node executable with the
absolute path to `src/stdio.mjs` and the argument `--mock`. `npm run start:mock`
also starts the server interactively; it waits for MCP JSON messages on stdin and
is not a conversational terminal. Normal logs go to stderr, never protocol stdout.
No network port is opened, and unsupported flags such as `--live` fail closed.
These local commands do not create a global MCP configuration, ChatGPT connection
or tunnel. Separately, an empty development tunnel is now registered and visible
in the intended personal ChatGPT account. Its dedicated key is stored in Keychain,
the official Mac client is downloaded, and a mock-only profile passed the local
configuration diagnostic. After correcting the saved key, the user started a
foreground mock tunnel: its local health and readiness checks passed, with at
least three successful HTTP 204 polls. The user created and connected Sport Compass
Test, then reported successful start, message and end results in ChatGPT. These
remote results are user-reported, not independently reviewed raw tool traces.
The 43 local tests and stdio smoke test also passed again. Salesforce remains
disconnected from the MCP executable. See the
[tunnel checkpoint](../docs/agentforce/CHATGPT_TUNNEL_CHECKPOINT.md).

The local server returns a fixed protocol acknowledgment, not fabricated fencing
facts or simulated Salesforce query results. Every successful response contains
`mock: true`, `mode: local-mock` and a limitation notice. It does not echo submitted
text. Strict input/output schemas, a 64 KiB stdio buffer limit and session limits
are tested. EOF/signals close the server and its mock sessions.

Dependencies are pinned (`@modelcontextprotocol/sdk` 1.30.0, `zod` 4.5.4), with
resolved transitive versions in package-lock.json. Installation lifecycle scripts
were disabled. npm audit reported zero known advisories at this checkpoint;
that is not a full supply-chain or security certification.

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

## Historical release gates before the public-only connection

Some gates below were completed or narrowed for the private public-guidance
demo. Current operations and remaining limits are in the two checkpoints linked
at the top. These historical steps are not instructions to disable the running
approved demo or replace it with the mock profile.

1. Obtain explicit approval to commit/activate Sport Compass; verify its runtime
   `0Xx…` agent ID. The existing `1bY…`/`1bZ…` authoring IDs are not usable here.
2. The disabled Salesforce External Client App and scoped run-as identity are
   configured. The outbound credential provider is mock-tested and Keychain helper
   compiled. Privately store credentials, then verify live scopes/entitlements,
   token acquisition, expiry and revocation after app-enablement approval.
3. Choose an approved connection method and OAuth provider; Jon's infrastructure
   is optional. Implement the protected transport and any necessary
   protected-resource metadata, issuer/audience/signature/expiry/scope checking,
   authorization-code/PKCE support and the actual registered ChatGPT redirect.
   The local mock's `noauth` metadata applies only to its isolated test process;
   it is not an authorization design for a remote or Salesforce-backed server.
4. Wire verified principals into dispatch. Do not expose dispatch directly to
   JSON callers. Add request-level limits, body/time limits and safe error mapping.
5. Replace in-memory state for multiple processes; implement cleanup retries,
   shutdown cleanup and transcript/telemetry
   retention. Current expiry cleanup runs on new starts or explicit `expire()`;
   it is not a background job. Failed upstream cleanup is currently best-effort.
6. Live-test start/send/end, caller separation, limits, prompt injection, citations
   and the external-consent boundary. Mock tests prove code contracts only.
7. Validate a Salesforce-backed ChatGPT connection; complete keyboard/screen-reader and required hackathon skill
   reviews. No translation, live callback or real provider data is implemented.

## Sources checked September 6–7, 2026

- [Salesforce Agent API examples](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-examples.html)
- [Salesforce Agent API reference](https://developer.salesforce.com/docs/ai/agentforce/references/agent-api?meta=type%3AExternalSessionKey)
- [Salesforce API setup](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-get-started.html)
- [OpenAI MCP server guidance](https://developers.openai.com/plugins/build/mcp-server)
- [OpenAI authentication guidance](https://developers.openai.com/plugins/build/auth)

The OpenAI Docs review shaped the separate OAuth boundary and tool contracts;
it also guided explicit tool schemas and structured results in the local server.
It does not establish that this org or ChatGPT account is integration-ready.
