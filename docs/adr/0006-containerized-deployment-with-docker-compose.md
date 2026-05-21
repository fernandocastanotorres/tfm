# ADR-0006: Standardize Deployment with Docker Compose and Isolated Service Network

## Status
Accepted

## Date
2026-05-13

## Context
The platform requires repeatable multi-service deployment for API, DB, email, office conversion, and two frontends, with explicit internal networking and persistent storage.

## Decision
Use Docker + Docker Compose as the default deployment topology in development/integration environments, with:
- Multi-stage Dockerfiles per module
- Private bridge network for internal service communication
- Persistent external volumes for PostgreSQL and document storage

## Rationale
- Reproducible environments reduce integration drift.
- Clear service boundaries support operational security and observability.
- Aligns with the project’s module decomposition and dependency graph.

## Consequences
### Positive
- Faster onboarding and consistent local/integration execution.
- Controlled network exposure and explicit infrastructure topology.
- Better support for compliance testing scenarios (audit, traceability, interoperability).

### Negative
- Requires container lifecycle and volume management discipline.
- Compose is not a full production orchestrator by itself.

## Alternatives Considered
- Host-native/manual deployments: rejected due to poor reproducibility and higher configuration drift risk.
