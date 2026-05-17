# ADR-0011: Self-Contained ENI Metadata Store with PostgreSQL (Alfresco Optional)

## Status
Accepted

## Date
2026-05-17

## Context
We need ENI-compliant metadata persistence for procedures and documents. A fully external content platform (for example Alfresco) is viable, but introduces operational coupling and higher deployment complexity when the objective is a self-contained baseline.

## Options Considered
1. **Alfresco-first metadata persistence**
   - Pros: strong ECM capabilities, native document governance patterns.
   - Cons: extra infrastructure, integration complexity, slower local/prototyping workflows.
2. **Self-contained PostgreSQL metadata registry (chosen)**
   - Pros: single-stack deployment, easier observability and backups, simpler local/dev setup.
   - Cons: fewer out-of-the-box ECM features, custom evolution of ENI mappings required.
3. **Hybrid (PostgreSQL now, Alfresco later)**
   - Pros: incremental adoption.
   - Cons: transitional complexity and dual-source governance risk.

## Decision
Adopt a **self-contained ENI metadata registry in PostgreSQL** as the canonical source for procedure/document metadata snapshots, with clear extension path to Alfresco integration later.

## Rationale
- Keeps the platform deployable as a single bounded system.
- Reduces time-to-delivery for ENI traceability requirements.
- Preserves architectural optionality: metadata contract is explicit and can be projected to Alfresco in a later adapter.

## Consequences
### Positive
- No mandatory external ECM dependency for baseline compliance.
- Predictable migrations and operational lifecycle.
- Metadata APIs become testable and versioned inside the same backend.

### Negative
- We own schema and mapping evolution responsibilities.
- Advanced records-management capabilities remain future work.

## Implementation Notes
- New table: `eni_metadata` (`resource_type`, `resource_id`, `metadata_json`)
- Migration: `backend/db/postgresql/004_create_eni_metadata_table.sql`
- Automatic metadata upsert on case/document lifecycle updates in services.
- Backoffice query endpoints:
  - `GET /api/v1/admin/eni/metadata/procedures/{id}`
  - `GET /api/v1/admin/eni/metadata/documents/{id}`

## Revisit Criteria
Reevaluate when:
- ENI packaging requires direct ECM retention/disposition capabilities,
- legal/audit requirements demand immutable WORM-grade storage integration,
- cross-organization interoperability mandates Alfresco as system of record.
