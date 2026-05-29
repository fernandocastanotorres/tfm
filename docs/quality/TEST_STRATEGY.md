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

## 9) Current Coverage Status (2026-05-29)

### Backend (Spring Boot)
| Scope | Instructions | Branches | Status |
|-------|-------------|----------|--------|
| **Domain Model** | **100%** | n/a | ✅ Target met |
| Aggregate Scope | 87.42% | 64.78% | ✅ Above 80% target |

### Front-end (Angular Citizen)
| Metric | Coverage | Status |
|--------|----------|--------|
| Lines | 83.18% | ✅ Above 80% target |

### Back-office (Angular Admin)
| Metric | Coverage | Status |
|--------|----------|--------|
| Lines | 87.8% | ✅ Above 80% target |

### Summary
| Module | Line Coverage | Status |
|--------|--------------|--------|
| Backend | 87.42% | ✅ |
| Front-end (Citizen) | 83.18% | ✅ |
| Back-office (Admin) | 87.8% | ✅ |
| **Total** | **~86%** | ✅ All modules above 80% |

### Remaining Gaps
- E2E test regressions detected after Front-end migration to standalone components; ongoing resolution required.
