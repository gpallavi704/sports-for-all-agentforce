# ChatGPT development tunnel checkpoint

September 7, 2026. This checkpoint supersedes older statements that no tunnel
registration exists. The user completed a ChatGPT mock start/message/end journey.
It does not establish a Salesforce-backed ChatGPT integration.

## Verified in the browser

- The user opened their personal ChatGPT account, which exposes the developer
  New Plugin form and its Tunnel connection option.
- Created one empty tunnel named **Sport Compass Development**, with description
  **Private development connection for testing Sport Compass fencing guidance in ChatGPT.**
- Associated it with the Personal Platform organization and the sole workspace
  offered by its selector. The selector displayed an ID, not a readable name.
- After creation, refreshed the intended personal ChatGPT account. Its New Plugin
  tunnel selector independently listed the same tunnel name and identifier.
  This is the observed evidence for the workspace association.
- No duplicate tunnel was created. Find the existing registration by name in
  Platform settings rather than recreating it. Identifiers stay out of this runbook.

## Local preparation verified

- The user created a dedicated runtime key after the form was restricted to
  Tunnels Read and Use. All other API permission categories were left at None.
- Verified the dedicated macOS Keychain entry exists. The key was subsequently
  loaded in memory for a local diagnostic, not printed or written to project
  files. The runtime receives an environment reference, not a secret argument.
- Downloaded the official Mac arm64 tunnel client v0.0.14 into an ignored local
  tools directory. Its SHA-256 matched the official release asset metadata.
- Prepared a local YAML profile targeting only the mock stdio server. The MCP
  child starts with an empty environment, so it does not inherit the tunnel key.
  The health/admin listener is restricted to loopback on an ephemeral port.
- `tunnel-client doctor --json --explain` returned `ok`: profile, key-reference
  resolution, command executable and local health binding checks passed. Stdio
  reachability and OAuth discovery were skipped by the diagnostic. This is not
  proof of runtime-key authorization, a healthy running tunnel, or MCP discovery
  from ChatGPT.
- Reran the 43 integration tests and the separate stdio start/ask/end smoke test;
  all passed with mock-only responses and no Salesforce connection.

## Runtime credential correction

The first user-started tunnel reported `401 invalid_api_key`. A private Keychain
check found that the saved value did not match the active dedicated key's visible
ending. The user corrected the entry through Keychain Access. A subsequent private
check matched the active ending and a single read-only `tunnel-client admin --json
tunnels get` request succeeded with the runtime key, returning the expected Sport
Compass Development tunnel and its organization/workspace associations. The key
was loaded in process memory and never displayed or saved in project files.

This establishes authentication and read access to the expected tunnel metadata.
No model call or Salesforce request was used in the diagnostic.

## Mock runtime health verified

After the user restarted the foreground client with the corrected credential,
the local `/healthz` endpoint returned `live` and `/readyz` returned `ready`.
Metrics showed at least three successful HTTP 204 control-plane polls. These
empty polls establish runtime connectivity, not successful MCP tool execution.
The user must keep that Terminal process and laptop running for this local test.

Prepared the ChatGPT New Plugin form, which the user subsequently created and connected:

- Name: Sport Compass Test.
- Description: Private mock connection test for Sport Compass. No Salesforce
  data or fencing recommendations yet.
- Connection: the existing Sport Compass Development tunnel.
- App-level authentication: No Auth, for the mock-only server. The tunnel still
  authenticates to OpenAI with the restricted runtime key. This is not an
  approved authentication design for a future Salesforce-backed server.
- The user handled the risk acknowledgment and connection approval. The app was
  subsequently observed in the ChatGPT Plugins picker.

## ChatGPT mock journey completed, user-reported

The user pasted successful results for all three steps in one ChatGPT test:

1. Start a test session: local mock mode and an opaque session handle returned.
2. Send "Hello from ChatGPT" in the same session: the local mock handler
   acknowledged the message, without claiming a fencing answer or Salesforce access.
3. End the test session: successful completion, with no Salesforce records accessed
   or modified reported.

These are user-reported ChatGPT results, not an independently inspected raw remote
tool trace. Separately, all 43 local tests and the actual stdio start/ask/end smoke
test passed again after this report. The smoke test reports Salesforce disconnected.
Session and connector identifiers are intentionally omitted from this runbook.

## Not connected or changed

The ChatGPT mock app is connected. No Salesforce app,
permissions, agent version, records, email sending,
billing or data-sharing preferences were changed. No Salesforce data passed
through the tunnel. Credentials, local configuration and downloaded binaries
are excluded from Git.

## Next steps

1. Preserve this completed mock checkpoint. No duplicate tunnel or app is needed.
   Collect raw remote tool traces if stronger submission evidence is required.
2. Keep the admin UI loopback-only and the key out of command arguments, Git and
   the mock MCP child's environment. The laptop and tunnel must remain running
   for this local development connection.
3. Keep the existing connection labeled as a mock until a live-backed path is
   implemented and tested. There is no supported live switch in the stdio executable.
4. Build on the separate passing two-turn Salesforce API lifecycle by validating
   the live MCP executable, external non-confirmation boundary and caller/session isolation. Tunnel
   transport and workspace visibility do not themselves implement application
   authorization. Preserve the existing non-confirming external message boundary.
5. Test the target mobile client separately. Browser Preview voice is not evidence
   of ChatGPT voice or mobile compatibility.

## Next-step preflight

A read-only Salesforce standard API query confirmed the expected SportCompass
runtime agent exists. The initial Tooling API query was unsupported; the standard
API query succeeded. This does not establish activation, ECA enablement or Agent API
session access. No integration app or permissions were changed during this preflight.
Subsequently, the user approved a controlled live API test. After a missing
Salesforce credential was restored privately, the two-turn guidance lifecycle
passed and app disablement was verified afterward. Source rendering and equipment
wording still need refinement. See the [live API checkpoint](LIVE_GUIDANCE_V17.md).
The ChatGPT executable and tunnel were not switched to Salesforce.

The [official OpenAI tunnel guidance](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
informed the workspace-association check and private development connection.
Secure MCP Tunnel supports private testing, not public plugin distribution.
