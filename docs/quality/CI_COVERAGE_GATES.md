# CI Coverage Gates (Pseudo-Config + Reference Implementation)

This document describes how to enforce two independent coverage gates in CI:

1. **Domain scope**: 100%
2. **Non-domain scope**: >= 80%

It complements:
- `TEST_STRATEGY.md`
- `COVERAGE_SCOPE_MAP.md`

Repository bootstrap note:
- A starter GitHub Actions workflow is available at `.github/workflows/ci.yml` in report mode.
- Coverage gate script is available at `scripts/coverage/check-coverage-gates.mjs`.

## 1) Pipeline Structure (Tool-Agnostic)

Recommended stages:

1. `lint`
2. `test-backend`
3. `test-frontend`
4. `coverage-gates`

`coverage-gates` must fail if either threshold is not met.

## 2) Required Coverage Artifacts

Collect machine-readable coverage reports from each module:

- Backend (JaCoCo XML)
- Frontend (LCOV or equivalent)

Then evaluate:
- **Domain coverage** using backend domain-scope includes
- **Non-domain coverage** using backend non-domain + frontend scopes

## 3) Gate Logic (Pseudo)

```text
domain_coverage = compute_coverage(scope = DOMAIN_PATHS)
non_domain_coverage = compute_coverage(scope = NON_DOMAIN_PATHS)

if domain_coverage < 100.0:
  fail("Domain coverage below 100%")

if non_domain_coverage < 80.0:
  fail("Non-domain coverage below 80%")

pass
```

## 4) Scope Inputs

Use the authoritative classification from `COVERAGE_SCOPE_MAP.md`.

Example inputs:

- `DOMAIN_PATHS`
  - `backend/**/domain/**`
  - `backend/**/application/usecase/**`
  - `backend/**/application/command/**`
  - `backend/**/application/query/**`

- `NON_DOMAIN_PATHS`
  - `backend/**/entrypoints/**`
  - `backend/**/infrastructure/**`
  - `backend/**/config/**`
  - `backend/**/security/**`
  - `frontend-citizen/src/**`
  - `backoffice-admin/src/**`

## 5) Reference: Maven + JaCoCo (Backend)

Use JaCoCo XML output and evaluate package/class filters by scope.

### 5.1 Generate report

```bash
mvn -q test jacoco:report
```

Expected report path (typical):

- `target/site/jacoco/jacoco.xml`

### 5.2 Enforce domain = 100%

Recommended approach:
- Configure a dedicated JaCoCo check rule for domain packages with minimum `1.00` line ratio.

Conceptual configuration:

```xml
<rule>
  <element>PACKAGE</element>
  <includes>
    <include>**.domain.*</include>
    <include>**.application.usecase.*</include>
    <include>**.application.command.*</include>
    <include>**.application.query.*</include>
  </includes>
  <limits>
    <limit>
      <counter>LINE</counter>
      <value>COVEREDRATIO</value>
      <minimum>1.00</minimum>
    </limit>
  </limits>
</rule>
```

### 5.3 Enforce non-domain >= 80%

Add a second JaCoCo rule for non-domain backend packages with minimum `0.80`.

## 6) Reference: Angular Coverage (Frontend)

Run tests with coverage for each frontend app:

```bash
npm run test -- --watch=false --code-coverage
```

Typical output:
- `coverage/lcov.info`

Enforcement options:
1. Per-project thresholds in test runner config (recommended baseline).
2. Pipeline script that parses LCOV and fails if `< 80%` for frontend aggregate scope.

## 7) Combined Non-Domain Gate

Because non-domain includes backend infra + frontend code, choose one strategy:

1. **Single aggregate gate (preferred)**
   - Merge backend non-domain and frontend reports in a coverage aggregation step.
   - Fail if merged non-domain line coverage < 80%.

2. **Split gate with weighted check**
   - Enforce backend non-domain >= 80%
   - Enforce each frontend >= 80%
   - Treat this as equivalent to aggregate policy for operational simplicity.

## 8) Pull Request Requirements

PR must include:

- Coverage summary for domain and non-domain scopes
- Evidence of threshold pass/fail
- Updated scope mapping if new paths were introduced

## 9) Failure Messaging Standards

Use explicit CI failure messages:

- `COVERAGE_DOMAIN_100_FAILED`
- `COVERAGE_NON_DOMAIN_80_FAILED`
- `COVERAGE_SCOPE_UNMAPPED_PATHS`

This improves remediation speed and auditability.

## 10) Rollout Recommendation

1. Start with reporting mode for 1 sprint (no hard fail) if repository is new.
2. Enable hard fail after baseline stabilizes.
3. Keep domain 100% strict from first enforcement point.

## 11) Expected CI Log Output (Example)

When `scripts/coverage/check-coverage-gates.mjs` runs, reviewers should see a summary like:

```text
--- Coverage Gate Summary ---
Mode: report
JaCoCo files: 1
LCOV files: 2
Domain lines: 250/250
Non-domain lines: 1280/1530
Domain coverage: 100.00%
Non-domain coverage: 83.66%
```

In `enforce` mode, failing thresholds print explicit codes:

- `COVERAGE_DOMAIN_100_FAILED`
- `COVERAGE_NON_DOMAIN_80_FAILED`

These codes are intentionally stable to simplify CI alerting and remediation workflows.
