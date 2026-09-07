# Conversational support and explicit confirmation

September 7, 2026. Agent version 12 remains active; these updates are in its Apex service.

The reply parser previously accepted only a small list including `yes` and `I confirm`. It rejected the instructed phrase `yes create this demo case` as AWAITING_CONSENT. Added whole-message variants with an optional comma and final period, plus the exact cancellation phrase `Cancel the request.`. No substring consent, LLM classification or broad punctuation stripping is used. Conditional, quoted, external-prefixed and multi-command messages remain blocked.

The parser deployment `0AfgL00000WuDzRSAV` passed 12 support Apex tests. A live published-agent regression then passed cancellation, revision, explicit confirmation and retries. It created synthetic Case 00001012 in Sport Compass Support and no duplicate. Both CLI sessions ended. This test used the earlier full disclosure, not the shorter wording below.

The subsequent disclosure deployment `0AfgL00000Wu3yUSAR` also passed all 12 support Apex tests. The draft is now three conversational paragraphs that identify the demo program and reason, explain the demo-only queue and lack of real response, disclose unverified accessibility, and summarize saved fields and excluded participant data. Technical audit identifiers cover the request key, runtime identity and Salesforce audit fields. The entire returned draft is still shown before confirmation.

Signed tokens, runtime identity checks, 30-minute expiry, current-data validation and idempotency are unchanged. Since confirmation checks exact draft text, earlier signed drafts become stale and must be prepared and approved again. No existing Cases or historical evidence were deleted.

The shortened disclosure has deployment/unit coverage; a fresh browser presentation and full journey retest remain pending. Local structural verification and 43 integration tests passed during the parser work. No Agent API/MCP activation or permissions changes were made.
