# Repository scope and safe setup

## Editable source

Maintain `force-app/main/default/aiAuthoringBundles/SportCompass/SportCompass.agent` and its bundle metadata. Apex, tests, objects, permissions, public club metadata and reporting are source-controlled alongside it.

Generated Bot and GenAiPlannerBundle snapshots are excluded from Git to avoid duplicate instructions and obsolete versions. Retrieved versions 1 through 9 were moved to a local recovery backup during cleanup. No active org versions were deleted.

Org-bound External Client App exports are also excluded. They contain deployment-specific associations, contact details and run-as identities, not portable templates. Recreate the app securely using a dedicated identity and default-disabled access. Never retrieve consumer credentials into source control. Historical [API configuration](agentforce/API_AUTH_CHECKPOINT.md) and [authentication evidence](agentforce/LIVE_AUTH_CHECKPOINT.md) are not a one-command installation.

## Setup boundaries

1. Install Node 22+ and Salesforce CLI, then authorize the intended org privately.
2. Review user bindings, permission sets and Data Library references before deploying selected metadata. Do not blindly deploy the entire folder.
3. Validate/deploy scoped data model, Apex and permission components, then seed only labeled synthetic records.
4. Create/index the ten curated summaries and bind to that org's library. Approved in the inherited library API name does not establish USA Fencing approval.
5. Validate editable Agent Script and publish/activate only in the intended org. Org publication is separate from Git publication.
6. Run mock MCP checks first. Live token/session tests require explicit approval and controlled app enable/disable.

See [current status](STATUS.md), [knowledge inventory](../knowledge/README.md), [entitlements](agentforce/ENTITLEMENTS.md) and [MCP instructions](../mcp-server/README.md).

## Local-only material

Authorization directories, secrets, Keychain data, global OAuth metadata, raw preview traces, temporary reports, generated binaries, dependencies and private exports stay outside Git. Ignoring files neither encrypts them nor removes earlier revisions.

Sanitized historical evidence is retained to document failures and fixes, not as current status. Normal cleanup commits do not rewrite Git history; that requires separate team coordination.
