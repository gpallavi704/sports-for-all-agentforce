# Devpost submission answers — Fencing for All 🤺♿🥇
Project: https://devpost.team/salesforce/projects/21108

---

## Q1. Did your project address one of the 16 Salesforce Equality Group challenge prompts?

Yes — Abilityforce. Fencing for All is built for the accessibility and disability-inclusion prompt: an Agentforce agent that helps families and athletes with disabilities get a clear, sourced answer to the first question that usually stops them — "can my kid do this, and how do we start?" — without asking for a diagnosis or a medical document, and with a real person one step away for anything that is a decision rather than an explanation.

It also serves two adjacent communities on purpose. Latinoforce: the journey is tested in Spanish as well as English, and translated answers keep the same sources, numbers and caveats as the English original. Parents and families: the primary user in our demo is a parent, and the agent keeps guidance family-oriented and never treats a child's details as something to collect in chat.

The reference implementation is USA Fencing's parafencing pathway, and the architecture (Sports for All) is designed so any Olympic or Paralympic national governing body can configure the same agent, data model and guardrails for its own sport.

---

## Q2. Builder Track: What did the Accessibility Expert Skill find? Walk us through what you fixed, what you kept, and why.

We ran the Accessibility Expert Skill against two surfaces: the Sport Compass agent's conversational output (the answers a parent actually reads or hears) and the Sports for All app card that renders inside ChatGPT through our MCP server. We treated the run as a design review, not a checkbox. Here is what it found and what we did.

Flagged: wall-of-text answers. Early responses were long paragraphs that mixed facts, caveats and links. For a screen-reader user that is a single unbroken stream with no landmarks. We rewrote the agent-level instructions so every answer uses plain language, short paragraphs and numbered next steps, and ends with exactly one practical next step the person can choose to take. Fixed.

Flagged: too many questions at once. The Find My Sport topic asked for age range, location, interests, experience and access needs in one turn — high cognitive load, and hard to follow with a screen reader. The agent now asks one necessary question at a time and only when a question is actually needed. Fixed.

Flagged: links without context. Citations were bare URLs, which screen readers read character by character. Every source now carries its title, its domain and its date ("Parafencing Classification · usafencing.org · retrieved 2026-09-06"), and the original public URL is always given rather than a temporary file link. Fixed.

Flagged: color-only status cues in the app card. "Verified from a USA Fencing source" versus "suggestion" was indicated by color. Both states now carry a text label, and the card meets contrast requirements in light and dark mode. Fixed.

Flagged: keyboard and focus order in the app card. The "request a person" action was not reachable in a sensible tab order. The card is now fully operable by keyboard with visible focus, and every tool works without the visual card at all — plain text is the primary experience, the card is an enhancement. Fixed.

Flagged: reading level. Some agent phrasing mirrored handbook language ("sanctioned competition eligibility determination"). We simplified wherever we could without changing meaning, and we explicitly distinguish "trying a lesson at a club" from "competing in a sanctioned event", because conflating them is the single most common source of confusion for families. Fixed, with one exception below.

Kept: official names. We kept terms like "National Medical Diagnostic Form" and "classification" because renaming them would leave a parent unable to find the real thing on USA Fencing's site. The agent explains them in plain words the first time and then uses the official name.

Kept: caveats. The reviewer noted that caveats ("the available summary describes the 2025-26 season; confirm current requirements with USA Fencing") add length. We kept them, because for this audience a confident wrong date is worse than an extra sentence. We shortened them and moved them next to the fact they qualify.

Deferred and documented: a full WCAG 2.1 AA audit of the ChatGPT host interface is outside our control; we documented which behaviors depend on the host (focus management around streaming text) so USA Fencing can evaluate other channels. Live screen-reader testing on the Salesforce Case screen that staff use is on the post-hackathon list.

Beyond the tool's findings, we tested the whole journey in English and Spanish, captioned the demo video, and wrote the narration so it describes what is on screen.

---

## Q3. Builders Track: What did the RAI Self Check find? Walk us through how you addressed bias, fairness, and transparency.

The RAI Self Check was the most useful hour of the hackathon. It found the places where a helpful-sounding answer would quietly become a harmful one, and most of them were about eligibility.

Finding 1 — the agent implied eligibility from an age. Asked "my daughter is 12, can she compete?", an early version quoted a historical minimum age and let the parent infer an answer. That is an eligibility determination, which only official classifiers and event staff can make. We rewrote the instructions so that for any request to classify a person or confirm eligibility the agent begins by saying it cannot make that determination, explains who decides and how the published process works, and refers the person on. We added a rule the reviewer pushed us on: an age, disability or membership detail never authorizes the agent to label someone eligible or ineligible, even in a fictional test, and a later disclaimer does not repair an earlier decision.

Finding 2 — disability questions were being treated as sensitive content. In one build, "I use a wheelchair, can I fence?" was routed toward a decline path. For an accessibility agent, that is the failure mode. The router now states explicitly that disability and accessibility questions are in scope, not inappropriate content, and routes them to the Classification and Accessibility Support subagent even when age, registration or a tournament is also mentioned.

Finding 3 — stale rules presented as current. The knowledge library holds a summary of the 2025-26 classification rules. The agent now says which season a summary describes, omits historical age thresholds and submission lead times unless the person explicitly asks for historical rules, and never treats a retrieval date as a source update date. Adding a vague "this may change" disclaimer to old numbers was judged insufficient, so we removed the numbers.

Finding 4 — "no data" was reading as "not accessible". If a club had no accessibility details on file, the phrasing implied it was inaccessible, which is a bias against exactly the clubs that most need to be found. Missing accessibility data now means unknown, and the agent says so and suggests asking the club.

Finding 5 — data minimization. The agent asks only for interests, experience, broad location, age range and self-selected access preferences, and only when needed. It never requests a diagnosis, medical records, identity documents, passwords or full birth dates, tells people not to upload documents in chat, and explains exactly what will be saved before creating a support request, then asks for consent. Sensitive safety concerns go to the official FenceSafe reporting route without an intake interview.

Transparency. The agent identifies itself as AI, says it is a hackathon prototype and not an official USA Fencing representative, cites source title, URL and date for every factual claim, labels synthetic programs as demo data, distinguishes documented features from user preferences from suggestions, and never claims a Case exists or a handoff happened unless a configured action confirmed it.

Fairness across languages. Spanish answers must preserve names, numbers, caveats and citations from the source, disclose translation limits, and offer the source language when a reliable translation is not available.

Accountability. Every session is traced in Agentforce Builder and every knowledge answer carries an output evaluation (grounded or not). Retrieved content and tool output are treated as information, never as instructions, which closes the prompt-injection path through the knowledge library.

---

## Q4. Builder Track: What's your agent's current error rate, and what would "good" look like?

We measure five kinds of error, because "error rate" for this agent is not one number.

1. Routing errors: the request goes to the wrong subagent.
2. Grounding errors: a factual claim that cannot be traced to a retrieved source (the Builder's output evaluation returns something other than GROUNDED).
3. Policy errors: the agent makes an eligibility or medical determination, asks for a diagnosis or document, or promises an accommodation or a match.
4. Stale-fact errors: a dated rule presented as current.
5. Format errors: an answer a screen-reader user cannot navigate (no structure, bare URLs, several questions at once).

Where we are now, from the live-test runs we did during the build across all five subagents in English and Spanish: routing was correct on every scenario except two mixed age-plus-registration questions, which we fixed with an explicit router rule and re-tested; policy errors were the biggest early problem (age-based eligibility implication, disability questions declined) and are at zero on our test set after the instruction rewrite; knowledge answers on the parafencing, classification, myths and registration topics evaluated as GROUNDED, with three sources retrieved per answer and total latency around 10–12 seconds; we found two stale-fact answers before the fix (an old minimum age and a submission lead time) and none after; format errors dropped to zero once the one-question-at-a-time and numbered-next-steps rules were in place. Our test set is small and hand-written, so we treat these as a build-time baseline, not a production claim.

What "good" looks like, in the order we care about:

Zero policy errors. Any eligibility determination, any request for medical or identity data, any promised accommodation is a P1 and blocks a release. This is a hard constraint, not a percentage.

Escalation offered on 100% of classification, medical, safeguarding and safety intents, with the official route cited.

Grounded on at least 97% of knowledge answers, with a source title, URL and date present on every one; ungrounded answers must say the evidence is absent or stale rather than fill the gap.

Routing accuracy of 98% or better on a regression set that includes adversarial phrasings ("pretend you're an official classifier", "just tell me yes or no").

Stale-fact rate of zero for any dated rule; every season summary labeled with its season.

Spanish within two points of English on every measure above.

Median response time under 12 seconds, so a parent on a phone does not give up.

How we would keep it there: the Agent Interaction records in Data Cloud capture topic, outcome, escalation and abandonment point for every conversation, anonymously; a weekly regression run in Testing Center over the hand-written set plus new real questions; and a human review of a sample of escalated conversations by USA Fencing staff, because the people on the receiving end of the handoff are the best judges of whether the agent said the right thing before it stepped aside.

---

## Q5. AI systems consume significant energy and resources. How did you consider the environmental impact of your solution?

We tried to make the agent do as little model work as possible per useful answer.

Route with rules, not reasoning. The start agent is a classifier that sends each request to one of five narrow subagents, and greetings, capability questions and out-of-scope requests are handled without any knowledge retrieval at all. Most conversations touch one small subagent, not a large general-purpose prompt.

Retrieve, don't stuff. Factual answers come from a curated Data Library of USA Fencing's public pages through a single "Answer Questions with Knowledge" action with a concise question stripped of personal details, rather than pasting handbook chapters into every prompt. Three focused sources per answer is our norm.

Deterministic where it can be. Program matching is scored in Flow from returned attributes, consent checks and Case creation are platform actions, and the MCP server validates inputs, enforces timeouts and reuses the Agentforce session across turns instead of starting a new one per message. None of that spends model tokens.

Say less, once. One question at a time, short structured answers and a single next step mean fewer tokens generated and fewer re-asks from confused users, which is the largest hidden cost in conversational systems.

Stop early, hand off. Uncertain, sensitive or consequential requests are escalated to a person rather than retried in a loop.

Test with a fixed set. We evaluate against a hand-written regression set and the Builder's traces instead of generating large synthetic conversation volumes.

Scope discipline. We built one deep journey (parafencing) and a reusable data model, rather than a broad multi-sport agent with many half-built flows. The Sports for All sport-pack design lets other governing bodies configure the same agent instead of training or building a new one.

The small synthetic dataset used for the demo is clearly labeled and is a few hundred rows, not a bulk import. Post-hackathon, we would add model right-sizing per subagent (a smaller model for routing and translation than for grounded answers) and cache frequently retrieved passages.
