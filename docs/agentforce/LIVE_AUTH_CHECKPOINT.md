# Controlled live authentication checkpoint

September 6 Pacific / September 7 UTC, 2026. User approved temporary enablement of
**Sport Compass MCP**, a token/access check, then disabling the app again. No agent
activation, public endpoint, ChatGPT connection or Git publishing was authorized
or performed.

## Observed results

- Real credentials were read privately from the user-populated macOS Keychain item.
- The fixed org token endpoint returned HTTP 200 and a JWT accepted by the provider.
- Remaining JWT lifetime was 898 seconds, consistent with the configured 15 minutes.
- An authenticated identity-service request returned HTTP 200. Its user and org
  matched the expected dedicated API account and hackathon org. Neither identity
  response nor credentials/token were printed.
- Three read-only `SELECT Id FROM <object> LIMIT 1` requests, for Account, Contact
  and Case, each returned HTTP 400 / `INVALID_TYPE`. Combined with the successful
  authenticated identity check, this demonstrates these object reads were denied
  for this token, rather than merely receiving an invalid-token error.
- The token-revocation endpoint returned success. A subsequent use of the revoked
  token was **not** attempted; this is revocation acknowledgment, not independent
  proof of immediate invalidation.
- The app was disabled after the test and independently retrieved with
  `isEnabled=false`. Sport Compass remains an inactive draft.
- All **39 Node tests** passed: 15 integration-core, eight MCP protocol/process,
  13 credential-provider and three diagnostic tests.

No CRM records were created, changed or deleted. No write probes were attempted.
The three denied read probes returned no participant records. No secrets were
written to project files, printed in tool results or committed to Git by this test.

## Evidence

- Temporary enable deployment: `0AfgL00000WtGxnSAF`.
- Restore-disabled deployment: `0AfgL00000WsVveSAF`.
- Disabled-state readback: `09SgL00000duVHBUA2`.
- Diagnostic: `mcp-server/scripts/check-salesforce-auth.mjs`, with explicit
  `--approved-token-check` argument. Do not invoke without approval and the
  temporary enable/disable workflow.

The diagnostic uses fixed read queries, bounded bodies, sanitized allowlisted
error codes and a finally-block revocation request. The separate orchestration
restored app disablement in its own finally block. The standalone diagnostic does
not itself toggle the Salesforce app. Its output contains status/boolean results,
not tokens, secrets, identity payloads or record IDs.

## What remains unproven

Live Agent API access and scope sufficiency for agent sessions; runtime agent
identity/action enforcement; session start/send/end; natural expiry/rotation;
post-revocation denial; other object/endpoint access; authenticated MCP transport
and ChatGPT; external human-consent and session-isolation tests. Do not describe
this checkpoint as a production security certification or working ChatGPT demo.

Next gate: obtain approval to publish/activate the Sport Compass draft and
temporarily re-enable the integration app for a synthetic Agent API lifecycle
test. Preserve the external non-confirmation prefix and least-privilege identities.
