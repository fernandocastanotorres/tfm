# Authorization Test Cases (RBAC + Ownership)

This document defines security test scenarios derived from `AUTHORIZATION_MATRIX.md`.

## 1) Test Scope

Validate:
- Role-based access (allow/deny)
- Ownership-based access for citizen resources
- State-based constraints (e.g., amendment flow)
- Audit event generation for sensitive allow/deny decisions

## 2) Common Test Setup

Prepare test identities:
- `citizenA` with `ROLE_CITIZEN`
- `citizenB` with `ROLE_CITIZEN`
- `processor1` with `ROLE_TRAMITADOR`
- `admin1` with `ROLE_ADMIN`

Prepare resources:
- `procedureA` owned by `citizenA`
- `procedureB` owned by `citizenB`
- documents linked to each procedure
- backoffice tasks generated from process instances

## 3) Role Access Test Matrix

| ID | Endpoint | Method | Actor | Expected |
|---|---|---|---|---|
| RBAC-001 | `/api/v1/citizen/procedures` | POST | citizenA | 2xx ALLOW |
| RBAC-002 | `/api/v1/citizen/procedures` | POST | processor1 | 403 DENY |
| RBAC-003 | `/api/v1/backoffice/tasks` | GET | citizenA | 403 DENY |
| RBAC-004 | `/api/v1/backoffice/tasks` | GET | processor1 | 2xx ALLOW |
| RBAC-005 | `/api/v1/admin/users` | GET | processor1 | 403 DENY |
| RBAC-006 | `/api/v1/admin/users` | GET | admin1 | 2xx ALLOW |
| RBAC-007 | `/api/v1/admin/bpmn/deployments` | POST | admin1 | 2xx ALLOW |
| RBAC-008 | `/api/v1/admin/bpmn/deployments` | POST | processor1 | 403 DENY |

## 4) Ownership Tests (Citizen)

| ID | Endpoint | Method | Actor | Resource | Expected |
|---|---|---|---|---|---|
| OWN-001 | `/api/v1/citizen/procedures/{procedureUuid}` | GET | citizenA | procedureA | 2xx ALLOW |
| OWN-002 | `/api/v1/citizen/procedures/{procedureUuid}` | GET | citizenA | procedureB | 403 DENY |
| OWN-003 | `/api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid}` | GET | citizenA | doc of procedureA | 2xx ALLOW |
| OWN-004 | `/api/v1/citizen/procedures/{procedureUuid}/documents/{docUuid}` | GET | citizenA | doc of procedureB | 403 DENY |

## 5) State-Dependent Authorization Tests

| ID | Endpoint | Method | Preconditions | Actor | Expected |
|---|---|---|---|---|---|
| ST-001 | `/api/v1/citizen/procedures/{procedureUuid}/amend` | POST | procedure state = `AMENDMENT_REQUIRED` | citizenA (owner) | 2xx ALLOW |
| ST-002 | `/api/v1/citizen/procedures/{procedureUuid}/amend` | POST | procedure state != `AMENDMENT_REQUIRED` | citizenA (owner) | 409/403 DENY |
| ST-003 | `/api/v1/backoffice/tasks/{taskId}/complete` | POST | task is claimable/assigned to actor | processor1 | 2xx ALLOW |
| ST-004 | `/api/v1/backoffice/tasks/{taskId}/complete` | POST | task assigned to other processor | processor1 | 403 DENY |

## 6) Authentication/Token Tests

| ID | Scenario | Expected |
|---|---|---|
| AUTH-001 | Missing JWT on protected endpoint | 401 |
| AUTH-002 | Expired JWT | 401 |
| AUTH-003 | Invalid signature JWT | 401 |
| AUTH-004 | Valid JWT without required role | 403 |

## 7) Audit Verification Tests

For each selected allow/deny case, verify audit record contains:
- `timestamp`
- `user_id`
- `role_set`
- `action`
- `resource_uuid`
- `decision` (`ALLOW`/`DENY`)
- `reason_code`
- `client_ip`
- `app_context`

Mandatory cases:
- AUD-001: denied by missing role (`ROLE_MISSING`)
- AUD-002: denied by ownership (`NOT_OWNER`)
- AUD-003: denied by invalid state (`STATE_INVALID`)
- AUD-004: granted sensitive action (signature/enidoc generation)

## 8) Non-Functional Security Cases

- SEC-001: brute-force login protection/rate-limit behavior
- SEC-002: token replay attempt handling
- SEC-003: horizontal privilege escalation attempt
- SEC-004: ensure no sensitive info leakage in 401/403 responses

## 9) CI Quality Gate Recommendation

Minimum gate for merge:
1. All critical RBAC tests pass
2. Ownership deny-path tests pass
3. Audit verification tests pass for deny + sensitive allow cases

Recommended grouping:
- Fast suite: AUTH + RBAC core
- Full suite: ownership + state + audit + abuse scenarios
