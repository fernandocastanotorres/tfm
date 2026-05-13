# API Error Model

This document defines the canonical error response format for the Core Backend API.

It complements:
- `docs/api/API_CONTRACT.md`
- `docs/security/AUTHORIZATION_MATRIX.md`
- `docs/security/AUDIT_EVENT_CATALOG.md`

## 1) Canonical Error Payload

All error responses MUST use this JSON shape:

```json
{
  "timestamp": "2026-05-13T14:25:00Z",
  "status": 403,
  "code": "AUTH-403-ROLE_MISSING",
  "message": "Access denied for requested resource",
  "path": "/api/v1/backoffice/tasks",
  "correlationId": "7c4b2c4f-1b8f-4f2e-9092-3f4a22f6ecaf",
  "details": [
    {
      "field": "role",
      "issue": "Required role ROLE_TRAMITADOR"
    }
  ]
}
```

## 2) Field Definitions

- `timestamp`: UTC ISO-8601 instant when error was produced.
- `status`: HTTP status code.
- `code`: stable machine-readable application error code.
- `message`: safe human-readable summary (no sensitive internals).
- `path`: request path.
- `correlationId`: request trace ID shared across logs/audit.
- `details` (optional): list of structured issue entries (validation or domain context).

## 3) HTTP Status Mapping

| Status | Use Case |
|---|---|
| 400 | Malformed request, invalid syntax, missing required fields |
| 401 | Authentication missing/invalid/expired |
| 403 | Authenticated but forbidden (role/ownership/policy) |
| 404 | Resource not found |
| 409 | State conflict (invalid workflow transition, duplicate-sensitive action) |
| 422 | Semantically invalid request (optional policy) |
| 429 | Rate limit exceeded |
| 500 | Unhandled server error |
| 503 | Dependency/service temporarily unavailable |

## 4) Error Code Convention

Pattern:

`<DOMAIN>-<HTTP_STATUS>-<REASON>`

Examples:
- `AUTH-401-TOKEN_EXPIRED`
- `AUTH-403-ROLE_MISSING`
- `PROC-403-NOT_OWNER`
- `PROC-409-STATE_INVALID`
- `DOC-503-DEPENDENCY_UNAVAILABLE`
- `SYS-500-INTERNAL_ERROR`

Domains (recommended):
- `AUTH` authentication/authorization
- `PROC` procedure/workflow
- `DOC` document/signature/conversion
- `ENI` interoperability/validation
- `ADM` administration
- `SYS` system-level failures

## 5) Validation Error Details

For `400`/`422`, include `details` entries where possible:

```json
{
  "field": "documents[0].mimeType",
  "issue": "Unsupported MIME type"
}
```

Rules:
- Include all relevant field violations in one response when feasible.
- Avoid leaking internal class names/stack traces.

## 6) Security Error Behavior

- `401` responses should not reveal whether username/user exists.
- `403` responses should be generic to callers; detailed reasons belong in audit logs.
- Never include tokens, secrets, keys, or stack traces in `message` or `details`.

## 7) Correlation and Audit Alignment

1. Every error must include `correlationId`.
2. Authorization-related errors (`401`/`403`) must map to audit events with matching correlation ID.
3. `code` should be consistent with audit `reason_code` semantics.

## 8) Localization Policy

- API `code` is language-neutral and stable.
- `message` can remain English by default for integrator consistency.
- If localization is required later, keep `code` unchanged and localize only `message`.

## 9) Example Responses

### 9.1 Authentication Error (401)

```json
{
  "timestamp": "2026-05-13T14:30:00Z",
  "status": 401,
  "code": "AUTH-401-TOKEN_INVALID",
  "message": "Authentication required",
  "path": "/api/v1/backoffice/tasks",
  "correlationId": "c6c0e8c1-2e30-4f58-8f85-9126a0897b8d"
}
```

### 9.2 Ownership Error (403)

```json
{
  "timestamp": "2026-05-13T14:31:00Z",
  "status": 403,
  "code": "PROC-403-NOT_OWNER",
  "message": "Access denied for requested resource",
  "path": "/api/v1/citizen/procedures/2f7e90ad-486b-4d45-8297-37fc0b04fb33",
  "correlationId": "f4b6c257-f9ad-43f6-8f18-b59330db6d9f"
}
```

### 9.3 State Conflict (409)

```json
{
  "timestamp": "2026-05-13T14:32:00Z",
  "status": 409,
  "code": "PROC-409-STATE_INVALID",
  "message": "Operation is not allowed in current procedure state",
  "path": "/api/v1/citizen/procedures/2f7e90ad-486b-4d45-8297-37fc0b04fb33/amend",
  "correlationId": "6ff412d5-3b5a-4b65-a95c-3a78bca76ba8"
}
```

## 10) Change Management

When introducing new error codes/statuses:

1. Update this document.
2. Add/adjust integration tests for response shape and code mapping.
3. Ensure audit catalog mappings remain consistent for auth/policy failures.
