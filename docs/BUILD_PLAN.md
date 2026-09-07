# Sport Compass build plan

Build one demonstrable fencing journey before adding breadth. [Current status](STATUS.md) records implementation and evidence. These are the remaining delivery gates.

## Fixed scope

Sports for All / Sport Compass, API name `SportCompass`. Fencing and wheelchair fencing are the reference journey. The current demo surface is Agentforce Preview; ChatGPT through authenticated MCP is planned. Keep public club identities separate from fictional program/support data. Do not add sports, voice, websites or native mobile work to the critical path.

## 1. Accept the Salesforce journey

Version 12 is active. Selected Apex tests passed 30/30 and local integration tests passed 43/43. Support passed on v8; current presentation evidence is recorded in STATUS.md.

- [ ] Run one uninterrupted current-version browser journey through matching, consent and support queue verification.
- [ ] Verify exact citations, unknown accessibility, real/demo boundaries and no invented records.
- [ ] Verify hesitation/cancellation creates nothing, revision invalidates the draft and retries leave one Case.
- [ ] Exercise expiry, concurrency and failed-action/no-false-success paths.
- [ ] Capture sanitized evidence without signed tokens or raw traces.

Exit: reproducible complete path with limitations disclosed. Do not claim a second native confirmation prompt unless observed.

## 2. Revalidate the current Agent API

- [ ] Review runtime identity and action access without broadening general object permissions.
- [ ] Temporarily enable the integration app for approved current-version lifecycle and follow-up tests.
- [ ] Test citations, no matches, denial paths, errors and external non-confirmation.
- [ ] End sessions, request token revocation and restore app disablement.

Exit: current-version API behavior is verified without real participant data or callbacks.

## 3. Connect protected MCP and ChatGPT

The local stdio executable is mock-only. Its contracts do not provide remote authentication.

- [ ] Approve a connection method or hosting.
- [ ] Implement authenticated HTTP transport, validated audience/scopes and server-owned caller identity.
- [ ] Add transport limits, cleanup, retention and safe error handling.
- [ ] Verify live caller/session isolation, prompt injection, rate limits and upstream failures.
- [ ] Connect ChatGPT and test guidance/discovery.
- [ ] Keep external Case creation unavailable until trusted human confirmation is implemented and tested.

Exit: one request demonstrably travels ChatGPT to MCP to Agentforce and back. Guidance-only is the external fallback; model-generated yes cannot authorize writes.

## 4. Domain, language, accessibility and Responsible AI

- [ ] Review sources, current-season rules, club facts and official support routes with domain experts.
- [ ] Agree an additional language/translation contract if included; preserve dates, warnings and citations and obtain native-language review.
- [ ] Perform keyboard/screen-reader and plain-language checks on the actual client.
- [ ] Repeat classification/diagnosis boundaries, stale-source, privacy, unsupported accommodation and injection tests.
- [ ] Complete organizer-provided Accessibility Expert and RAI Self Check skills.
- [ ] Record fixes and residual risks without claiming certification.

## 5. Submission

- [ ] Confirm deadline, video length and required assets.
- [ ] Record the demo with captions and a tested fallback.
- [ ] Label implemented versus planned architecture.
- [ ] Include source provenance, setup guidance, test evidence and limitations.
- [ ] Present social impact as a proposed measurable outcome unless real user evidence exists.

## Fallback and optional work

Use the native Salesforce demo if protected MCP cannot be completed. Data Cloud insights, saved preferences, advanced caching and broader telemetry must not delay acceptance. Do not blindly deploy the entire repository; scope validation/deployment to the intended org and distinguish Git publishing from Salesforce activation.
