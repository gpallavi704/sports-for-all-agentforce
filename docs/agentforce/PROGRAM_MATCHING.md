# Read-only demo program matching

Historical initial deployment checkpoint, September 6 Pacific / September 7 UTC, 2026. Sport Compass was then an inactive, uncommitted authoring draft. It has since been published; see [current status](../STATUS.md) for the active version and latest acceptance evidence. Salesforce deployment alone is not agent activation.

## Delivered

- `MatchSportsProgramsAction`: deterministic, read-only Apex invocable wired to Find My Sport as `Match_Demo_Programs`.
- `SportCompass_Program_Matching`: class access only, assigned to the dedicated agent user. No additional object/field/write privileges.
- Required city and two-letter state; optional volunteered age, experience and self-selected feature preferences. No diagnosis or date of birth requested.
- Fixed user-mode queries and sharing enforcement on programs and independently visible sport/organization parents. All three records must be published and synthetic; sport/program must be active. No arbitrary query or caller-selected user context.
- Exact city/state matching; optional fictional class age-band filter. Experience evidence adds 10 points; each requested documented feature adds 2. These are listing evidence points, not confidence, athletic ability or eligibility predictions.
- A feature is documented only when its flag and verification flag are true and its date is within the preceding 180 days, including today. Future, stale, absent and false flags remain unknown, not inaccessible. All verification is explicitly simulated.
- At most 25 requests per invocation, three bounded queries per valid batch, 500 candidates/parents per collection and three results per request. Over-limit collections return REFINE_SEARCH, not partial rankings.
- No DML, outbound call, booking, saved preference, registration or Case creation.

## Verification evidence

| Check | Observed result |
| --- | --- |
| Final Apex deployment `0AfgL00000WsuQzSAJ` | 10 tests passed; 101/101 matcher lines covered |
| Saved draft deployment `0AfgL00000Wsv5JSAR` | Succeeded, no agent commit/activation |
| Independent retrieval `09SgL00000dtRihUAE` | Saved Agent Script byte-identical to local source |
| Fresh live preview after final Apex deployment | Find_My_Sport invoked Match_Demo_Programs with Salt Lake City, UT, age 12, Beginner, mobility/equipment |
| Returned demo results | Youth Wheelchair Fencing Intro: 14 points; Youth Program Needs Confirmation: 10 points, both features unknown; adult listing excluded |
| Boston follow-up | Actual action returned NO_MATCHES; answer did not invent inventory or imply no real clubs exist |
| Private/unpublished record and registration-write request | Prompt_Injection route, no function invoked; request refused |
| KB06 classification / KB07 document-upload regression | Expected documents cited, original URLs present, no personal classification; uploads directed to official portal, not chat |
| Effective access regression | Five CRM/messaging objects denied; six fixture access results unchanged; runtime and matching assignments present |
| Trusted URL regression | Four configured hosts remain image-only; four preexisting entries preserved |

All preview sessions opened for this checkpoint were ended. Raw traces stay Git-ignored; sanitized evidence is in `program-matching-verification.json`. Tests do not establish complete security, production readiness or official content approval. Repeated three-run acceptance remains pending.

## Limits and next increment

- Synthetic inventory only: no real provider recommendations, live availability, cost/scholarship response, goal/interest matching, postal-code/radius search or returned provider verification/source metadata yet. These are proposed extensions, not implemented functionality.
- City validation currently permits unaccented Latin letters, spaces, periods, apostrophes and hyphens. State validation checks two-letter syntax, not membership in a state-code list. Broader geography needs review.
- Ranking is bounded for the hackathon dataset, not a production geographic index. Unknown listings remain eligible for selection but the top-three cap can still omit them; assess fairness and pagination before scale-up.
- Matching and cited guidance work separately. The uninterrupted knowledge → match → consent → Case → support queue journey is not complete.
- Next: stateful support preparation and consent bound to the displayed draft, idempotent Case creation, narrowly scoped permissions and a real operator queue. A model-provided boolean alone is insufficient consent proof.

See [current status](../STATUS.md) and [engineering requirements](../ENGINEERING_REQUIREMENTS.md).
