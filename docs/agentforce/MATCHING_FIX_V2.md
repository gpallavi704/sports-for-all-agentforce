# Version 2 greeting and matching regression

September 6 Pacific / September 7 UTC, 2026.

## Changes

- Welcome now reads: “Hi, I'm Sport Compass, your AI guide to fencing and
  parafencing. I can help you explore the sport, understand registration steps
  and find resources. What would you like help with today?”
- Removed “hackathon prototype” from the conversational self-introduction and
  welcome/scope instructions. AI identity, non-endorsement, synthetic-program
  disclosures and official-decision boundaries remain.
- Added explicit program-search transitions from the scope and three knowledge
  subagents to `Find_My_Sport`.
- Added a system-wide rule that “fictional/demo/example” is not permission to
  invent listings: query the configured action, preserve exact returned names,
  or report that search is unavailable. Other subagents must hand off searches.
- Added targeted matching answer regression checks. They verify the expected
  adult name, disclosures, no known fabricated names, no private fixture and no
  youth fixture for the explicitly adult-age test. These are not a universal
  semantic grounding validator or a runtime output firewall.

## Diagnosis and limits

Version 1 could invoke the matcher correctly in a fresh published preview.
Repeating the original three-turn sequence on version 1 also passed once.
Therefore the initial failure was intermittent; a permanently broken Apex
action or missing permission was not established. The new transitions and
instructions address observed action-selection/output-grounding weaknesses;
they do not prove a unique internal model root cause or eliminate all hallucination.

The source bundle's missing local `<target>` is expected CLI behavior: the
publisher temporarily sets it for deployment and removes it locally afterward.
The org readback had `SportCompass.v1`. Do not use absence of a local target as
proof an agent is inactive, and do not claim this was the cause of the failure.

## Verification

- Agent Script validation succeeded; revision published as **SportCompass v2**.
- Activation of v2 succeeded. Runtime agent ID remains `0XxgL000002YnZpSAK`.
- Separate published-preview sequence: beginner guidance → equipment follow-up
  → adult matching. Trace showed `Find_My_Sport` and `Match_Demo_Programs`; answer
  used the stored adult program with equipment/mobility unknown. Session ended.
- Dedicated API identity: five-turn session completed guidance, equipment,
  original matching prompt, explicit age-25 matching and Atlantis/ZZ no-results
  request. Both matching regression checks passed. Adult results preserved the
  stored name and unknown mobility/equipment. No-results response invented no
  replacement programs. No-match content was manually reviewed, not independently
  proven from an action trace in that API run.
- API session DELETE succeeded; token revocation was acknowledged.
- Temporary app-enable deployment: `0AfgL00000WtT8bSAF`.
- Restore-disabled deployment: `0AfgL00000WtILGSA3`.
- **42 Node tests passed**, including three new matching regression unit tests.
- No support creation was requested in these tests. No new Apex permissions,
  credentials, data records, public endpoint or ChatGPT connection were added.

## Current state and next tests

Version 2 is active for controlled testing. The integration app is disabled again.
All changes remain local/uncommitted; publication here means Salesforce agent
publication, not Git publication. The authoring draft remains available.

Repeat the same prompts in Builder preview. Confirm the action trace contains
`Match_Demo_Programs`, the adult result is `DEMO - Adult Wheelchair Fencing Intro`,
and its equipment/mobility remain unknown. Do not accept a “demo” disclaimer as
permission to invent records. Additional languages, broader multi-turn cases,
no-match action trace, classification boundaries and the external support consent
path still need release testing.

Knowledge answers included URLs, but these published traces did not show a
`AnswerQuestionsWithKnowledge` FunctionStep. They are not proof of per-turn
retrieval. Inspect implicit retrieval/planner behavior separately before claiming
all guidance is source-grounded; blanket athletic-shoe guidance also needs
accessibility review. This matching fix does not resolve those separate checks.
