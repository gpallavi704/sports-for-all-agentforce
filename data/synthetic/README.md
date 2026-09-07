# Synthetic Sport Compass inventory

Six fictional records: one sport, one organization, four programs. Three programs are published and one is deliberately unpublished for an access-denial test. All records use Is_Demo__c=true and DEMO names. None represents an actual club, verified accommodation, real fee or competition eligibility rule. The example.org links are placeholders, not supporting evidence.

The simulated verified-accessibility scenario is not real-world verification. Unconfirmed checkbox values must never be translated into assertions that a feature is unavailable. Production data should use explicit tri-state feature status or a feature-verification model.

Import is insert-only, not an idempotent upsert. Check for existing SC-DEMO program codes AND the two DEMO parent names before importing. Do not rerun after partial success without reconciling the already-created records.

From this directory:

```sh
sf data import tree --target-org sport-compass --plan import-plan.json --json
```

Owners are the importing administrator. Published records are shared read-only with the SportCompass_Discovery_Readers group; permission sets still govern object and field access. No Accounts, Contacts or Cases are seeded. No files from this folder should enter the factual knowledge library.
