# Project Specifications

## Overview
This file is the high-level SDD index for the current implementation baseline.

## Current Baseline (2026-05)
- **Backend**: Spring Boot 3.4.5, Java 17, JWT auth, JPA (PostgreSQL target), H2 for dev/test.
- **BPM Engine**: Flowable embedded process engine.
- **Frontends**: Angular 19 citizen portal and Angular 19 backoffice.
- **i18n**: `Accept-Language` driven catalog localization (`es-ES`, `ca-ES`, `eu-ES`, `gl-ES`, `va-ES`).
- **Identifier Policy**: Procedure start flow uses stable procedure identifier (UUID) end-to-end.
- **Theme System**: Multi-theme with light/dark palettes per theme, persisted per locale.
- **Public Content**: DB-backed CMS for legislation, FAQ, calendar, institutional, organisms, resources.

## Active Design Decisions
1. **DB-backed procedure catalog translations**
   - Runtime localization checks `procedure_type_i18n` first.
   - Fallback remains resource bundles for gradual rollout.
2. **Login-first procedure start**
   - Unauthenticated users are redirected to login with `returnUrl`.
   - After login, flow resumes directly at protected wizard route.
3. **Backoffice token resiliency**
   - JWT interceptor retries protected requests after refresh on `401`.
4. **Theme variant split**
   - Each theme has separate light/dark palettes persisted per locale.
   - Backoffice theme editor manages variants independently.

## Test Coverage Status (2026-05-18)
- **Backend domain model**: 100% (144 tests total)
- **Back-office**: 88.5% statements (51 tests)
- **Front-end citizen**: 42.5% statements (58 tests)
- See `docs/quality/TEST_STRATEGY.md` for detailed breakdown.

## Documentation Sources of Truth
- Product and compliance requirements: `REQUIREMENTS.md`
- Technical design: `docs/architecture/SYSTEM_DESIGN.md`
- API and authorization contracts: `docs/api/API_CONTRACT.md`, `docs/security/AUTHORIZATION_MATRIX.md`
- Architectural decisions: `docs/adr/INDEX.md`
- Test strategy and coverage: `docs/quality/TEST_STRATEGY.md`
