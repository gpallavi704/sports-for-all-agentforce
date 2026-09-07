# Copyable email draft in Preview

September 7, 2026. Version 17 is active.

The user's version 15 browser test showed a mailto link replaced by URL_Redacted. The correct recipient and draft did not establish a working email integration. This update removes the link rather than presenting a non-working button.

The public-club action now returns recipientLabel: Sport Compass Team, a normal subject, the draft body and one short disclosure: Prototype destination: project team, not the club. Copyable draft only; nothing has been sent. The actual email address and mailto URL are omitted from the action output. The configured test inbox remains in the org custom label and is not changed by this deployment.

This is a copyable inquiry draft, not message delivery, a Case, a mail client launch or a real club contact. There is no sending action, email button, SMS or call capability. Future send functionality needs a separate implementation and explicit confirmation.

Deployment 0AfgL00000WuPxNSAV succeeded with the public-club Apex suite. Tests assert that the output has the team label, no recipient address or mailto URL and no writes/callouts. AgentScript validation, publication and activation succeeded. The local structural check and all 43 local integration tests passed.

The updated live regression checks label, disclosure, no email address, no mailto/redacted/button text, no repeated DEMO ONLY and no em dash in the email response. Earlier version 15 evidence remains historical; it does not imply successful email delivery.

The first version 16 live run passed both location checks, then failed because the email answer omitted Sport Compass Team. It did include the project-team disclaimer and copyable draft, with no email address or button. A stricter local topic format was added to require the Recipient line and omit unnecessary source paragraphs in composed drafts. The failed run is not counted as a pass.

Version 17 passed all three live CLI turns: Salt Lake City lookup, short Kaysville follow-up and labeled email draft. Assertions confirmed Sport Compass Team, the project-team/not-club boundary, no recipient address, no mailto or URL_Redacted, no Open in email, no DEMO ONLY, no em dash and no claim of sending. The session closed. This verifies the actual conversational output; a fresh browser display check is still useful. No email or Case was sent or created by this test.
