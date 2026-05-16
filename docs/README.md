# Project Documentation

This folder contains project-level technical documentation.

## Delivery Readiness
- AI implementation readiness: [Implementation Ready Checklist](./IMPLEMENTATION_READY_CHECKLIST.md)

## Architecture Decision Records (ADRs)
- ADR entry point: [ADR Index](./adr/INDEX.md)
- ADR conventions and lifecycle: [ADR Guidelines](./adr/README.md)
- New ADR template: [ADR Template](./adr/_template.md)

## Architecture Rules
- Architecture entry point: [Architecture Index](./architecture/INDEX.md)
- Boundary enforcement guide: [Boundary Rules](./architecture/BOUNDARY_RULES.md)

## Security
- Authorization policy: [Authorization Matrix](./security/AUTHORIZATION_MATRIX.md)
- Authorization test catalog: [Authorization Test Cases](./security/AUTHORIZATION_TEST_CASES.md)
- Audit event definitions: [Audit Event Catalog](./security/AUDIT_EVENT_CATALOG.md)

## API
- API baseline contract: [API Contract](./api/API_CONTRACT.md)
- API error model: [Error Model](./api/ERROR_MODEL.md)

## BPM
- Camunda 7 process conventions: [BPMN Conventions](./bpm/BPMN_CONVENTIONS.md)

## Interoperability
- ENIDOC package specification: [ENIDOC Spec](./interoperability/ENIDOC_SPEC.md)

## Quality
- Test strategy and CI gates: [Test Strategy](./quality/TEST_STRATEGY.md)
- Coverage scope definitions: [Coverage Scope Map](./quality/COVERAGE_SCOPE_MAP.md)
- CI enforcement blueprint: [CI Coverage Gates](./quality/CI_COVERAGE_GATES.md)

## Dev Startup (System Online)

Use three terminals so backend, sede, and backoffice run at the same time.

### 1) Backend API (`:8080`)

From `backend/`:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Runs with H2 and dev seed data.

### 2) Sede Frontend (`:4200`)

From `front-end/`:

```bash
npm install
npx ng serve --configuration development --port 4200
```

### 3) Backoffice Frontend (`:4300`)

From `back-office/`:

```bash
npm install
npx ng serve --configuration development --port 4300
```

Backoffice dev server uses proxy to backend API (`/api/v1 -> http://localhost:8080`).

### Quick Validation

- Backend health: `http://localhost:8080/api/v1/health/live`
- Sede app: `http://localhost:4200`
- Backoffice app: `http://localhost:4300`
- Dev admin user: `admin@tfg.es / Admin1234`
- Dev citizen user: `citizen@tfg.es / Citizen1`

### Important

If you changed Angular proxy or environment settings, restart the corresponding `ng serve` process to apply them.
