# ADR-0014: Local Email Delivery with Mailpit over Brevo

**Date:** 2026-05-20  
**Status:** Accepted  
**Supersedes:** Runtime email provider assumption of Brevo/SendGrid in project docs

## Context

The project needs transactional email for:

- Account verification (`/auth/register`, `/auth/resend-verification`, `/auth/verify-email`)
- Password recovery notifications
- Case messaging notifications

For TFG scope, the platform is run mostly in local and containerized environments, often without external credentials and without guaranteed internet access.

Using external providers (Brevo/SendGrid) introduces non-functional friction for the project scope:

- API key management and secret distribution
- External dependency and internet requirement
- Operational variability during demos and tests
- Harder deterministic integration testing

## Decision

Adopt **SMTP-based local delivery with Mailpit** as the default runtime for development and project validation.

- Backend sends emails via `JavaMailSender` over SMTP.
- Compose includes `mailpit` service (`1025` SMTP, `8025` web UI).
- Email inspection is done in local UI (`http://localhost:8025`).
- External provider integration is deferred and treated as optional future production hardening.

## Rationale

Mailpit is the best fit for TFG scope because it optimizes for **reproducibility, simplicity, and zero external coupling**:

1. **Deterministic local testing**
   - Verification emails can be asserted end-to-end without third-party latency.

2. **No secret management burden**
   - No API keys are required for normal local runs.

3. **Lower operational risk in demos**
   - The full flow works offline within Docker network.

4. **Architecture alignment**
   - Keeps outbound email behind an internal gateway abstraction and standard SMTP configuration.

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Brevo API | Production-grade delivery, analytics | Requires API key, external dependency, more setup | Rejected for current scope |
| SendGrid API | Production-grade delivery, ecosystem support | Same constraints as Brevo | Rejected for current scope |
| Local SMTP sink (Mailpit) | Zero external dependencies, easy local inspection, reproducible | Not a real internet delivery service | Selected |

## Consequences

### Positive

- Faster onboarding and fewer environment failures.
- Repeatable CI/local smoke validation for email flows.
- Better traceability of sent messages during testing.

### Negative

- No real-world deliverability guarantees.
- No provider features (reputation, bounce handling, advanced analytics).
- Production deployment still requires a provider decision later.

## Implementation Notes

- Compose service: `mailpit`
- SMTP env vars: `MAIL_HOST`, `MAIL_PORT`, `MAIL_SMTP_AUTH`, `MAIL_SMTP_STARTTLS`
- Runtime toggle remains available via `MAILING_ENABLED` and queue mode settings.

## Follow-up

- If production hardening is requested, create a new ADR to evaluate provider selection, secret management, and fallback strategy.
