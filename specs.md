# Project Specifications

## Overview
This file is the high-level SDD index for the current implementation baseline.

## Current Baseline (2026-05)
- **Backend**: Spring Boot 3.2.x, Java 17, JWT auth, JPA (PostgreSQL target), H2 for dev/test.
- **BPM Engine**: Flowable embedded process engine.
- **Frontends**: Angular 16 citizen portal and Angular 16 backoffice.
- **i18n**: `Accept-Language` driven catalog localization (`es-ES`, `ca-ES`, `eu-ES`, `gl-ES`, `va-ES`).
- **Identifier Policy**: Procedure start flow uses stable procedure identifier (UUID) end-to-end.

## Active Design Decisions
1. **DB-backed procedure catalog translations**
   - Runtime localization checks `procedure_type_i18n` first.
   - Fallback remains resource bundles for gradual rollout.
2. **Login-first procedure start**
   - Unauthenticated users are redirected to login with `returnUrl`.
   - After login, flow resumes directly at protected wizard route.
3. **Backoffice token resiliency**
   - JWT interceptor retries protected requests after refresh on `401`.

## Documentation Sources of Truth
- Product and compliance requirements: `REQUIREMENTS.md`
- Technical design: `docs/architecture/SYSTEM_DESIGN.md`
- API and authorization contracts: `docs/api/API_CONTRACT.md`, `docs/security/AUTHORIZATION_MATRIX.md`
- Architectural decisions: `docs/adr/INDEX.md`
