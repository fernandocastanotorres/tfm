# System Design (Current Baseline)

This document describes the implemented technical design as of 2026-05.

## Quick Path

1. Read `REQUIREMENTS.md` for product/compliance intent.
2. Use this file for implementation architecture and runtime flows.
3. Use ADRs (`docs/adr/INDEX.md`) for decision rationale and change history.

## Context

The platform provides electronic records processing with three modules:
- Citizen frontend (`front-end`) — Angular 16
- Backoffice frontend (`back-office`) — Angular 16
- Core backend (`backend`) — Spring Boot 3.x

The system is developed with H2 in dev/test and prepared for PostgreSQL in production.

## Runtime Architecture

| Layer | Module | Main Responsibilities |
|---|---|---|
| Presentation | Citizen UI | Public catalog, authentication, procedure start, case wizard |
| Presentation | Backoffice UI | Dashboard, tasks, users, procedure management, i18n management |
| Application/Core | Backend API | JWT auth, RBAC, case/procedure logic, catalog i18n, BPM integration |
| Data | PostgreSQL/H2 | Domain persistence + `procedure_type_i18n` translations |

## Key Flows

### 1) Citizen Starts a Procedure

1. Citizen selects a catalog item.
2. UI navigates to protected route `/expedientes/nuevo/:procedureId`.
3. If unauthenticated, guard redirects to `/sede/login?returnUrl=...`.
4. After login, user is returned to original wizard route.
5. Wizard resolves procedure by stable identifier and creates case using `procedureId`.

### 2) Catalog Localization

1. Frontends send `Accept-Language`.
2. Backend resolves locale (supported list + fallback).
3. Catalog localization service looks up DB translations in `procedure_type_i18n`.
4. If missing, backend falls back to message bundles.

### 3) Backoffice Protected Operations

1. UI calls protected `/admin/*` endpoints with access token.
2. If token is expired, backend returns `401`.
3. Backoffice interceptor refreshes token via `/auth/refresh` and retries original request.

## Data Design: Catalog i18n

Table: `procedure_type_i18n`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `procedure_type_id` | UUID | FK -> `procedure_types.id` |
| `locale` | VARCHAR(10) | Locale key (`es-ES`, `ca-ES`, ...) |
| `title` | VARCHAR(255) | Localized title |
| `description` | TEXT | Localized description |
| `unit` | VARCHAR(100) | Localized unit |
| `created_at` | TIMESTAMPTZ | Auditable metadata |
| `updated_at` | TIMESTAMPTZ | Auditable metadata |

Constraints:
- Unique `(procedure_type_id, locale)`
- Index by `locale`

## Security Design

- Stateless JWT auth.
- Coarse endpoint control in `SecurityConfig`.
- Role model: `ROLE_CITIZEN`, `ROLE_TRAMITADOR`, `ROLE_ADMIN`.
- Public read-only catalog endpoint is allowed without auth.
- Unauthenticated requests to protected resources return `401`.

## Deployment Notes

- Production profile uses PostgreSQL with `ddl-auto: validate`.
- Required SQL migration for i18n table:
  - `backend/db/postgresql/001_create_procedure_type_i18n.sql`
- Dev profile uses H2 with `create-drop` for fast iteration.

## Traceability

Implementation touchpoints:
- `backend/src/main/java/es/tfg/records/application/service/ProcedureCatalogI18nService.java`
- `backend/src/main/java/es/tfg/records/application/service/BackofficeService.java`
- `backend/src/main/java/es/tfg/records/infrastructure/config/SecurityConfig.java`
- `front-end/src/app/application/guards/auth.guard.ts`
- `back-office/src/app/application/interceptors/jwt-auth.interceptor.ts`

## Test Coverage

| Module | Tests | Domain Coverage | Overall |
|--------|-------|----------------|---------|
| Backend | 144 | 100% | 45% |
| Back-office | 51 | n/a | 88.5% |
| Front-end citizen | 58 | n/a | 42.5% |

See `docs/quality/TEST_STRATEGY.md` for detailed breakdown and gap analysis.
