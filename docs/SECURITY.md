# Security Architecture — ENS Medium Level Compliance

## Overview

This document describes the security architecture of the TFG Electronic Records Management Platform and its compliance status with the **Esquema Nacional de Seguridad (ENS)** at **Medium Level** (Real Decreto 311/2022).

---

## 1. Security Architecture

### 1.1 Authentication & Authorization

| Component | Implementation |
|-----------|---------------|
| Framework | Spring Security 6.x (stateless) |
| Token Format | JWT (RS256/HMAC-SHA256 via JJWT 0.12.5) |
| Password Hashing | BCrypt with strength 12 |
| Token Lifetime | Access: 15 min / Refresh: 7 days |
| Token Rotation | Yes — refresh tokens are single-use |
| Method Security | `@EnableMethodSecurity` for `@PreAuthorize` |

### 1.2 Filter Chain Order

```
CorrelationIdFilter → SecurityHeadersFilter → RateLimitFilter → JwtAuthenticationFilter → Spring Security
```

### 1.3 Roles

| Role | Description |
|------|-------------|
| `ROLE_CITIZEN` | End users who submit procedures |
| `ROLE_TRAMITADOR` | Backoffice staff who process cases |
| `ROLE_ADMIN` | System administrators |

---

## 2. ENS Medium Level Compliance Matrix

| ENS Requirement | Status | Implementation |
|----------------|--------|----------------|
| **D.1.1 — Identification & Authentication** | ✅ Implemented | JWT-based auth with BCrypt passwords |
| **D.1.2 — Access Control** | ✅ Implemented | Role-based access via Spring Security + `@PreAuthorize` |
| **D.1.3 — Audit & Traceability** | ✅ Implemented | `AuditLogEntity` with async event-driven logging |
| **D.1.4 — Data Integrity** | ✅ Implemented | JPA auditing, immutable audit records |
| **D.1.5 — Confidentiality** | ⚠️ Partial | TLS required at reverse proxy level (not in app) |
| **D.1.6 — Availability** | ⚠️ Partial | Rate limiting implemented; no HA config yet |
| **D.2.1 — Password Policy** | ✅ Implemented | Min 8 chars, 1 uppercase, 1 digit |
| **D.2.2 — Account Lockout** | ✅ Implemented | 5 failed attempts → 15 min lockout |
| **D.2.3 — Session Management** | ✅ Implemented | Stateless JWT, 15-min access tokens, refresh rotation |
| **D.2.4 — Security Headers** | ✅ Implemented | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc. |
| **D.2.5 — Rate Limiting** | ✅ Implemented | 10 req/min per IP on auth endpoints |
| **D.2.6 — Input Validation** | ✅ Implemented | Bean Validation on DTOs, password pattern validation |

---

## 3. JWT Configuration

### 3.1 Secret Management

- **Development**: Base64-encoded secret in `application-dev.yml`
- **Production**: `JWT_SECRET` environment variable (Base64-encoded, min 256 bits)
- **Validation**: Application throws `IllegalStateException` at startup if production profile is active with a weak/default secret

### 3.2 Token Structure

**Access Token Claims:**
```json
{
  "sub": "user-uuid",
  "iss": "records-api",
  "iat": 1234567890,
  "exp": 1234568790,
  "email": "user@example.com",
  "roles": ["ROLE_CITIZEN"],
  "type": "access"
}
```

**Refresh Token Claims:**
```json
{
  "sub": "user-uuid",
  "iss": "records-api",
  "iat": 1234567890,
  "exp": 1235167890,
  "email": "user@example.com",
  "type": "refresh"
}
```

---

## 4. Password Policy

| Rule | Requirement |
|------|-------------|
| Minimum length | 8 characters |
| Uppercase | At least 1 uppercase letter |
| Numbers | At least 1 digit |
| Hashing | BCrypt, strength 12 |
| Validation | Server-side with detailed error messages |

---

## 5. Account Lockout

| Parameter | Value |
|-----------|-------|
| Max failed attempts | 5 |
| Lockout duration | 15 minutes |
| Attempt window | 15 minutes (sliding) |
| Auto-unlock | Yes, after lockout period expires |
| Reset on success | Yes, counter cleared on successful login |

Error messages inform users of remaining attempts and lockout status without revealing whether the email exists.

---

## 6. Audit Logging

### 6.1 Architecture

Event-driven async pipeline:
```
Controller/Service → AuditService → ApplicationEvent → AuditEventListener (async) → Database
```

### 6.2 Audit Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique event identifier |
| `timestamp` | Instant | When the event occurred |
| `userId` | String (nullable) | User who performed the action |
| `action` | Enum | LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, SIGN, LOCKOUT, RATE_LIMITED |
| `resourceType` | String | PROCEDURE, DOCUMENT, USER, CASE, etc. |
| `resourceUuid` | UUID (nullable) | Specific resource identifier |
| `clientIp` | String | Client IP (supports X-Forwarded-For) |
| `appContext` | String | CITIZEN, BACKOFFICE, API |
| `result` | Enum | SUCCESS, FAILURE |
| `details` | String (nullable) | Additional context |

### 6.3 Automatic Audit Events

The following actions are automatically logged:
- Login (success/failure/lockout)
- Logout
- User registration
- Account verification
- Password reset
- Profile updates
- Token refresh

---

## 7. Rate Limiting

| Parameter | Value |
|-----------|-------|
| Max requests | 10 per window |
| Window size | 60 seconds |
| Scope | Per IP address |
| Affected endpoints | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/refresh` |
| Response | HTTP 429 with JSON error body |

---

## 8. Security Headers

All responses include:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `0` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; ...` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

---

## 9. Profile-Based Feature Gating

| Feature | dev | h2 | prod (default) |
|---------|-----|-----|----------------|
| H2 Console | ✅ (via h2 profile) | ✅ | ❌ |
| Swagger/OpenAPI | ✅ | ❌ | ❌ |
| Debug Logging | ✅ | ❌ | ❌ |
| SQL Logging | ✅ | ❌ | ❌ |

---

## 10. Known Limitations & Future Improvements

### 10.1 Current Limitations

1. **TLS/SSL**: Not configured at the application level. Must be handled by reverse proxy (Nginx, AWS ALB, etc.)
2. **Rate Limiting Storage**: In-memory `ConcurrentHashMap` — does not survive restarts and is not shared across instances. For production clusters, use Redis-based rate limiting.
3. **Account Lockout Storage**: In-memory — same limitation as rate limiting. Consider persisting to database for multi-instance deployments.
4. **Password Expiration**: Not implemented. ENS Medium recommends periodic password changes.
5. **Audit Log Retention**: No automated retention policy or archival. Consider implementing log rotation and archival per ENS requirements.
6. **CSRF**: Disabled due to stateless JWT. This is acceptable for API-only backends but should be reviewed if cookies are used.
7. **Input Sanitization**: Basic validation via Bean Validation. Additional sanitization for rich text/markdown fields may be needed.

### 10.2 Recommended Improvements

- [ ] Add Redis for distributed rate limiting and lockout tracking
- [ ] Implement password expiration policy (90-day rotation)
- [ ] Add audit log archival and retention policies
- [ ] Configure TLS at reverse proxy with HSTS preloading
- [ ] Add Content-Security-Policy reporting endpoint
- [ ] Implement API key authentication for service-to-service calls
- [ ] Add request body size limits per endpoint
- [ ] Implement security event alerting (e.g., multiple lockouts from same IP)
- [ ] Add automated dependency vulnerability scanning (Dependabot, Snyk)
- [ ] Implement database encryption at rest for sensitive fields

---

## 11. Incident Response

In case of a security incident:

1. Check `security_audit_log` table for suspicious activity patterns
2. Query by `client_ip` to identify potential attack sources
3. Query by `action = 'LOCKOUT'` to find brute-force attempts
4. Query by `result = 'FAILURE'` to find authentication anomalies
5. Review rate limit logs for DDoS patterns

Example queries:
```sql
-- Failed logins in last 24 hours
SELECT user_id, client_ip, COUNT(*) as failures
FROM security_audit_log
WHERE action = 'LOGIN' AND result = 'FAILURE'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY user_id, client_ip
ORDER BY failures DESC;

-- Lockout events
SELECT * FROM security_audit_log
WHERE action = 'LOCKOUT'
ORDER BY timestamp DESC;
```
