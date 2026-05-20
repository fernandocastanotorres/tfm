# ADR-0008: Framework Version Selection — LTS Strategy

**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Post-Docker infrastructure setup, pre-production hardening

## Problem

The project was running on end-of-life framework versions:

| Component | Version | EOL Date | Risk |
|---|---|---|---|
| Angular | 16.2 (Nov 2023) | Nov 2024 | No security patches |
| TypeScript | 5.1.3 | — | Missing bug fixes |
| Spring Boot | 3.2.5 (May 2024) | May 2025 | No CVE patches |
| zone.js | 0.13.0 | — | Compatibility gaps |

For an e-government platform handling citizen data, running EOL frameworks is unacceptable under ENS Medium Level requirements (security patch management).

## Decision

Upgrade to **LTS (Long Term Support)** versions only, skipping non-LTS releases:

| Component | From | To | LTS End | Rationale |
|---|---|---|---|---|
| **Angular** | 16.2 | **18.x LTS** | Nov 2026 | Last LTS with full support; Angular 19/20 are non-LTS with 6-month cycles |
| **TypeScript** | 5.1.3 | **5.5.x** | — | Angular 18's tested version; stable, no breaking changes from 5.1 |
| **zone.js** | 0.13.0 | **0.14.x** | — | Angular 18's peer dependency |
| **Spring Boot** | 3.2.5 | **3.4.x** | Nov 2026 | Actively supported; compatible with Java 17; 3.3 is also LTS but 3.4 has critical security fixes |
| **Java** | 17 | **17** (kept) | Sep 2029 | Already LTS; no migration needed |

## Why Not Angular 19 or 20?

Angular shifted to a **6-month release cadence** starting with v19. Only even-numbered versions (18, 20, 22...) receive LTS treatment:

- **Angular 18 LTS**: Support until Nov 2026 — sufficient for TFG delivery and defense
- **Angular 20 LTS**: Released May 2025, support until Nov 2027 — requires breaking changes:
  - `*ngIf`/`*ngFor` → `@if`/`@for` (control flow)
  - ESBuild/Vite builder (replaces Webpack)
  - Signal-based forms and inputs become default
  - Migration risk: ~30 components, 50+ templates

The cost of jumping to v20 outweighs the benefit for a TFG with a fixed delivery timeline.

## Why Not Spring Boot 3.5?

Spring Boot 3.5 was released in May 2026 but:

- 3.4.x is the current **stable LTS** with active CVE patches
- 3.5 introduces breaking changes in auto-configuration and actuator endpoints
- Our test suite (536 tests) passes cleanly on 3.4.5
- 3.4 support extends to Nov 2026 — aligned with Angular 18 LTS

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Stay on current versions | Zero migration effort | EOL, security vulnerabilities, fails ENS audit | **Rejected** |
| Jump to Angular 20 + Spring Boot 3.5 | Latest features, longest support | High migration risk, 2-3 weeks of work, breaking changes in 30+ components | **Deferred** (post-TFG) |
| Jump to Angular 18 + Spring Boot 3.5 | Partial upgrade | Version mismatch risk, untested combination | **Rejected** |
| Angular 18 LTS + Spring Boot 3.4 LTS | Both LTS, aligned support window, manageable migration | Requires sequential Angular upgrade (16→17→18) | **Selected** |

## Consequences

### Positive
- All frameworks receive active security patches until at least Nov 2026
- ENS Medium Level compliance for patch management requirement
- CI/CD pipeline can enforce version pins
- Docker images use pinned base tags (no `latest`)

### Negative
- Angular upgrade required sequential migration (16→17→18), not direct
- Some deprecation warnings in Angular 18 (to be addressed in v20 migration)
- springdoc-openapi version bump (2.5.0 → 2.8.8) required

### Migration Notes
- Angular 16→17→18 was done via `ng update` with zero code changes (migrations were automatic)
- All 643 front-end tests pass on Angular 18
- All 51 back-office tests pass on Angular 18
- All 536 backend tests pass on Spring Boot 3.4.5

## References

- [Angular LTS Schedule](https://angular.dev/reference/releases/supported-versions)
- [Spring Boot Supported Versions](https://spring.io/projects/spring-boot#support)
- [ENS Medium Level Requirements — Patch Management](https://www.ccn-cert.cni.es/es/guias/acceso-a-guias-y-procedimientos/1168-ccn-stic-832.html)
