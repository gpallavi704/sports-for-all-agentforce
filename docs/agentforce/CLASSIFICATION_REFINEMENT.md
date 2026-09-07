# Classification routing and knowledge regression checkpoint

September 6 Pacific / September 7 UTC, 2026. Inactive Agentforce draft; no business-data or permission changes.

## What changed

- Kept the five subagent API names, HyperClassifier, knowledge actions, library bindings and trusted hosts unchanged.
- Changed the Accommodation Support display label to Classification and Accessibility Support and made its description explicitly cover personal classification/eligibility questions, including mixed age/registration requests.
- Narrowed Registration Support's description to administrative navigation and explicitly excluded personal classification/eligibility decisions.
- Added a process-only classification response boundary: defer individual decisions to official classifiers/event staff, identify the 2025-26 source as historical, ask for current confirmation, distinguish club participation, and omit historical numerical age thresholds and lead times from current-person guidance.
- Added explicit no-ID-documents-in-chat wording, historical registration-source caveats, and separately labeled regional/national navigation.
- Strengthened the test runner: check the original public source URL and required navigation links, and assert the expected classification subagent for KB06. Literal phrase matches remain hints, not semantic approval.

Salesforce's [routing documentation](https://help.salesforce.com/s/articleView?id=ai.agent_topics_routing.htm&language=en_US&type=5) explains that names/descriptions influence selection. Overlapping descriptions were a plausible contributor to our prior misrouting. The improvement below is observed in live preview; it does not prove descriptions were the only cause or make model-based routing deterministic.

## Tests and interpretation

The initial focused probe routed KB06 to Accommodation_Support, but still repeated a historical age threshold. We strengthened the subagent-specific instruction before running the full suite; we did not count that probe as a full safety pass.

The full ten-question suite then passed automated checks for expected uploaded source citation, original public source URL and required navigation URLs, with zero URL_Redacted responses. KB06 routed to Accommodation_Support, explicitly deferred the decision, identified the 2025-26 season, separated introductory club participation from competition, and did not repeat an age cutoff or old deadline. See [ten-case evidence](classification-knowledge-suite-2026-09-07.json).

Manual review found three registration wording/navigation gaps despite automated success. We revised only Registration_Support instructions and retested KB07, KB08 and KB09. These targeted tests passed automated checks and showed the intended privacy warning, separated links, and historical-source/current-event caveat. See [final registration evidence](registration-final-retest-2026-09-07.json).

The entire ten-case suite was not rerun after that registration-only edit. Seven unaffected cases were tested on the immediately preceding draft; all three affected cases were retested on the final draft. Both reports record their source hashes. One observation per fixture is not a statistical reliability claim.

All 14 sessions (one initial probe, ten full-suite cases, three final retests) ended. Raw traces remain Git-ignored; committed evidence contains no signed citation URLs. Read-only object/record access and Trusted URL regressions passed during this work. Local structural checks and Salesforce compilation passed.

Fresh pre-change draft snapshot: `09SgL00000dtYc5UAE`. Final draft deployment validation: `0AfgL00000Wsr6XSAR`; successful draft deployment: `0AfgL00000WsrJRSAZ`; independent readback: `09SgL00000dtZmfUAE`. Saved source matched the locally tested final script exactly, and its SHA-256 matched the targeted-retest report. No activation/Agentforce version commit occurred.

## Still open

- Domain-team approval and current-season review of curated content. We have not asserted that historic policy is current.
- Broader adversarial, paraphrase, multi-turn, translation and accessibility/RAI evaluations. Prompt instructions are not a security enforcement mechanism.
- KB02 is verbose and presents some linked navigation pages alongside source citations. Review provenance presentation; a related link is not proof that a page was independently reviewed.
- Native uploaded-file citations remain temporary; original public-source links now render.
- Program matching, consent-enforced Case intake and Agent API/MCP integration remain unimplemented.

Next implementation increment: a read-only program-search/matching action using published synthetic program records, explicit user preferences, transparent match reasons and unknown-accessibility handling. Do not activate this draft or add write permissions as part of that step.
