# Version 6 browser journey checkpoint

Tested September 6 Pacific / September 7 UTC, 2026, in Agentforce Builder Live Test. The UI identified Sport Compass Version 6 (Active). This was a single uninterrupted browser conversation, not a CLI-only preview or a ChatGPT session.

## Result: incomplete, not accepted

| Step | Observed result |
| --- | --- |
| Beginner guidance | Answer displayed three source references and equipment/supervision caveats. Some links included encoded citation suffixes in their destinations. Source dates and the project-prepared-summary limitation were not displayed. The opening equipment sentence was too categorical despite a later caveat. |
| Explicit fictional discovery | Match Demo Programs executed and returned the configured Adult Wheelchair Fencing Intro for Salt Lake City, UT, age 25. Mobility and equipment stayed unknown. |
| Request a full support draft | Routed to Support Request and executed Review Reply. The visible trace showed no Prepare Support action. The response supplied model-written draft text rather than the service's complete consent disclosure. |
| Decline | Sent `no`. The agent stated no request was created. |
| Independent record check | Eight synthetic Cases before and eight after, with the exact same IDs and Case numbers 00001003 through 00001010. No new Case was created by this test. Case 00001010 already existed at baseline; its creation is not attributed to this test. |
| Confirm, create and queue | Not attempted because the displayed draft failed the preparation and disclosure gate. Historical queue tests are not proof that this v6 browser journey passed. |

## Reproduction prompts

1. How can a beginner start wheelchair fencing, and what should they ask a club about equipment before the first visit?
2. For a fictional demo only, find programs in Salt Lake City, UT, age 25, beginner, with mobility and equipment preferences.
3. For DEMO - Adult Wheelchair Fencing Intro, prepare a demo support request with reason Accessibility information needs verification. Show me the full draft before creating anything.
4. no

## Required follow-up

- Ensure a full support draft is presented only after successful preparation. Bind the selected configured program, preserve the signed-token boundary, and never substitute model-written draft text.
- Retest explicit consent, native confirmation, actual Case creation, fixed queue ownership and idempotent retry in one browser journey.
- Correct citation rendering so a source marker is not part of a URL path. Retest source dates, limitations and cautious equipment language.
- The local prompt now asks for no em dash punctuation. This change is not yet published, so the current v6 agent may still generate it.

No Salesforce settings, permissions, activation state or records were changed by this test. No outbound communication, real participant data, Git commit or push was involved. Local documentation and writing-style changes are separate from the tested v6 snapshot.
