# Natural-language lookup and visit-plan export

September 7, 2026.

## Search fix

The earlier combined Kaysville request passed a fresh direct Salesforce-backed
MCP check before this change, so that original failure was not consistently
reproducible. The earlier ChatGPT answer also widened geography; the public MCP
tool description now tells the host to preserve the requested city and state.
This is model guidance, not a deterministic guarantee about ChatGPT wording.

A concrete parser regression was reproduced: `Find a club near Salt Lake City
Utah and help me prepare for a first visit.` returned no listing before the fix.
The Apex parser now accepts `City Utah` and `City UT` without a comma. Other state
codes retain explicit `City, ST` syntax. Missing locations, ambiguous requests and
out-of-scope geography do not silently reuse the previous city.

Only `FindPublicFencingClubsAction` and its test class were deployed. Retrieved
org source matched the committed baseline except for its final newline. No
permissions, Salesforce agent definitions, private CRM data or contact actions
were changed. Both existing agents use the shared public lookup class.

Deployment `0AfgL00000Wv90wSAB` passed all 12 selected Apex tests. After deployment,
`node scripts/smoke-search.mjs --approved-live-check` passed all three live public
MCP checks: combined Kaysville lookup/planning, comma-free Salt Lake City lookup,
then an Atlantis no-result follow-up with neither prior club carried forward.
The test ends its Salesforce session. Broader phrasing, grounding and production
readiness are not established by these three cases.

## Portable visit plan

The widget generates a small, standalone HTML document locally from the
selected public club identity and one to four selected preparation questions.
It includes source links, the source review date and explicit unknown access and
equipment status. It excludes chat history, hidden session handles, email
addresses, diagnoses and personal progress marks. The file contains escaped
text, allowlisted links and no JavaScript, network assets or telemetry.

The download button uses the MCP Apps host-mediated file API only after a user
click. No additional model or Salesforce call is made. Unsupported, declined or
failed downloads show a selected-text fallback; the UI must not claim a file was
saved merely because a request was initiated. The export does not create a
booking, contact a club or verify accessibility.

Local checks: 69 tests pass. The source export was visually inspected, and the
local fixture host received its download request. Local host behavior alone is
not proof of a saved file or support in ChatGPT.

In the [live v3 ChatGPT check](https://chatgpt.com/c/6a9ea61f-9d0c-83e8-aaa0-4081bde175cb),
the combined Kaysville lookup returned Wasatch and the checklist built correctly.
The download attempt did not complete and displayed the selected-text recovery
path. No file save is confirmed. File download is not an accepted ChatGPT demo
feature. The v4 revision makes the source-linked copy action primary, hides
download unless the host advertises support, and hides it for the rest of the
card lifetime after a failed or declined request. No background upload is used.

The final v4 local fixture was inspected at 375-pixel width in dark mode. Copy
remains primary, secondary buttons wrap, and the copy action returned a success
acknowledgment. Full screen-reader testing is still pending.

## Connection handoff

The private tunnel stopped during the v4 rollout because the existing macOS
Keychain lookup failed. No key value was printed, copied or changed. No Keychain
protection was relaxed. ChatGPT's Refresh action returned an error, so its cached
manifest remains v3. The v4 live acceptance check is not complete.

When the Mac and credential are available again:

1. Restart the existing private public-guidance tunnel with its local launcher.
2. Resolve any macOS Keychain access prompt for the existing tunnel credential.
   Do not paste keys into chat, source files or Git.
3. Refresh the existing Sport Compass app in ChatGPT settings. Do not create a
   duplicate connector. Confirm `first-visit-v4.html` is listed.
4. Start a fresh app conversation, search Kaysville, build the checklist and use
   **Copy my plan**. Verify hidden unsupported download controls and source links.

Salesforce remains active. Only the separate ChatGPT connection is unavailable
while this tunnel is stopped.

The UI/UX skill informed visible action feedback, mobile button wrapping and the
copy fallback. The implementation uses the pinned MCP Apps SDK `downloadFile`
contract. OpenAI's optional file APIs and the SDK host capability are not assumed
to be supported in every ChatGPT client.
