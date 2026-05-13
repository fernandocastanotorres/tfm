# API Contract (Core Backend)

This document defines baseline API contract conventions for the ENS/ENI-compliant records platform.

It complements:
- `REQUIREMENTS.md`
- ADR-0001 (modular architecture)
- ADR-0003 (Spring Security/JWT + JPA/PostgreSQL)
- ADR-0004 (Camunda 7)
- `docs/security/AUTHORIZATION_MATRIX.md`

## 1) Base Conventions

- Base path: `/api/v1`
- Content type: `application/json; charset=utf-8`
- Authentication: `Authorization: Bearer <jwt>` on protected endpoints
- Public identifiers: UUID v4 only
- Timestamps: UTC ISO-8601

## 2) Versioning and Compatibility

1. URI major versioning is mandatory (`/v1`, `/v2`, ...).
2. Backward-compatible changes are allowed within the same major version:
   - adding optional fields,
   - adding new endpoints,
   - adding non-breaking enum values (with client tolerance).
3. Breaking changes require a new major version.
4. Deprecation policy:
   - mark endpoint as deprecated in docs,
   - communicate replacement,
   - define removal date.

## 3) Canonical Resource Domains

- Authentication: `/auth/*`
- Citizen procedures and documents: `/citizen/*`
- Backoffice tasks and processing: `/backoffice/*`
- Administration: `/admin/*`
- Health checks: `/health/*`

## 4) Endpoint Inventory (Baseline)

> Exact authorization requirements are defined in `AUTHORIZATION_MATRIX.md`.

### 4.1 Authentication

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/login` | POST | Exchange credentials for JWT/refresh tokens |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/logout` | POST | Invalidate session/token context |

### 4.2 Citizen

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/citizen/procedures` | POST | Create procedure draft |
| `/api/v1/citizen/procedures/{procedureUuid}` | GET | Get own procedure details |
| `/api/v1/citizen/procedures/{procedureUuid}/status` | GET | Get own procedure status |
| `/api/v1/citizen/procedures/{procedureUuid}/submit` | POST | Submit procedure |
| `/api/v1/citizen/procedures/{procedureUuid}/amend` | POST | Amend procedure in correction loop |
| `/api/v1/citizen/procedures/{procedureUuid}/documents` | POST | Upload document |
| `/api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid}` | GET | Download/get document metadata |

### 4.3 Backoffice

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/backoffice/tasks` | GET | List tasks (filterable/paginated) |
| `/api/v1/backoffice/tasks/{taskId}` | GET | Get task detail |
| `/api/v1/backoffice/tasks/{taskId}/claim` | POST | Claim task |
| `/api/v1/backoffice/tasks/{taskId}/complete` | POST | Complete task |
| `/api/v1/backoffice/tasks/{taskId}/return-for-amendment` | POST | Return case to citizen for amendment |
| `/api/v1/backoffice/procedures/{procedureUuid}` | GET | Internal procedure detail |
| `/api/v1/backoffice/procedures/{procedureUuid}/metadata` | PATCH | Update ENI-related metadata (policy constrained) |
| `/api/v1/backoffice/procedures/{procedureUuid}/sign` | POST | Trigger XAdES-T signature |
| `/api/v1/backoffice/procedures/{procedureUuid}/enidoc` | POST | Generate ENIDOC package |
| `/api/v1/backoffice/procedures/{procedureUuid}/enidoc` | GET | Download generated ENIDOC |

### 4.4 Administration

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/admin/users` | GET | List users |
| `/api/v1/admin/users` | POST | Create user |
| `/api/v1/admin/users/{userId}` | PATCH | Update user/roles |
| `/api/v1/admin/users/{userId}` | DELETE | Disable/delete user |
| `/api/v1/admin/bpmn/deployments` | POST | Deploy BPMN definitions |
| `/api/v1/admin/bpmn/process-definitions` | GET | List process definitions/deployments |
| `/api/v1/admin/audit/events` | GET | Query audit events |

### 4.5 Health

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/health/live` | GET | Liveness check |
| `/api/v1/health/ready` | GET | Readiness check (restricted detail) |

## 5) Request/Response Principles

1. JSON object top-level for all business responses.
2. Use stable field names and explicit enums.
3. Avoid polymorphic payload ambiguity unless clearly discriminated.
4. Return `resourceUuid` consistently for primary entities.

## 6) Error Model (Summary)

Detailed format should be specified in `docs/api/ERROR_MODEL.md`.

Minimum response fields for errors:
- `timestamp`
- `status`
- `code` (machine-readable)
- `message` (human-readable)
- `path`
- `correlationId`

Recommended HTTP status usage:
- `400` validation/request format errors
- `401` unauthenticated
- `403` unauthorized/forbidden
- `404` resource not found
- `409` state conflict/business conflict
- `422` semantic/processable entity errors (optional policy)
- `500` internal server errors

## 7) Pagination and Filtering (Collection Endpoints)

Baseline query parameters:
- `page` (0-based)
- `size` (max capped by server policy)
- `sort` (`field,asc|desc`, repeatable)

Recommended response shape:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

## 8) Dynamic Form Contract (UI <-> Backend)

The backend must provide schema-driven form payloads for workflow tasks.

Minimum payload contract:
- `taskId`
- `taskDefinitionKey`
- `schemaVersion`
- `formSchema` (JSON schema)
- `uiSchema` (optional presentation hints)
- `initialData` (optional)
- `allowedActions`

Rule:
- Workflow/business validation remains authoritative in backend even if client-side validation passes.

## 9) Idempotency and Concurrency

For sensitive POST/PATCH actions (submit, sign, enidoc generation):
- support idempotency key where practical,
- protect against duplicate submissions,
- return deterministic conflict responses (`409`) when state invalid.

## 10) Traceability Requirements

All protected requests should propagate a correlation ID:
- Accept `X-Correlation-Id` from trusted callers or generate server-side.
- Return correlation ID in response headers and include it in audit/error records.

## 11) Change Management

When adding/changing endpoints:

1. Update this contract document.
2. Update authorization matrix and test catalog.
3. Update error model if new codes/statuses are introduced.
4. Update ADRs if decision-level impact exists.
