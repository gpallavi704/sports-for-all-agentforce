# Salesforce API authentication setup checkpoint

Historical configuration checkpoint. The subsequent [live authentication check](LIVE_AUTH_CHECKPOINT.md)
passed token acquisition, dedicated identity and three CRM read-denial checks;
the app was restored to disabled. Pending statements below describe this earlier phase.

September 6 Pacific / September 7 UTC, 2026. Configuration is deployed; live
authentication is **not yet tested**. The integration app is deliberately disabled,
and Sport Compass remains an inactive authoring draft. Nothing in this increment
was committed or pushed to Git.

## Created and verified

- Local External Client App `SportCompass_MCP`, label **Sport Compass MCP**.
- API identity `005gL00000NfH7hQAF`, username
  `sportcompass.api.00dgl00000c7pj3uaa@example.invalid`.
- Profile **Minimum Access - API Only Integrations**, Salesforce Integration
  license. Verified license usage: **1 of 5**, leaving four available.
- API enabled and API-only; no role, View All Data or Modify All Data.
- Only non-profile permission-set assignment: `SportCompass_API_App_Access`.
  This is an empty app-preauthorization marker, not a data-access permission set.
- ObjectPermissions readback across all assigned permission sets returned zero
  explicit read/create/edit/delete grants. This is a configuration check, not a
  substitute for token-authenticated negative access tests.
- User creation suppressed all DML email triggers; no password reset was invoked.
  Existing builder and agent runtime identities were not modified.

## OAuth configuration

| Setting | Saved configuration |
| --- | --- |
| App enabled | **false**; OAuth plugin exists but parent app is disabled |
| Client credentials run-as | Dedicated API identity above, not the builder |
| Preauthorization | AdminApprovedPreAuthorized; only the app-access marker; no profile allowlist |
| OAuth scopes | `Api, Chatbot, SFApiPlatform` |
| JWT access-token lifetime | Custom, 15 minutes |
| Session timeout | 15 minutes |
| Refresh-token policy | Zero; refresh/offline scope not requested |
| IP policy | Enforce; no new IP bypass or ranges added |
| Guest/code-credentials/device/token-exchange flows | Not enabled |

Global OAuth settings deployed with client credentials and named-user JWT enabled,
PKCE and secret-required controls retained, and rotation flags false. The global
settings were intentionally **not retrieved**, because that metadata can contain
consumer credentials. No client secret or token was exported, printed or used.
The scopes and admin policies above were independently retrieved and checked.

This org rejected the SDK enum spelling `SFAP`; its validator accepted
`SFApiPlatform`. It also required a callback URL. The configured
`https://localhost/sport-compass/oauth-unused` is an unused loopback placeholder,
not a running endpoint or ChatGPT callback. The server-to-server client-credentials
flow does not use a redirect. No listener was started.

The scope set omits refresh/offline access because the planned flow obtains new
short-lived access tokens. These scopes passed metadata validation; they are not
yet proven sufficient for the live Agent API. Do not grant Full, broad object
permissions or an admin identity to bypass a future authentication error.

## Identity boundary

The API identity authenticates the integration. The existing Agent API adapter
requests the agent-assigned runtime identity via `bypassUser: true`; this flag does
not mean bypassing Salesforce security. End-user authorization and session
isolation still need to be implemented and verified at the MCP boundary.

The integration account has no generic Case access. This does **not** by itself
make the downstream agent read-only: its runtime has scoped custom actions,
including the synthetic consent-controlled support broker. The external adapter's
non-confirming message prefix remains mandatory and requires live regression tests
before exposing the integration. No external Case-creation tool is available.

## Evidence

- Registration and marker deploy: `0AfgL00000WszleSAB`.
- Registration readback: `09SgL00000dtvs1UAA`.
- OAuth configuration / app-disabled deploy: `0AfgL00000Wt4wcSAB`.
- Restricted OAuth policy deploy: `0AfgL00000WtFNNSA3`.
- Final policy readback: `09SgL00000dtwWLUAY`.
- Anonymous Apex setup script completed successfully; new user and license usage
  were independently queried afterward.
- Metadata-only deployments ran no Apex tests. No Apex product classes changed.

## Remaining gates

1. The credential provider is now mock-tested and the macOS Keychain helper
   compiled. Complete [private credential setup](LOCAL_CREDENTIAL_SETUP.md) and
   verify real Keychain access. Do not paste secrets into chat or place them in
   command arguments, screenshots or logs.
2. Enable this app for a controlled token test after the storage/provider is ready;
   verify run-as identity, token expiry and denied CRM access without exposing
   tokens. No token requests have been made in this checkpoint.
3. Obtain separate approval to commit/activate the **Agentforce draft**. This is
   different from a Git commit, which also remains on hold.
4. Resolve the activated runtime agent ID and test start/send/end, errors,
   external non-confirmation, session isolation and cleanup with synthetic data.
5. Only then connect an authenticated MCP transport to the chosen ChatGPT account.
   No tunnel, hosting or ChatGPT connection currently exists.

## Reproduction and secret hygiene

Non-secret app settings and policies were retrieved under `force-app/main/default`
at this checkpoint. Repository cleanup moved these org-bound exports into a local
recovery backup and excludes future copies from Git. See [repository setup](../REPOSITORY_GUIDE.md).
`scripts/setup-api-user.apex` is org-bound and repeatable for this specific identity;
review it before using it, and never run it in another org. It does not grant
Salesforce object permissions or create a password.

`*.ecaGlblOauth-meta.xml` is now Git-ignored. The current ignored local bootstrap
file contains settings only, without consumer keys/secrets. A clean clone will
need that global settings component recreated securely before the OAuth settings
can be deployed; do not blindly deploy all source to a new org. Regenerate the
org-specific app association fields and run-as username for any other org.
Never retrieve all External Client App metadata into the repository, and never
force-add the ignored global OAuth file after retrieval. Ignoring a file does
not itself encrypt or protect its local contents.

Reference: [Salesforce Agent API prerequisites](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-get-started.html)
and [external-client-app OAuth policies](https://help.salesforce.com/s/articleView?id=xcloud.meta_external_client_app_oauth_policies_configuration.htm&language=en_US&type=5).
