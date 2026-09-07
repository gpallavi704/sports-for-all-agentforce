# Sport Compass knowledge corpus

## Batch 1 - September 6, 2026

`curated/` contains ten UTF-8 text documents, one source per file. These are **project-prepared, selective summaries**, not verbatim source exports or USA Fencing-approved publications. The public source publisher, URL, displayed update date, retrieval date, language, applicability and review status are included in each file. AI source comparison is complete; human subject-matter approval remains pending.

The Salesforce Data Library UI explicitly supports TXT files up to 4 MB. Text files avoid unnecessary PDF conversion and keep individual source boundaries clear. No PDF artifacts were created for this batch.

### Content decisions

- Six official-site pages were inspected in the browser: Try Fencing, Parafencing, Parafencing 101, Parafencing Myths, Parafencing Club Locations and Parafencing Classification.
- Four Zendesk articles were read through the web tool: age verification, tournament registration, regional registration troubleshooting and FenceSafe reporting.
- Excluded personal athlete classification records, team biographies, medical forms, DIY frame instructions, detailed coaching and unsourced accommodation guarantees.
- Scope notes are explicitly labeled project editorial guidance. They are not authoritative safety enforcement; enforcement belongs in agent configuration and actions.
- Website pages without displayed publication/update dates are marked Not displayed. Retrieval date is never substituted for an effective date.
- Classification source explicitly discusses 2025-26. No claim is made that its terms were validated for a later season.
- The Myths source is selectively summarized, not reproduced wholesale. Medical examples, stereotypes and DIY equipment passages were omitted.
- The source-linked FenceSafe reporting destination was identified from the article; its form was not submitted.
- Club records, event availability and individualized classifications are not included in this corpus.

### Original samples and recovery

The six original synthetic PDFs remain at `/Users/lavig/Desktop/Dreamforce Good hackathone/output/pdf/` and can be regenerated using `/Users/lavig/Desktop/Dreamforce Good hackathone/scripts/create_fencing_knowledge_pack.py`.

Removed from the shared knowledge library after the replacement batch was indexed (local originals retained):

1. 01_parafencing_getting_started.pdf - superseded by sourced introductions.
2. 02_parafencing_primer_spanish.pdf - unreviewed translation of synthetic guidance.
3. 03_synthetic_para_capable_club_directory.pdf - fictional clubs should be separate structured demo records, not policy grounding.
4. 04_classification_journey_guide.pdf - superseded by source-backed process navigation.
5. 05_equipment_and_secured_frame_checklist.pdf - synthetic safety/equipment guidance; not validated technical instructions.
6. 06_safety_accommodation_and_escalation_policy.pdf - prototype instructions belong in agent/action controls; source-backed reporting guidance replaces knowledge use.

Do not delete original local files or shared org assets. A separate deployment note records actual upload/removal results; this plan alone is not evidence of an org change.

### Next sources, not yet ingested

Membership renewal/upgrades, current handbook sections and amendments, domestic tournament equipment, waitlists, refunds and MAAPP. Curate these only after validating applicability and consistency. Do not bulk-import old handbook editions, expired funding announcements or private support data.

### Acceptance tests

`retrieval-tests.json` defines expected evidence and negative assertions. Index success is not proof of retrieval quality or faithful answers. Run tests through a fresh live read-only agent preview; simulation is insufficient to validate actual retrieval. Preserve original source URLs in responses where available, and do not assume uploaded-file citations automatically link to the original website.
