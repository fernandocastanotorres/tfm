# API Contract (Core Backend)

This document defines baseline API contract conventions for the ENS/ENI-compliant records platform.

It complements:
- `REQUIREMENTS.md`
- ADR-0001 (modular architecture)
- ADR-0003 (Spring Security/JWT + JPA/PostgreSQL)
- ADR-0008 (Flowable)
- ADR-0009 (stable procedure ID + DB-backed i18n)
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
- Backoffice tasks and processing: `/admin/*`
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
| `/api/v1/citizen/procedures` | GET | List own procedures (paginated) |
| `/api/v1/citizen/procedures/{procedureUuid}` | GET | Get own procedure details |
| `/api/v1/citizen/procedures/{procedureUuid}/status` | GET | Get own procedure status |
| `/api/v1/citizen/procedures/{procedureUuid}/submit` | POST | Submit procedure |
| `/api/v1/citizen/procedures/{procedureUuid}/amend` | POST | Amend procedure in correction loop |
| `/api/v1/citizen/procedures/{procedureUuid}/documents` | POST | Upload document |
| `/api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid}` | GET | Download/get document metadata |
| `/api/v1/citizen/procedures/catalog` | GET | Public procedure catalog list |
| `/api/v1/citizen/procedures/catalog/{identifier}` | GET | Public procedure detail by UUID or slug |
| `/api/v1/citizen/procedures/catalog/{identifier}/form-schema` | GET | Public form-task schema |
| `/api/v1/citizen/procedures/catalog/{identifier}/tasks/{taskId}/schema` | GET | Public task schema by task ID |
| `/api/v1/citizen/public-content/legislation` | GET | Public legislation feed (filter by type) |
| `/api/v1/citizen/public-content/faq/categories` | GET | Public FAQ categories |
| `/api/v1/citizen/public-content/faq` | GET | Public FAQ entries (filter by category/query) |
| `/api/v1/citizen/public-content/calendar` | GET | Public deadlines/events feed |
| `/api/v1/citizen/public-content/institutional` | GET | Public institutional information sections |
| `/api/v1/citizen/public-content/organisms` | GET | Public organisms directory (filter by category/query) |
| `/api/v1/citizen/public-content/resources` | GET | Public resources feed (filter by type/query) |

### 4.3 Backoffice

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/admin/dashboard/stats` | GET | Backoffice dashboard metrics |
| `/api/v1/admin/dashboard/report` | GET | Backoffice report (distribution, SLA, trend) |
| `/api/v1/admin/eni/metadata/procedures/{id}` | GET | ENI metadata snapshot for a procedure |
| `/api/v1/admin/eni/metadata/documents/{id}` | GET | ENI metadata snapshot for a document |
| `/api/v1/admin/tasks/pending` | GET | List pending internal tasks |
| `/api/v1/admin/procedures` | GET | List cases for processing |
| `/api/v1/admin/procedures/{caseId}` | GET | Get internal case detail (includes `entryNumber`, attachments include `exitNumber`/`generated`) |
| `/api/v1/admin/procedures/{caseId}/status` | PATCH | Update case status |
| `/api/v1/admin/procedures/{caseId}/tasks/{taskId}/resolve` | POST | Resolve current task |

### 4.4 Administration

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/admin/users` | GET | List users |
| `/api/v1/admin/users` | POST | Create user |
| `/api/v1/admin/users/{userId}` | PUT | Update user/roles |
| `/api/v1/admin/users/{userId}/status` | PATCH | Activate/deactivate user |
| `/api/v1/admin/procedure-types` | GET | List managed procedures |
| `/api/v1/admin/procedure-types` | POST | Create managed procedure |
| `/api/v1/admin/procedure-types/{id}` | PUT | Update managed procedure |
| `/api/v1/admin/procedure-types/{id}/status` | PATCH | Update managed procedure status |
| `/api/v1/admin/procedure-types/{id}/translations` | GET | List persisted translations by locale |
| `/api/v1/admin/procedure-types/{id}/translations` | PUT | Upsert persisted translation for locale |
| `/api/v1/admin/public-content/legislation` | GET/POST | List or create legislation base content (`es-ES`) |
| `/api/v1/admin/public-content/legislation/{id}` | PUT/DELETE | Update/delete legislation by logical content UUID |
| `/api/v1/admin/public-content/legislation/{id}/translations` | GET | List legislation translations by logical content UUID |
| `/api/v1/admin/public-content/faq/categories` | GET/POST | List or create FAQ categories base content (`es-ES`) |
| `/api/v1/admin/public-content/faq/categories/{id}` | PUT/DELETE | Update/delete FAQ category by logical content UUID |
| `/api/v1/admin/public-content/faq/categories/{id}/translations` | GET | List FAQ category translations by logical content UUID |
| `/api/v1/admin/public-content/faq` | GET/POST | List or create FAQ entries base content (`es-ES`) |
| `/api/v1/admin/public-content/faq/{id}` | PUT/DELETE | Update/delete FAQ entry by logical content UUID |
| `/api/v1/admin/public-content/faq/{id}/translations` | GET | List FAQ translations by logical content UUID |
| `/api/v1/admin/public-content/calendar` | GET/POST | List or create calendar entries base content (`es-ES`) |
| `/api/v1/admin/public-content/calendar/{id}` | PUT/DELETE | Update/delete calendar entry by logical content UUID |
| `/api/v1/admin/public-content/calendar/{id}/translations` | GET | List calendar translations by logical content UUID |
| `/api/v1/admin/public-content/institutional` | GET/POST | List or create institutional sections base content (`es-ES`) |
| `/api/v1/admin/public-content/institutional/{id}` | PUT/DELETE | Update/delete institutional section by logical content UUID |
| `/api/v1/admin/public-content/institutional/{id}/translations` | GET | List institutional translations by logical content UUID |
| `/api/v1/admin/public-content/organism-categories` | GET | List organism categories for relation selects |
| `/api/v1/admin/public-content/organisms` | GET/POST | List or create organisms base content (`es-ES`) |
| `/api/v1/admin/public-content/organisms/{id}` | PUT/DELETE | Update/delete organism by logical content UUID |
| `/api/v1/admin/public-content/organisms/{id}/translations` | GET | List organism translations by logical content UUID |
| `/api/v1/admin/public-content/resources` | GET/POST | List or create resources base content (`es-ES`) |
| `/api/v1/admin/public-content/resources/{id}` | PUT/DELETE | Update/delete resource by logical content UUID |
| `/api/v1/admin/public-content/resources/{id}/translations` | GET | List resource translations by logical content UUID |

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

## 5b) Registry Number Fields in DTOs

The following fields have been added to the response payloads as optional (backward-compatible):

| DTO | Field | Format | Example | Description |
|-----|-------|--------|---------|-------------|
| `CaseDetail`, `CaseItem`, `CaseStatusResponse` | `entryNumber` | `RE/{unitCode}/{year}/{seq6}` | `RE/URB/2026/000001` | Entry registry number (NRE), assigned on submission |
| `CaseAttachmentDto` | `exitNumber` | `RS/{unitCode}/{year}/{seq6}` | `RS/URB/2026/000001` | Exit registry number (NRS), assigned to system-generated documents |
| `CaseAttachmentDto` | `generated` | boolean | `true` | Whether the document was auto-generated by the system (summary, notifications) |
| `AdminCaseDetail` | `entryNumber` | `RE/{unitCode}/{year}/{seq6}` | `RE/URB/2026/000001` | Entry registry number for backoffice view |

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
