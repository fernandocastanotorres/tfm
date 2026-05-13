# Architecture Index

## Governance
- [Boundary Rules](./BOUNDARY_RULES.md) — enforceable dependency and module boundary rules.
- [PR Template Snippet (Architecture Impact)](./PR_TEMPLATE_ARCHITECTURE.md) — checklist block for architecture-impacting PRs.

## Related ADRs
- [ADR-0001](../adr/0001-modular-architecture-public-backoffice-core.md) — three-module system architecture.
- [ADR-0007](../adr/0007-architectural-style-hexagonal-boundaries.md) — hexagonal/clean boundary model.

## How to Propose Architecture Changes

1. **Describe the change scope clearly**
   - What boundary, dependency rule, or module contract is affected?
   - Is it local (single module) or cross-module?

2. **Assess impact before implementation**
   - Security/RBAC impact
   - Audit/traceability impact
   - API/schema compatibility impact
   - Operational/deployment impact

3. **Create or update an ADR**
   - Use the ADR template: [ADR Template](../adr/_template.md)
   - For new decisions, create a new numbered ADR in `docs/adr/`.
   - For replacements, mark old ADR as `Superseded` and reference the new ADR.

4. **Update architecture rules when needed**
   - If enforcement rules change, update [Boundary Rules](./BOUNDARY_RULES.md).
   - Keep allowed/forbidden dependency tables and PR checklist consistent.

5. **Gate via review checklist**
   - Confirm all boundary-related PR checklist items are satisfied.
   - Require explicit acknowledgment from affected module owners for cross-boundary changes.

6. **Add automation for persistent rules**
   - If a new rule is meant to persist, add/adjust CI checks (architecture tests/lint constraints).
