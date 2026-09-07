# Approved public source URLs

Verified September 6 Pacific / September 7 UTC, 2026. User approved adding the four hosts after being told the change applies across the org. Sport Compass remains inactive; no authoring version was committed or activated.

| Metadata entry | Exact HTTPS host |
| --- | --- |
| SportCompass_USAFencing | www.usafencing.org |
| SportCompass_Membership | member.usafencing.org |
| SportCompass_HelpCenter | usafencing.zendesk.com |
| SportCompass_AskFRED | www.askfred.net |

No wildcard or misspelled aaskfred host was added. Existing Slack, Voice and Salesforce media entries were not edited. CORS, remote sites, connected apps, CRM permissions and Data Cloud policies were not changed.

## Effective flags — important correction

The initial four-entry deployment explicitly submitted all resource/browser flags as false. Direct Tooling API readback showed that Salesforce stored img-src=true on all four entries. All other resource flags and camera/microphone remain false. The local metadata was corrected to describe the actual image-only configuration, and the descriptions were aligned without expanding the effective permissions.

Salesforce's [Metadata API reference](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/api_meta.pdf) requires at least one applicable/browser grant and documents image-default behavior. We observed normalization in this org; we do not claim all-false flags were retained. Context is All. These settings permit image resources from the exact hosts throughout the applicable org contexts, not just response text from this agent. No image retrieval was performed by our tests.

## Verification

- Initial deployment validation: `0AfgL00000WsoF7SAJ`; deployment: `0AfgL00000WsoGjSAJ`.
- Effective-setting/description alignment deployment: `0AfgL00000WspCnSAJ`; succeeded. The read-only regression verified all eight entries, and the four pre-existing entries matched their earlier XML snapshot for all recorded fields.
- Metadata download `09SgL00000dsW9LUAU` timed out. Verification used a successful read-only Tooling API query instead; do not count the timed-out download as a readback success.
- KB02, KB07 and KB08 passed the automated source-label and no-redaction checks. Their answers included readable URLs from all four approved hosts. This fixes the observed link issue in these three tests, not every future answer.
- A separate fictional request to substitute an unapproved .invalid FenceSafe destination was refused. This tests agent behavior; it does not prove that every malicious URL would be caught by the platform filter.
- All four preview sessions ended. Raw signed file citations and traces remain Git-ignored; original-source links in answer text are now usable, while native file citations remain temporary.
- Effective private-object and six demo-record access regressions passed.
- Full acceptance, classification routing, historical-source handling, accessibility review and Agent API/MCP tests remain open.

See [sanitized test results and exact flags](trusted-url-verification-2026-09-07.json). Recheck with `node scripts/verify-trusted-urls.mjs sport-compass`.

## Recovery

If approval is withdrawn or a host becomes inappropriate, deactivate only the corresponding SportCompass_* entry (isActive=false) and deploy that exact component after authorization. This can cause agent links to be redacted again. Do not remove unrelated pre-existing entries. No business records were deleted.
