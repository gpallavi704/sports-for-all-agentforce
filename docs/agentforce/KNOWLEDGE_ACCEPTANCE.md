# Knowledge acceptance and source-link investigation

September 6 Pacific / September 7 UTC, 2026. Inactive draft only.

Newest update: [classification refinement and full-suite results](CLASSIFICATION_REFINEMENT.md) supersede the historical routing/link failures below for the tested scenarios. Current-season content approval and broader acceptance remain open.

Later update: the user approved the four Trusted URL hosts. They are deployed with image-only CSP; three targeted tests now return readable links from all four hosts. See [Trusted URL verification](TRUSTED_URLS.md). The failures below remain historical evidence; full acceptance and classification issues are not closed.

## Results are not an acceptance pass

The first complete ten-case run retrieved the expected uploaded source in every answer (10/10), but every answer contained URL_Redacted (0/10 usable-link passes). A consequential semantic failure also occurred: KB06 applied a historical minimum-age statement to the fictional child and declared them ineligible before disclaiming decision authority. That is a failure, not mitigated by the later disclaimer.

Other review findings: KB01 initially implied loaner equipment was assured; KB04 omitted an explicit qualified-supervision/no-bouts boundary; KB09 needs stronger historical-source handling and citation-faithfulness review. See [sanitized baseline evidence](knowledge-live-baseline-2026-09-07.json). Literal phrase hints are advisory, not semantic pass/fail rules. Domain-team approval remains pending.

## Targeted safety retest

After the ten-case baseline, strengthened global instructions prohibit deriving a personal eligibility decision from age, including fictional scenarios; distinguish club participation; and prioritize classification routing. Beginner instructions now require explicit qualified-coach supervision, no bouts without appropriate equipment, and conditional loaner-gear wording.

Three isolated retests (KB01, KB04, KB06) retrieved the expected sources. The gear/supervision wording improved, and the classification answer now begins by deferring the decision to official classifiers/staff and separates introductory participation. However, it still chose Registration_Support rather than Accommodation_Support and repeated an age threshold with only a generic season caveat. That routing and historical-source handling remain open. This is one successful observation of the improved decision boundary, not a guarantee. All three still had redacted links. The entire suite must be rerun after remaining fixes. See [targeted evidence](knowledge-live-targeted-retest-2026-09-07.json).

The retested revision compiled and passed draft deployment validation (`0AfgL00000Wsnm5SAB`), was saved as draft (`0AfgL00000WsnqvSAB`), and was independently retrieved (`09SgL00000dtUYTUA2`). Readback matched the tested local source exactly. No version was committed or activated. All 13 suite/retest sessions and the separate link smoke-test session were ended.

## Link diagnosis and scoped attempt

Salesforce documents URL_Redacted as the result of an unapproved destination. [Trust and Agentforce](https://help.salesforce.com/s/articleView?id=ai.copilot_trust.htm&language=en_US&type=5) also explains why native source citations can appear even when response-body URLs are blocked.

[Salesforce's configuration guidance](https://help.salesforce.com/s/articleView?id=sf.persnl_agentforce_enable_personalization_agent.htm&language=en_US&type=5) describes exact URLs in agent instructions as an alternative to Trusted URLs. We added the 17 exact public URLs already present in the curated files, with no wildcards, query strings or user-data parameters. Instructions require relevant retrieved evidence; the URL inventory is not evidence for an answer.

This instruction-only approach did not resolve redaction in either a local live-actions preview or the suite after saving the draft. The specific reason this runtime did not honor the documented instruction mechanism is not yet established. Do not call it a Salesforce-wide bug or a verified fix.

- Fresh pre-change draft snapshot: retrieve `09SgL00000dtTJ3UAM`.
- First instruction change compiled successfully; dry run `0AfgL00000WsnKfSAJ`; draft deployment `0AfgL00000WsmtGSAR`.
- Saved draft readback: `09SgL00000dtICMUA2`.
- Trusted URL metadata snapshot: `09SgL00000dtTZBUA2`; read-only query found four existing entries, none for fencing/AskFRED.
- No org-wide Trusted URLs, CSP directives, object permissions, Data Cloud policies or existing Voice/Slack entries were changed.
- Effective access regression passed: five private CRM/messaging objects denied and six demo-record access expectations preserved.

Native file citations remain temporary signed URLs. Raw traces are Git-ignored. Only sanitized answers and citation labels are included in committed evidence; no signed URL is published.

## Original proposal - subsequently approved and deployed

Salesforce's [allowlist notice](https://help.salesforce.com/s/articleView?id=005135034&language=en_US&type=1) states that Trusted URL additions apply across the org, not just this agent. The user subsequently approved these four explicit HTTPS hosts (no wildcards):

- www.usafencing.org
- member.usafencing.org
- usafencing.zendesk.com
- www.askfred.net

Review the narrowest supported CSP context/directives before deployment; do not enable browser scripts, frames, media, microphone, camera, CORS or callouts just to make a response link work. Domain permission is not path-level authorization. Keep the exact source-link policy and no-user-data rule in the agent. Test approved links plus an unapproved synthetic destination, and verify the existing org settings remain unchanged. If the scoped setup cannot work, use Salesforce Support or a separately reviewed client-side source mapping; never turn off URL protection.

## Reproducible tests

```sh
node scripts/verify-agent-draft.mjs
node scripts/test-knowledge-live.mjs sport-compass
node scripts/test-knowledge-live.mjs sport-compass KB01,KB04,KB06
node scripts/verify-agent-access.mjs sport-compass
```

The live runner consumes Agentforce usage. It verifies the org and read-only action targets, creates a fresh preview session per test, marks every scenario explicitly fictional, sanitizes output, ends its sessions and stores generated reports under ignored temp/knowledge-live. A nonzero exit is expected while source citation or URL checks fail. Human review of unsupported claims and safety is still required; these tests are not a full security audit, accessibility evaluation, or activated Agent API/MCP test.
