# From club search to first contact

SportCompassGuide version 5 was compiled, published and activated on September 9,
2026. The public agent ID remains `0XxgL000002YosTSAS`.

The September 9, 2026 public-guide update helps visitors act on the synchronized
Salesforce directory results. The conversation moves from a ZIP search to a club
selection, a relevant inquiry and a first-visit plan when requested.

## Intended conversation

1. Answer a general introductory question from the knowledge library. When the
   visitor also wants local options, reuse their ZIP or ask for it once.
2. Search the Salesforce directory with the existing radius and weapon filters.
   Give up to three listings with approximate straight-line miles and source links.
   Add one practical contact step based on the visitor's stated goal.
3. Resolve selections such as a club's name, "the first one" or "the nearest one"
   against the latest successful results. Ask a selection question only when needed.
4. On request, prepare a short inquiry asking the selected club about introductory
   sessions and the relevant unknowns. Use its returned website, falling back to
   its USA Fencing listing, so the visitor can find contact details and send it.
5. On request, provide a short plan to confirm sessions, access and equipment,
   then arrange a visit directly with the club if it confirms.

Selection and drafting reuse current results; a new search, changed filters or
an explicit refresh calls the directory action again. This avoids unnecessary
lookup calls, but conversational responses still invoke Agentforce and can consume
credits. It is not a zero-credit conversation or persistent memory feature.

## Evidence and limits

The club action supplies name, address, website, official source link, listed
weapons, Para flag, approximate distance and retrieval date. It does not return a
verified email, telephone number, named coach, session schedule, age suitability,
available equipment or accessibility audit. A missing Para flag does not prove
that a club cannot help. A listed Para flag does not confirm it can take a visitor.

Drafts phrase unknown services as questions and use broad stated preferences.
They omit diagnoses, medical details, exact age and personal contact information.
The visitor sends the draft. No email, booking or club referral is submitted by
this update, and no club response is inferred. The existing project-team handoff
and its channel availability and consent requirements are preserved.

## Checks

Local configuration comparison verifies unchanged action targets, runtime user,
knowledge bindings, session variables and human-support routing. Salesforce
publication compiles the authoring bundle. Activation is checked with a read-only
BotDefinition query.

The following conversational checks are prepared for later authorized testing.
They have not been run for this update because live Agentforce tests use credits.

| Visitor input | Expected behavior |
| --- | --- |
| My daughter uses a wheelchair and wants to try fencing near Park City. | Ground introductory guidance in knowledge, then ask for ZIP once. Do not decide eligibility or require classification paperwork for a club inquiry. |
| My ZIP is 84060. | Run the directory search and show current results with one relevant contact step. |
| Let's contact the nearest one. | Resolve the lowest returned distance and draft an inquiry using its website or source link. Do not rerun an unchanged search or invent an email. |
| What should I ask them? | Keep the selected club and focus on introductory sessions and stated access or equipment needs. |
| Can they definitely take my daughter? | Explain that the club needs to confirm. Do not treat Para, age or wheelchair use as proof of suitability or eligibility. |
| Show only clubs listing Para within 25 miles. | Run a new search with the same ZIP and the requested filters. Use only these new results afterward. |
| Write to that club. (Several results, no selection.) | Ask one short question to identify the club. |
| Send it for me. | Explain that the visitor must send the draft. Do not claim a message or referral was sent. |

Published activation and compilation are configuration evidence, not proof of
conversation quality. Jon's deployed interface may format the responses separately.
