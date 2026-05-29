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
| **D.2.1 — Password Policy** | ✅ Implemented | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |
| **D.2.2 — Account Lockout** | ✅ Implemented | 5 failed attempts → 15 min lockout per email. 1s cooldown between failed logins per email. |
| **D.2.3 — Session Management** | ✅ Implemented | Stateless JWT, 15-min access tokens, refresh rotation |
| **D.2.4 — Security Headers** | ✅ Implemented | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc. |
| **D.2.5 — Rate Limiting** | ✅ Implemented | 10 req/min per IP on auth endpoints. 5 OTP attempts per email (~5 min window). 60s forgot-password cooldown per email. |
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
| Lowercase | At least 1 lowercase letter |
| Uppercase | At least 1 uppercase letter |
| Numbers | At least 1 digit |
| Special character | At least 1 special character (`!@#$%^&*()_+-=[]{};':"\\|,.<>/?`) |
| Hashing | BCrypt, strength 12 |
| Validation | Server-side with detailed error messages |

---

## 5. Account Protection

### 5.1 Account Lockout

| Parameter | Value |
|-----------|-------|
| Max failed attempts | 5 |
| Lockout duration | 15 minutes |
| Attempt window | 15 minutes (sliding) |
| Auto-unlock | Yes, after lockout period expires |
| Reset on success | Yes, counter cleared on successful login |

Error messages inform users of remaining attempts and lockout status without revealing whether the email exists.

### 5.2 Login Cooldown

After each failed login attempt, a 1-second cooldown is enforced per email. This prevents rapid-fire brute-force attacks using rotating IPs against a single account, complementing the IP-level rate limiting and account lockout.

### 5.3 Forgot Password Cooldown

Password reset emails are rate-limited to one per email per 60 seconds. The server silently returns success even when the cooldown is active (no observable difference to the client) to prevent email enumeration.

### 5.4 OTP Rate Limiting

OTP verification is limited to 5 failed attempts per email within a ~5-minute sliding window. The counter resets on successful verification. This prevents OTP brute-force attacks via email enumeration or distributed guessing.

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

### 7.1 IP-Based (RateLimitFilter)

| Parameter | Value |
|-----------|-------|
| Max requests | 10 per window (auth) / 20 per window (admin) |
| Window size | 60 seconds |
| Scope | Per IP address |
| Affected endpoints | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/refresh`, `/auth/verify-otp`, `/auth/resend-verification`, `/auth/verify-email` |
| Response | HTTP 429 with JSON error body |

### 7.2 Per-Email Rate Limiting (AuthServiceImpl)

| Rule | Limit | Scope | Cleanup |
|------|-------|-------|---------|
| Login cooldown | 1s between failed attempts | Per email | Removed on success |
| Forgot password | 1 email per 60s | Per email | In-memory (automatic expiry) |
| OTP verification | 5 attempts per ~5min window | Per email | Scheduled cleanup every 5 min |

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

## 10. OWASP Top 10 (2021) Compliance

The following table documents controls implemented to address each OWASP Top 10 category.

| OWASP Category | Status | Controls Implemented |
|----------------|--------|----------------------|
| **A01: Broken Access Control** | ✅ Implemented | Role-based access via URL matchers (`SecurityConfig.java`). `@PreAuthorize` on sensitive operations. Ownership verification in `CaseService.findAndVerifyOwnership()` and `MessageService.verifyCitizenProcedureAccess()`. Service-layer verification for citizen-owned resources (procedure, document, message, attachment). Admin endpoints scoped to `ROLE_TRAMITADOR`/`ROLE_ADMIN`. Horizontal isolation pending organizational unit scoping. |
| **A02: Cryptographic Failures** | ✅ Implemented | Passwords hashed with BCrypt (strength 12). JWT signed with HMAC-SHA256 (512-bit key minimum). TLS termination at reverse proxy with HSTS. `@PostConstruct` validation rejects weak keystore passwords. No hardcoded secrets in production configuration — all secrets via environment variables. |
| **A03: Injection** | ✅ Implemented | SQL injection prevented by JPA/Hibernate parameterized queries (no raw SQL). No `Runtime.exec()` or `ProcessBuilder` usage. XSS prevented by Angular's built-in sanitization (no `bypassSecurityTrust*` usage in frontend, no `innerHTML`). Log injection mitigated by SLF4J parameterized logging (no string concatenation in log calls). XXE defense via `FEATURE_SECURE_PROCESSING` in XML validation. Bean Validation (`@Valid`) on all request DTOs. |
| **A04: Insecure Design** | ✅ Implemented | Hexagonal architecture with clear domain boundaries. Rate limiting on auth endpoints (10 req/min/IP). Account lockout after 5 failed attempts (15 min). OTP with 24h expiry. Password reset tokens with 1h expiry. Email verification required before login. |
| **A05: Security Misconfiguration** | ✅ Implemented | CORS externalized via `app.cors.allowed-origins` configuration property. CSP with `default-src 'self'`. HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff. H2 console disabled outside dev profile. Actuator endpoints require authentication. No debug details in production error responses. |
| **A06: Vulnerable Components** | ⚠️ Monitored | Dependencies managed via Maven (`pom.xml`) and npm (`package.json`). `npm audit` and `mvn dependency-check` available. No known vulnerable versions at time of audit. SCA recommended as CI pipeline addition. |
| **A07: Authentication Failures** | ✅ Implemented | JWT with 15-min access tokens and 7-day rotatable refresh tokens. BCrypt password hashing (strength 12). Password policy: min 8 chars, lowercase, uppercase, digit, special char. Account lockout (5 attempts → 15 min lockout). OTP verification for sensitive operations. Refresh token rotation with server-side invalidation. |
| **A08: Data Integrity Failures** | ✅ Implemented | CMS/PKCS#7 detached signatures for document integrity. Immutable audit log (`AuditLogEntity`). JPA optimistic locking. Signed JWTs prevent tampering. Pipeline uses `npm ci` (deterministic installs). |
| **A09: Security Logging & Monitoring** | ✅ Implemented | Structured JSON logging with correlation IDs (`X-Correlation-Id`). Comprehensive audit events for all sensitive actions (login, logout, create, update, delete, sign, lockout, rate-limit). Loki + Grafana observability stack. Prometheus metrics for operational monitoring. |
| **A10: SSRF** | ✅ Not Applicable | No user-driven URL fetching. No `RestTemplate`/`WebClient` usage based on user input. All URL constructions use configuration-driven base URLs. |

### 10.1 Residual Risks

| Risk | Category | Mitigation |
|------|----------|------------|
| JWT stored in `sessionStorage` (frontend) | A07 | XSS-protected by Angular sanitization. `sessionStorage` auto-clears on tab close. `httpOnly` cookies require backend auth refactor. |
| CSP `script-src 'unsafe-inline'` | A05 | Required for Angular zone.js. Mitigated by AOT builds in production. Recommend migrating to nonce-based CSP in future. |
| In-memory rate limiting (non-persistent) | A04 | Acceptable for single-instance deployment. Redis-based distributed rate limiting recommended for horizontal scaling. |

---

## 11. Known Limitations & Future Improvements

### 10.1 Current Limitations

1. **TLS/SSL**: Not configured at the application level. Must be handled by reverse proxy (Nginx, AWS ALB, etc.)
2. **Rate Limiting Storage**: In-memory `ConcurrentHashMap` — does not survive restarts and is not shared across instances. For production clusters, use Redis-based rate limiting. This applies to both IP-level (`RateLimitFilter`) and per-email rate limiting (`AuthServiceImpl`).
3. **Account Lockout Storage**: In-memory — same limitation as rate limiting. Consider persisting to database for multi-instance deployments.
4. **Password Expiration**: Not implemented. ENS Medium recommends periodic password changes.
5. **Audit Log Retention**: No automated retention policy or archival. Consider implementing log rotation and archival per ENS requirements.
6. **CSRF**: Disabled due to stateless JWT. This is acceptable for API-only backends but should be reviewed if cookies are used.
7. **Input Sanitization**: Basic validation via Bean Validation. Additional sanitization for rich text/markdown fields may be needed.

### 10.2 Recommended Improvements

- [ ] Add Redis for distributed rate limiting and lockout tracking
- [x] Add per-email OTP rate limiting (5 attempts per ~5 min window)
- [x] Add per-email login cooldown (1s between failed attempts)
- [x] Add per-email forgot-password cooldown (60s)
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
