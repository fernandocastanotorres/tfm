# ADR-0003: Use Spring Boot 3.x + Spring Security (JWT) + JPA + PostgreSQL

## Status
Accepted

## Date
2026-05-13

## Context
The backend must enforce ENS-oriented security controls, RBAC, immutable auditability, BPM orchestration, and robust persistence for records and metadata.

## Decision
The core API stack will be:
- Spring Boot 3.x
- Spring Security with JWT-based authentication/authorization
- Spring Data JPA for persistence
- PostgreSQL as primary relational database

## Rationale
- Spring Boot provides mature enterprise capabilities and excellent Java ecosystem integration.
- Spring Security supports strong RBAC and token-based access controls.
- JPA accelerates domain persistence and auditable entity lifecycle integration.
- PostgreSQL offers reliability, transactional integrity, and operational maturity.

## Consequences
### Positive
- Strong fit for compliance-heavy enterprise workflows.
- Broad community support and long-term maintainability.
- Clear integration path with BPM, signature, and DMS components.

### Negative
- Higher baseline complexity than minimalist stacks.
- Requires disciplined schema evolution and performance tuning for large workloads.

## Alternatives Considered
- Node.js/NestJS + ORM: rejected for this project due to lower alignment with the selected Java-centric BPM/signature ecosystem and compliance-oriented operational practices.
