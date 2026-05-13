# Coverage Scope Map

This document defines which code paths belong to:

1. **Domain Scope** -> must stay at **100% line coverage**
2. **Non-Domain Scope** -> must stay at **>= 80% line coverage**

It complements `TEST_STRATEGY.md` and exists to remove ambiguity in CI enforcement.

## 1) Scope Rules (Authoritative)

## 1.1 Domain Scope (100%)

Include:
- Domain entities
- Value objects
- Domain services
- Domain policies/rules
- Application use cases (command/query handlers with business behavior)

Exclude from domain scope:
- Controllers/REST entrypoints
- Framework configuration
- Infrastructure adapters
- Persistence implementation details
- UI code

## 1.2 Non-Domain Scope (>= 80%)

Include:
- API controllers and request/response mappers
- Security configuration and filters
- Repository/adapters/integration glue
- BPM, DMS, signature, conversion adapters
- Frontend code (components/services/state)

## 2) Recommended Path Mapping

Adjust to the final repository structure once scaffolding is created.

### 2.1 Core API (Spring Boot)

**Domain scope (100%)**
- `backend/**/domain/**`
- `backend/**/application/usecase/**`
- `backend/**/application/command/**`
- `backend/**/application/query/**`

**Non-domain scope (>= 80%)**
- `backend/**/entrypoints/**`
- `backend/**/infrastructure/**`
- `backend/**/config/**`
- `backend/**/security/**`

### 2.2 Frontends

**Non-domain scope (>= 80%)**
- `frontend-citizen/src/**`
- `backoffice-admin/src/**`

## 3) CI Enforcement Model

CI should compute and fail independently on both scopes:

1. **Domain coverage check**: fail if `< 100%`
2. **Non-domain coverage check**: fail if `< 80%`

Do not use only a global project percentage, as it can hide domain regressions.

## 4) Merge Policy

A PR is mergeable only when:
- Domain scope remains at 100%
- Non-domain scope remains >= 80%
- New/changed critical security/compliance paths include scenario tests

## 5) Handling New Paths

When adding new modules/packages:

1. Classify each new path as domain or non-domain in this document.
2. Update CI coverage include/exclude rules accordingly.
3. Do not merge until both thresholds are enforced for the new paths.

## 6) Governance

If path classification is disputed:

1. Resolve by architecture owners.
2. Document decision in this file.
3. If policy intent changes materially, update ADR references.
