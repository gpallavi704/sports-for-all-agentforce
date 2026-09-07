# Version 10 response presentation

September 6 Pacific / September 7 UTC, 2026.

## Changes

- Disabled native file citations at the Agent Script layer with `additional_parameter__disable_citation: True` and `knowledge.citations_enabled: False`.
- Kept the existing Data Library and knowledge retrieval bindings. Original public source URLs remain required when supported by retrieved evidence.
- Default guidance targets three short bullets, about 120 words and a compact Sources line. This is a model instruction, not an enforced maximum. Required safety warnings and complete support consent disclosures are exempt.
- Removed contradictory instructions to preserve native file markers. Do not expose signed storage links, internal filenames or fabricate public citations.
- Updated structural assertions and knowledge tests for the new citation mode. Native file-label checks are conditional; original public URLs remain required. Tests flag storage URLs before sanitizing output, without recording those URLs.

## Browser verification

Version 10 was published and activated. In a fresh Live Test conversation, the original wheelchair-fencing beginner/equipment question returned three bullets, a compact Sources line and an offer to expand. The answer retained equipment-confirmation and supervised-arrangement caveats and identified project-prepared summaries.

Actual link destinations were independently read from the rendered links:

- https://www.usafencing.org/try
- https://www.usafencing.org/parafencing-myths
- https://www.usafencing.org/parafencing-101

No native Sources button or internal file link was present. This verifies that response, not every possible turn, deployment channel or source-faithfulness claim. Public source links are model-rendered from retrieved metadata, not a new deterministic citation mapper. The existing headless response projection still allowlists public URLs; ChatGPT remains unconnected.

The answer was shorter but word count is not hard-limited. The full support journey was not repeated for this presentation-only change. No support Case was requested by these checks. No permissions, OAuth settings, documents or Apex support actions were changed. The external app remains disabled.

## Additional test evidence

The KB01 and KB06 draft CLI checks returned source titles but no URLs, so their URL-presence assertions failed. Both sessions ended. The generation traces contained public URLs in the generated responses; installed Salesforce `@salesforce/agents` code sends `x-attributed-client: no-builder` with an explicit comment that this removes Markdown from responses. Do not silently mark these CLI checks as passing or interpret plain-text output as proof of browser link behavior. Classification output retained the historical-season caveat and declined personal eligibility decisions. Browser destinations were checked separately above. Current-version headless API behavior remains unverified.

Local output projection has an additional mocked regression that strips a synthetic signed file URL and its parameters while retaining an allowlisted public link. This proves that fixture only, not arbitrary markup or every downstream renderer.

## Platform reference

The configuration follows Salesforce's [Agent Script response configuration guide](https://help.salesforce.com/s/articleView?id=005387148&language=en_US&type=1). Suppressing native citation display does not itself establish grounding or safe external authorization.
