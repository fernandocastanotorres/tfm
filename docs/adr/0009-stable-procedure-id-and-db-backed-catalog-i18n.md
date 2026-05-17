# ADR-0009: Stable Procedure Identifier and DB-Backed Catalog i18n

## Status
Accepted

## Date
2026-05-17

## Context
Procedure start previously depended on slug-based routing. With localized catalog titles, slug resolution became unstable across languages and produced 404 scenarios. At the same time, catalog translations needed to be editable in backoffice instead of static-only bundle files.

## Decision
1. Use **stable procedure identifier (`procedureId` UUID)** as the canonical key for procedure start and case creation.
2. Persist editable translations in **`procedure_type_i18n`** and resolve localization from DB first, with bundle fallback.
3. Enforce **login-first procedure start** for protected flows using `returnUrl` continuity.

## Rationale
- UUID-based addressing is language-neutral and durable.
- DB-backed translations allow operational editing from backoffice without redeploying frontend/backend bundles.
- Fallback strategy enables gradual migration while preserving existing localized behavior.

## Consequences
### Positive
- Eliminates i18n-related slug drift during procedure start.
- Enables full translation lifecycle in backoffice.
- Improves user experience by resuming intended flow after authentication.

### Negative
- Requires schema migration and data governance for translation rows.
- Adds translation consistency responsibility (missing locale values, review workflows).

## Implementation Notes
- Table migration: `backend/db/postgresql/001_create_procedure_type_i18n.sql`
- Backoffice endpoints: `/api/v1/admin/procedure-types/{id}/translations`
- Citizen flow: protected wizard route `/expedientes/nuevo/:procedureId`

## Revisit Criteria
Reevaluate if:
- translation scope expands to task-level/schema-level dynamic content requiring additional i18n tables,
- public SEO or legal constraints require durable, language-specific aliases beyond UUID routing.
