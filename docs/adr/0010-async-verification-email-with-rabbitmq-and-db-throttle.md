# ADR-0010: Async Verification Email Delivery with RabbitMQ and DB-Backed Resend Throttle

## Status
Accepted

## Date
2026-05-17

## Context
Email verification became part of citizen registration lifecycle. Sending verification emails synchronously from the request path increases API latency and makes registration reliability depend directly on SMTP availability. Additionally, resend throttling in memory is not safe in multi-instance deployments.

## Decision
1. Use a **producer-consumer model with RabbitMQ** for verification email delivery **when `mailing.queue.enabled=true`**.
2. **Default mode is direct-send** (`mailing.queue.enabled=false`) for local development and self-contained deployments (docker-compose does not include RabbitMQ).
3. Keep a **configurable direct-send fallback** (`mailing.queue.enabled=false`) for local development and degraded scenarios.
4. Persist resend throttle timestamp in **`users.last_verification_email_sent_at`** and enforce cooldown at application level.
5. Expose delivery outcome via **Micrometer metrics** (`records_mail_delivery_total{type,status}`).

## Rationale
- Queue decouples user-facing registration from SMTP volatility.
- DB-backed throttle guarantees consistent behavior across replicas.
- Metrics provide operational visibility and alerting hooks.
- Configurable fallback simplifies local development and incident mitigation.

## Consequences
### Positive
- Lower registration endpoint sensitivity to SMTP slowness/outages.
- Safer resend controls in clustered environments.
- Better observability for delivery success/failure rates.

### Negative
- Introduces broker dependency and queue operations overhead.
- Requires additional configuration management (RabbitMQ, retry settings).
- Potential delay between registration and actual email delivery.

## Implementation Notes
- Migration: `backend/db/postgresql/003_add_resend_verification_throttle.sql`
- Producer: `backend/src/main/java/es/tfg/records/infrastructure/mailing/QueuedEmailGateway.java`
- Consumer: `backend/src/main/java/es/tfg/records/infrastructure/mailing/VerificationEmailConsumer.java`
- Queue config: `backend/src/main/java/es/tfg/records/infrastructure/config/MailQueueConfig.java`
- Runtime config: `backend/src/main/resources/application.yml`, `backend/src/main/resources/application-dev.yml`

## Revisit Criteria
Reevaluate if:
- delivery throughput or failure patterns require dead-letter queues and replay tooling,
- additional mail types require routing separation or priority queues,
- operational requirements demand exactly-once semantics or external notification providers.
