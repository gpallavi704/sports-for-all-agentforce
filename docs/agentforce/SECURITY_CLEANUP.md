# Step 1 — Sport Compass permission cleanup

Verified September 6 Pacific / September 7 UTC, 2026. Agent remains inactive. This checkpoint concerns the discovery-only permission configuration, not runtime readiness.

## Applied

- Backed up generated agent permission sets in the separate local snapshot project.
- Standard Secure Base and runtime group were not exportable through Metadata API; their assignments, component sets, and grants were inspected through read-only queries instead. See security-baseline-before.json.
- Validated and deployed SportCompass_Knowledge_Runtime (deployment 0AfgL00000WsiBJSAZ), licensed for Einstein Agent, granting only AllowViewKnowledge.
- Assigned that set to the existing Sport Compass agent.
- Removed exactly one PermissionSetAssignment: 0PagL00000iFHNPSA4, linking this agent to AgentforceServiceAgentSecureBase. The shared standard set itself was not edited/deleted. No other user's assignments changed.
- Kept the existing Service Agent runtime group, Data Cloud/Prompt Template/Service Agent licenses, generated permission sets and Discovery Read assignment.

## Verified

Tooling UserEntityAccess shows Account, Contact, Case, MessagingSession and MessagingEndUser have no effective read/create/edit/delete access for this agent. Five published demo records retain read-only access; the unpublished program remains inaccessible. Assignment and runtime license checks passed.

The original base ObjectPermissions included Case create, but the before-change effective UserEntityAccess query reported IsCreatable=false for Case. Permission-set declarations and effective access are not interchangeable. Before-change Contact read/edit and Case read were confirmed.

Run the read-only org-specific regression:

```sh
node scripts/verify-agent-access.mjs sport-compass
```

Do not confuse these checks with an authenticated end-user runtime test or full security audit.

## Remaining activation gates

1. Run actual knowledge retrieval as the agent to confirm the minimal baseline is sufficient. Do not claim retrieval is verified merely because Knowledge permission and AI licenses remain. If Salesforce requires additional platform grants, add only demonstrated dependencies and repeat access checks.
2. Remove unrelated generic service-template subagents/actions from the draft. They still exist and can fail under the reduced permissions.
3. Review the generated NextGen permission set's default Data Cloud dataspace scope: dataAccessLevel=ALL and objectAccessLevel=BY_POLICY. This is separate from Salesforce CRM permissions; validate data policy and library-only grounding before loading any private Data Cloud content.
4. Verify custom Apex/Flow execution contexts, field access, prompt-injection boundaries and publication filtering.
5. Case intake is not implemented. This checkpoint intentionally removes Case access; a later consent-enforced intake design will need an explicit, carefully tested privilege decision.
6. Messaging channels are not configured for this headless MVP; messaging object access was not retained.

## Recovery

The exact reassignment command is in security-baseline-before.json. Reassignment restores the broad base privileges; do not execute casually or activate before re-review. Assignment removal is recoverable and no business data was deleted.

## Source

Salesforce's [Configure Service Agent Access](https://help.salesforce.com/s/articleView?id=ai.agent_user.htm&language=en_US&type=5) documents the separate agent identity, default sets, runtime group, object-permission management and execution-context distinctions. The custom minimal baseline is a project-specific implementation, not a Salesforce-certified replacement.
