# Backoffice Frontend

Angular backoffice application for internal case processing, user administration, and procedure management.

## Development Run

1. Start backend API (`backend/`):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

2. Start backoffice (`back-office/`):

```bash
npm install
npx ng serve --configuration development --port 4300
```

3. Open `http://localhost:4300`.

## Authentication Behavior

- Access token is attached to protected requests.
- On `401`, interceptor refreshes token (`/auth/refresh`) and retries original request.
- If refresh fails, session is cleared and user is redirected to login.

## Admin Endpoints Used

- `GET /api/v1/admin/dashboard/stats`
- `GET /api/v1/admin/dashboard/report`
- `GET /api/v1/admin/tasks/pending`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PUT /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/status`
- `GET /api/v1/admin/procedure-types`
- `POST /api/v1/admin/procedure-types`
- `PUT /api/v1/admin/procedure-types/{id}`
- `GET /api/v1/admin/procedure-types/{id}/translations`
- `PUT /api/v1/admin/procedure-types/{id}/translations`

## Validation

- TypeScript app: `npx tsc --noEmit`
- TypeScript specs: `npx tsc --noEmit -p tsconfig.spec.json`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Test Coverage

```bash
ng test --watch=false --browsers=ChromeHeadless --code-coverage
```

**Current Coverage (2026-05-18):**

| Metric | Coverage | Tests |
|--------|----------|-------|
| Statements | 88.52% (108/122) | 51 passing |
| Branches | 94.44% (17/18) | |
| Functions | 78.04% (32/41) | |
| Lines | 89.28% (100/112) | |

**Tested areas:**
- Mock data pagination and filtering (`mock-data.ts`) — 16 tests
- Auth service (JWT parsing, role checks, token refresh) — 18 tests
- JWT auth interceptor (401 retry flow) — 1 test
- Accept-language interceptor — 3 tests
- Correlation-id interceptor — 4 tests
- HTTP error interceptor — 7 tests

## Interactive Tour

- Backoffice header includes a `Guia` button.
- The guide highlights sidebar navigation, header context, and main workspace.
