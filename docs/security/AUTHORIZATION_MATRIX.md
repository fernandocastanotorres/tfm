# Authorization Matrix (JWT/RBAC)

This document defines endpoint-level authorization for the three primary roles:

- `ROLE_CITIZEN`
- `ROLE_TRAMITADOR`
- `ROLE_ADMIN`

It complements `REQUIREMENTS.md`, ADR-0003 (security stack), and boundary rules.

## 1) General Access Rules

1. **Default deny**: any endpoint not explicitly allowed is denied.
2. **Least privilege**: grant only the minimum role scope needed.
3. **Ownership enforcement**: citizen access is limited to owned procedures/documents unless explicitly public.
4. **Admin is not anonymous**: `ROLE_ADMIN` still requires authentication and audit.
5. **Sensitive actions require audit**: all write/update/approve/sign/export actions must generate audit events.

## 2) Endpoint Authorization Matrix

> Notes:
> - Paths are canonical and may evolve with versioning (`/api/v1/...`).
> - `Own resource` means resource ownership must be verified in backend authorization logic.

| Domain | Endpoint | Method | ROLE_CITIZEN | ROLE_TRAMITADOR | ROLE_ADMIN | Constraints |
|---|---|---|---:|---:|---:|---|
| Auth | `/api/v1/auth/login` | POST | ✅ | ✅ | ✅ | Public endpoint for credential exchange; rate-limited |
| Auth | `/api/v1/auth/refresh` | POST | ✅ | ✅ | ✅ | Requires valid refresh token |
| Auth | `/api/v1/auth/logout` | POST | ✅ | ✅ | ✅ | Authenticated session/token required |
| Citizen Procedures | `/api/v1/citizen/procedures` | POST | ✅ | ❌ | ✅ | Create new citizen procedure |
| Citizen Procedures | `/api/v1/citizen/procedures` | GET | ✅ | ❌ | ✅ | List own procedures |
| Citizen Procedures | `/api/v1/citizen/procedures/{procedureUuid}` | GET | ✅ | ❌ | ✅ | Citizen: own resource only |
| Citizen Procedures | `/api/v1/citizen/procedures/{procedureUuid}/status` | GET | ✅ | ❌ | ✅ | Citizen: own resource only |
| Citizen Procedures | `/api/v1/citizen/procedures/{procedureUuid}/submit` | POST | ✅ | ❌ | ✅ | Citizen: own draft only |
| Citizen Procedures | `/api/v1/citizen/procedures/{procedureUuid}/amend` | POST | ✅ | ❌ | ✅ | Allowed only when procedure is in amendment state |
| Citizen Documents | `/api/v1/citizen/procedures/{procedureUuid}/documents` | POST | ✅ | ❌ | ✅ | Citizen: own resource only |
| Citizen Documents | `/api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid}` | GET | ✅ | ❌ | ✅ | Citizen: own resource only |
| Public Catalog | `/api/v1/citizen/procedures/catalog` | GET | ✅ | ✅ | ✅ | Public endpoint, no auth required |
| Public Catalog | `/api/v1/citizen/procedures/catalog/{identifier}` | GET | ✅ | ✅ | ✅ | Public endpoint, supports UUID or slug identifier |
| Public Catalog | `/api/v1/citizen/procedures/catalog/{identifier}/form-schema` | GET | ✅ | ✅ | ✅ | Public read-only schema |
| Public Catalog | `/api/v1/citizen/procedures/catalog/{identifier}/tasks/{taskId}/schema` | GET | ✅ | ✅ | ✅ | Public read-only schema |
| Backoffice Dashboard | `/api/v1/admin/dashboard/stats` | GET | ❌ | ✅ | ✅ | Internal dashboard |
| Backoffice Queue | `/api/v1/admin/tasks/pending` | GET | ❌ | ✅ | ✅ | Pending queue |
| Backoffice Cases | `/api/v1/admin/cases` | GET | ❌ | ✅ | ✅ | Case list |
| Backoffice Cases | `/api/v1/admin/cases/{caseId}` | GET | ❌ | ✅ | ✅ | Case detail |
| Backoffice Cases | `/api/v1/admin/cases/{caseId}/status` | PATCH | ❌ | ✅ | ✅ | Status updates |
| Backoffice Cases | `/api/v1/admin/cases/{caseId}/tasks/resolve` | POST | ❌ | ✅ | ✅ | Task resolution |
| Admin Users | `/api/v1/admin/users` | GET | ❌ | ❌ | ✅ | User management scope |
| Admin Users | `/api/v1/admin/users` | POST | ❌ | ❌ | ✅ | Create user/assign roles |
| Admin Users | `/api/v1/admin/users/{userId}` | PUT | ❌ | ❌ | ✅ | Update user/roles |
| Admin Users | `/api/v1/admin/users/{userId}/status` | PATCH | ❌ | ❌ | ✅ | Activate/deactivate user |
| Admin Procedures | `/api/v1/admin/procedure-types` | GET | ❌ | ❌ | ✅ | List procedures |
| Admin Procedures | `/api/v1/admin/procedure-types` | POST | ❌ | ❌ | ✅ | Create procedure |
| Admin Procedures | `/api/v1/admin/procedure-types/{id}` | PUT | ❌ | ❌ | ✅ | Update procedure |
| Admin Procedures | `/api/v1/admin/procedure-types/{id}/status` | PATCH | ❌ | ❌ | ✅ | Update status |
| Admin Procedures | `/api/v1/admin/procedure-types/{id}/translations` | GET | ❌ | ❌ | ✅ | List persisted locale translations |
| Admin Procedures | `/api/v1/admin/procedure-types/{id}/translations` | PUT | ❌ | ❌ | ✅ | Upsert locale translation |
| Health | `/api/v1/health/live` | GET | ✅ | ✅ | ✅ | Liveness (sanitized payload) |
| Health | `/api/v1/health/ready` | GET | ❌ | ❌ | ✅ | Readiness details restricted |

## 3) Authorization Policy Notes

## 3.1 Ownership Policy (Citizen)
- Citizens can only access procedures and documents where `procedure.owner_id == authenticated_user_id`.
- Ownership checks are mandatory in service/use-case authorization, not only at controller level.

## 3.2 Task Processing Policy (Backoffice)
- `ROLE_TRAMITADOR` can only complete tasks assigned/claimable under configured queue policies.
- Sensitive transitions (approval, signature, finalization) require explicit permission checks and full audit logs.

## 3.3 Admin Policy
- `ROLE_ADMIN` handles platform administration, user/role management, BPM deployment, and audit exploration.
- Admin actions must be fully auditable and never exposed to public/citizen routes.

## 4) Mapping to Security Implementation

Recommended implementation layers:

1. **Route-level guards** (Spring Security config): coarse endpoint restrictions by role.
2. **Method/use-case authorization**: business and ownership constraints.
3. **Data-level filters**: prevent cross-tenant/cross-user leakage.

Do not rely on route guards alone for ownership-sensitive endpoints.

## 5) Audit Requirements for Authorization-Critical Actions

For every denied or sensitive granted action, record at least:

- `timestamp`
- `user_id`
- `role_set`
- `action`
- `resource_uuid`
- `decision` (`ALLOW` / `DENY`)
- `reason_code` (e.g., `ROLE_MISSING`, `NOT_OWNER`, `STATE_INVALID`)
- `client_ip`
- `app_context`

## 6) Change Management

When adding/changing endpoints:

1. Update this matrix in the same PR.
2. Update security tests for role and ownership scenarios.
3. If policy intent changes, add/update ADR references.
