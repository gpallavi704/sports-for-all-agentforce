# Local MCP protocol checkpoint

This increment implements and tests the MCP protocol wrapper, not a live product
connection. Source files remain local and uncommitted at the user's request.

## Verified

- MCP SDK client/server initialization, tool discovery and start/ask/end calls.
- Exactly three advertised tools, with strict input and structured-output schemas.
- Unexpected caller IDs, consent flags, invalid handles and oversized messages
  rejected; no generic query/action/endpoint tool.
- Separate server-instance session isolation and rejection after session end.
- Mock responses explicitly labeled and submitted text not echoed.
- Actual stdio subprocess round trip, including process cleanup.
- Omitted `--mock` flag, attempted `--live`/port flags and oversized transport
  input fail closed. Server stdout contains protocol data only.
- Twenty-three tests passed, followed by a separate successful protocol smoke test.
- Dependency installation used pinned versions and disabled lifecycle scripts;
  npm audit reported zero known advisories at the time of this check.

## Unchanged boundaries

No Salesforce calls, agent activation, permission changes, public HTTP listener,
ChatGPT connection, tunnel, real participant data, Git commit or Git push. The
mock uses a single local process identity, not authenticated user identity.

## Reproduce

From the repository's `mcp-server` directory, run `npm ci --ignore-scripts`,
`npm test`, then `npm run smoke:mock`. No secrets or Salesforce login are needed.

## Next release gates

Select an approved connection and authentication method; configure scoped
Salesforce API credentials; obtain activation approval; validate the real Agent
API lifecycle and external-consent boundary; then connect and test in ChatGPT.
Do not expose the mock server's unauthenticated configuration as a live service.

The [OpenAI MCP guidance](https://developers.openai.com/plugins/build/mcp-server)
informed explicit schemas, accurate tool descriptions and structured results.
The implementation uses the official SDK rather than a custom protocol parser.
