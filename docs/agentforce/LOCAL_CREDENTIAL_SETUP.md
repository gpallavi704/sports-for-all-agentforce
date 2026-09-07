# Local credential provider - prepared, not connected

Update: the user completed private setup and the [controlled live authentication
check](LIVE_AUTH_CHECKPOINT.md) passed. The app is disabled again. The instructions
below remain a setup reference; do not repeat setup or overwrite the existing item.

The Salesforce outbound credential provider is implemented with mock tests. It
is separate from the future ChatGPT/MCP authentication layer. The MCP executable
still accepts only `--mock`; these modules are not a live connection switch.

## Implemented

- Native Swift helper using Apple's Keychain Services. A local setup dialog has
  two masked fields and names the expected Salesforce app/org. Secrets are not
  accepted in process arguments, environment variables or chat.
- Fixed Keychain service `com.sportcompass.agentapi.00DgL00000c7pj3UAA`, account
  `client-credentials`. Existing entries are not overwritten or deleted.
- Reader captures helper output in a bounded private subprocess pipe, sanitizing
  subprocess errors (which could otherwise include captured secret output).
- Token acquisition is disabled by default; it accepts no caller-selected org,
  uses the fixed org HTTPS token endpoint and rejects redirects. Credentials are
  sent only in the HTTPS POST body. No developer CLI/admin token is reused.
- Whole-operation timeout covers Keychain acquisition and HTTP response reading;
  response size is bounded. No automatic retry. Concurrent callers share one
  acquisition. Tokens are cached only in memory, with a 60-second expiry margin
  and a maximum 15-minute lifetime. JWT `exp` parsing is a cache hint, not a
  signature-verification mechanism or inbound authentication check.
- Rejects malformed/expired tokens and unexpected instance URLs. No token,
  upstream body, credentials or raw subprocess error is logged by the provider.

## Checks performed

Swift compilation and the helper's `self-check` succeeded. That mode performs no
Keychain access. Node tests use fake credentials and fake HTTP/subprocess responses,
including a composed Agent API start/send/end test and external non-confirmation
prefix check. No real secret was retrieved, stored or used; no live token request
was sent. The native dialog and actual Keychain storage/access still need a private
user-assisted test; compilation is not evidence of that flow working end to end.

## Private setup - user action, when ready

1. In a private terminal, change to this repository's `mcp-server` directory.
2. Run `npm run keychain:build` (already compiled on this machine). Then run
   `npm run keychain:setup` to open the local dialog. Do not run the helper's
   `read` command yourself: it is reserved for the provider's private pipe.
3. Privately open Salesforce Setup → External Client Apps Manager → **Sport
   Compass MCP** → Settings → OAuth Settings → Consumer Key and Secret. Complete
   any identity-verification prompt. Do not use another app's credentials.
4. Enter those two values into the local dialog, not chat, the editor or a command.
   Avoid screen sharing/captures while viewing them. If you use the clipboard,
   clear it afterward and consider any clipboard-manager or cross-device history.
5. Approve a macOS Keychain prompt only if it corresponds to this helper and this
   action. Cancel unexpected prompts. Report only the success/error message - not
   the credential values.

The dialog is not launched automatically. `ITEM_EXISTS_NO_OVERWRITE` means an item
already exists; stop and review rotation/replacement rather than deleting it.
No credentials are bundled in the compiled helper. Its binary/cache are under
Git-ignored `mcp-server/dist/`; the credential values live in Keychain only after
you explicitly store them.

This uses the standard macOS file-based Keychain and its access controls; it does
not opt into sync or grant access to all applications. Rebuilding or relocating
the helper may change its code identity and trigger authorization prompts. This
is local-development storage, not a production secrets manager, and does not
protect against a compromised logged-in session, modified project code or process
memory inspection. JavaScript/Swift strings cannot guarantee memory zeroization.

## After private setup

The app stays disabled and Sport Compass inactive. Obtain approval before enabling
the app for a token-only test. Verify the run-as identity and denied CRM access,
then seek separate agent activation approval. A live diagnostic runner that prints
only approved non-secret results remains to be implemented; do not test with a
terminal command that prints token responses. Remote hosting requires a separate
approved secrets manager and authenticated MCP transport.

References: [Apple Keychain retrieval](https://developer.apple.com/documentation/security/secitemcopymatching(_:_:))
and [Salesforce client-credentials integration guidance](https://developer.salesforce.com/blogs/2024/02/invoke-rest-apis-with-the-salesforce-integration-user-and-oauth-client-credentials).
