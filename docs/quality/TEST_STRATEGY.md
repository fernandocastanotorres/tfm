# Test Strategy and Quality Gates

This document defines the testing policy, coverage targets, and CI quality gates.

It complements:
- `docs/IMPLEMENTATION_READY_CHECKLIST.md`
- `docs/api/API_CONTRACT.md`
- `docs/security/AUTHORIZATION_TEST_CASES.md`
- `docs/interoperability/ENIDOC_SPEC.md`

## 1) Objectives

1. Protect compliance-critical behavior (ENS/ENI/security/audit).
2. Enforce high confidence in domain logic evolution.
3. Keep delivery speed sustainable with layered test suites.

## 2) Test Pyramid by Module

## 2.1 Core API (Spring Boot)
- **Unit tests**: domain entities, value objects, domain services, use-case rules.
- **Integration tests**: repositories, security filters, API controllers, BPM adapters, DMS/signature/conversion adapters (with test doubles where needed).
- **Contract tests**: API response shapes, error model consistency, authorization outcomes.

## 2.2 Frontends (Citizen + Backoffice)
- **Unit tests**: components, services, state logic, schema rendering mappers.
- **Integration tests**: feature flows with mocked API contracts.
- **E2E tests**: critical user journeys (submission, amendment, task processing).

## 2.3 Interoperability/Document Pipeline
- ENIDOC package structure validation tests.
- XML/XSD validation tests.
- Signature + checksum verification tests.

## 3) Coverage Targets (Mandatory)

Coverage policy:

1. **Domain Model and Domain Use Cases**: **100% line coverage required**.
   - Scope includes domain entities, value objects, domain services, and application-level business rules.
   - Any uncovered line in this scope fails CI.

2. **All other code areas** (controllers, adapters, infra, UI, integration glue): **>= 80% line coverage required**.
   - Team target is to keep this “almost 80%” as **minimum 80%** for objective enforcement.

3. **Critical security/compliance paths** must have explicit scenario tests regardless of coverage percentage.

## 4) Quality Gates in CI

A pull request can merge only if all gates pass:

1. Lint/format checks
2. Unit + integration test execution
3. Coverage thresholds:
   - Domain scope: 100%
   - Non-domain aggregate scope: >= 80%
4. Authorization tests (role + ownership + deny paths)
5. Audit event verification tests for sensitive and denied actions
6. ENIDOC/XSD validation tests for interoperability flows

## 5) Test Suite Segmentation

Recommended pipelines:

- **Fast Suite (PR required):**
  - unit tests,
  - API contract checks,
  - core authorization tests,
  - coverage gate evaluation.

- **Full Suite (PR required or pre-merge):**
  - full integration tests,
  - ENIDOC/signature/validation tests,
  - end-to-end workflow scenarios,
  - regression set.

## 6) Definition of Done (Testing)

A backlog item is not done unless:

- tests are added/updated for changed behavior,
- coverage thresholds remain compliant,
- no critical path is left untested,
- relevant security/audit checks pass.

## 7) Exceptions Policy

Coverage exceptions are discouraged and must be explicit:

1. Provide reason and risk assessment.
2. Add temporary expiration date.
3. Track remediation task.
4. Require maintainer approval.

Rule:
- No exception allowed for domain model 100% target unless formally approved and time-bounded.

## 8) Reporting

Coverage reports must separate:

- domain scope coverage,
- non-domain scope coverage,
- trend over time.

This avoids inflated global metrics hiding weak business-rule coverage.

## 9) Current Coverage Status (2026-05-18)

### Backend (Spring Boot) — 144 tests

| Scope | Instructions | Branches | Status |
|-------|-------------|----------|--------|
| **Domain Model** | **100%** | n/a | ✅ Target met |
| Application Exception | 92% | n/a | |
| Infrastructure Config | 96% | 77% | |
| Application Mapper | 76% | 71% | |
| Persistence Adapter | 64% | n/a | |
| Persistence Mapper | 60% | 26% | |
| Persistence Entity | 55% | 0% | |
| Application DTO | 34% | n/a | |
| Controller Layer | 31% | 14% | |
| Application Service | 24% | 13% | |
| **Total (all code)** | **45%** | **22%** | ⚠️ Below 80% non-domain target |

### Front-end (Angular Citizen) — 58 tests

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 42.58% (534/1254) | ⚠️ Below 80% target |
| Branches | 20.79% (120/577) | ⚠️ Below 80% target |
| Functions | 37.40% (144/385) | ⚠️ Below 80% target |
| Lines | 42.42% (510/1202) | ⚠️ Below 80% target |

### Back-office (Angular Admin) — 51 tests

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | 88.52% (108/122) | ✅ Above 80% target |
| Branches | 94.44% (17/18) | ✅ Above 80% target |
| Functions | 78.04% (32/41) | ⚠️ Near 80% target |
| Lines | 89.28% (100/112) | ✅ Above 80% target |

### Priority Gaps

1. **Backend controllers** (31%) — add controller contract tests
2. **Backend application services** (24%) — add use-case scenario tests
3. **Front-end services** — add service-level tests for cases-api, procedures-api, profile, messages
4. **Front-end interceptors** — add http-error, jwt-auth, accept-language tests
5. **Front-end guards** — add auth-guard, tramitador-guard, admin-guard tests
