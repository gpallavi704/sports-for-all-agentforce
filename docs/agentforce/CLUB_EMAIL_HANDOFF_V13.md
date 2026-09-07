# Club follow-ups and email handoff

## Current checkpoint: version 15

The live CLI regression passed all three turns: Salt Lake City listing, short Kaysville follow-up and email request using the configured test inbox with a demo disclaimer. Session closed successfully. This verifies conversational data, not clickable mailto rendering or email delivery.

Version 15 is active. The approved test inbox is configured in the org-only SportCompass_Demo_Email custom label. The committed label deliberately contains a non-deliverable placeholder; deploying that placeholder overwrites the configured inbox, so configure the test recipient separately after a full deployment. The private deployment override is under ignored temp/, never committed. No email was sent or email application opened.

The email-this-club lookup now accepts only bounded phrases and exactly one prior public listing, then refreshes facts from metadata. New explicit locations never reuse the prior selection. Deployment 0AfgL00000WuMoDSAV succeeded with the test-inbox configuration. Earlier chronological notes below are superseded where they mention a placeholder still active or pending AgentScript publication.

Superseding user direction: use only a test inbox for the demo. Both real recipients below have been removed from the executable handoff. The deployed Apex now returns sportcompass-demo@example.invalid with isDemo=true and a DEMO ONLY subject. This is non-deliverable. An approved user-controlled test inbox is still needed. No email was sent. The revised demo-only AgentScript is not yet published/activated. Do not treat the earlier live test as complete: location switching passed, but email-this-club asked for the location again. A bounded previous-selection fix was subsequently deployed with tests and awaits live regression.

September 7, 2026. Version 13 is active.

## Lookup correction

The current-message parser included `What about` in the city string. It now strips bounded conversational lead-ins such as `What about`, `How about` and `And`, retaining explicit city/state matching. Tests cover Kaysville, unknown Atlantis, a stale caller city, missing state and multiple locations. This is not universal natural-language geocoding.

## Email handoff

The read-only club lookup now returns an emailHandoff object containing a fixed recipient, subject, generic inquiry body, source, review date and percent-encoded mailto URL. No arbitrary recipient, CC/BCC, attachments, private conversation text or credentials are accepted. It never sends email or creates a Case. Users must review the draft and press Send in their own email application.

Public contact sources checked September 7, 2026:

- [Salt City Swords homepage](https://www.saltcityswords.com/): info@saltcityswords.com.
- [Wasatch Fencing homepage](https://www.wasatchfencing.com/): ronh@wasatchfencing.org, listed in the contact section. The page also lists another address; the contact-section address is the curated route.

Addresses are publicly listed, not delivery-tested or evidence of parafencing availability. The fixed contact mapping expires after 90 days and returns no handoff until reviewed and updated. Record the new review date in code when maintaining it. It is a small MVP mapping, not a general contact directory.

Agent instructions allow only the exact returned mailto URL, with recipient and draft visible. If the client does not render mailto, the fallback is a copyable recipient and message. Clicking/opening email clients has not been tested. No email has been sent. The MCP response projector has not been extended for mailto; no headless client support is claimed.

## Verification

Deployment 0AfgL00000WuKmPSAV passed all 10 public-club Apex tests, including read-only behavior, recipient allowlisting and URL generation. All 43 local integration tests and structural checks passed. AgentScript validation, publication and version 13 activation succeeded.

Live conversational regression is tracked with scripts/test-contact-handoff-live.mjs. Browser mailto rendering, email-app launch and a complete current-version support journey remain separate checks.
