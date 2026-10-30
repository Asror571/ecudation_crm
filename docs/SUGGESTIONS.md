# Suggestions and Specification Gaps

No product features have been added beyond the current tracked source. The
approved product specification, decisions, and design files were not present in
this checkout, so product behavior should not be inferred from this list.

| Gap to resolve | Why it blocks implementation |
|---|---|
| Restore `docs/TZ.md`, `DECISIONS.md`, and any approved `docs/design/` screens. | The target screens, data model, API contract, role policy, and design rules cannot be verified without these sources. |
| Confirm the mapping from current roles (`super_admin`, `workspace_super_admin`, `admin`) to the requested `operator` and `sales_head` roles. | Role names and access rules must match the backend authorization contract; no mapping has been assumed. |
| Define the approved initial-user provisioning and test-account process. | There is no user-creation controller, seed command, or test-account fixture, so valid login and role-specific workflows cannot be exercised. |
| Confirm the meaning and expected lifecycle of “global” workspace scoping. | The current workspace plugin is attached to the user schema, while no CRM resource schemas or cross-tenant API tests exist. |

These are requests for existing product decisions or source material, not
recommendations to add features.
