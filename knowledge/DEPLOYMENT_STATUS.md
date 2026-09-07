# Knowledge migration - September 6, 2026

## Scope

Replace six synthetic knowledge PDFs in the existing USA Fencing Approved Knowledge library with ten source-labeled text summaries. Preserve the library's API identity, Data Cloud resources and Sport Compass draft connection. No activation, permission expansion or private-data ingestion is included.

## Current status

- Ten curated text files created and locally checked for required provenance fields.
- Ten retrieval acceptance cases defined (not executed against live retrieval yet).
- All ten files uploaded, saved and individually shown as Indexed; the library reached Ready.
- All six original synthetic PDFs removed using the file-row Remove from Library operation. Final file count is ten.
- Label changed to Sport Compass Fencing Sources; API name remains USA_Fencing_Approved_Knowledge. Description explicitly identifies public-source summaries, English language and pending human review.
- The Sport Compass draft's existing library selection and checked Show sources option were verified before the label change; no agent activation or version commit was performed.
- Original PDFs remain locally available for restoration as documented in README.md.

## Validation limits

The source summaries are AI-curated, not USA Fencing-approved. Source dates and applicable seasons must remain visible in answers. In particular, the classification page discusses a 2025-26 system; this does not validate future-season eligibility. The corpus is English only. Synthetic Spanish guidance is not a validated translation capability.

## Completed cleanup

Removed only the six original synthetic PDFs listed in README.md after all ten replacements were individually shown as Indexed. No local files were deleted; SHA-256 hashes of the retained originals are recorded in legacy-backup-sha256.txt. Salesforce refreshed its index after each removal. Neither the library nor its Data Cloud index/retriever was deleted.
