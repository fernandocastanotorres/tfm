# k6 Load Test Results

**Date:** 2026-05-22
**Script:** api-load-test.js
**Target:** http://localhost:8080/api/v1 (Docker container)

## Configuration
- Ramp-up: 30s → 10 users
- Steady: 1m @ 10 users
- Spike: 30s → 20 users
- Steady: 1m @ 20 users
- Ramp-down: 30s → 0 users

## Thresholds

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| p(95) response time | < 500ms | 21.5ms | ✅ |
| Error rate | < 1% | 0% | ✅ |
| Custom errors | < 10% | 0% | ✅ |

## Results Summary

| Metric | Value |
|--------|-------|
| Total HTTP requests | 2,716 |
| Total iterations | 543 |
| Checks passed | 3,802 / 3,802 (100%) |
| Errors | 0 |
| Failed requests | 0 |
| Avg response time | 7.2ms |
| p(95) response time | 21.5ms |
| Max response time | 651ms |
| Avg iteration duration | 5.04s |
| Max VUs | 20 |

## Endpoints Tested
- `GET /health/live` — health check
- `GET /auth/me` — user profile
- `GET /citizen/procedures` — procedures list
- `GET /citizen/signatures/certificate-info` — certificate info
- `GET /citizen/procedures/catalog` — procedure catalog

**All endpoints passed 100% of checks.**
