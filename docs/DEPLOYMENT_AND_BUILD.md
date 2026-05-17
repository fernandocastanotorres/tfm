# Deployment and Build Guide

This guide defines the canonical commands to compile, validate, and deploy the platform.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+ and npm
- Docker + Docker Compose (for container deployment)
- PostgreSQL 15+ (if not using containers)

## Compile and Validate

### Backend (`backend/`)

```bash
mvn clean compile
mvn test
```

Optional package artifact:

```bash
mvn clean package
```

### Frontend Citizen (`front-end/`)

```bash
npm install
npx tsc --noEmit
npx ng build --configuration production
```

### Frontend Backoffice (`back-office/`)

```bash
npm install
npx tsc --noEmit
npx ng build --configuration production
```

## Local Development Deployment

Run services in three terminals.

1) Backend:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

2) Citizen frontend:

```bash
cd front-end
npm install
npx ng serve --configuration development --port 4200
```

3) Backoffice frontend:

```bash
cd back-office
npm install
npx ng serve --configuration development --port 4300
```

Quick checks:

- API live: `http://localhost:8080/api/v1/health/live`
- Citizen app: `http://localhost:4200`
- Backoffice app: `http://localhost:4300`

## Container Deployment (Compose)

From repository root:

```bash
docker compose up -d
```

For updates:

```bash
docker compose build
docker compose up -d
```

## Production Notes

1. Configure environment variables for DB, JWT, storage, SMTP, and RabbitMQ.
2. Apply SQL migrations before starting application:
   - `backend/db/postgresql/001_create_procedure_type_i18n.sql`
   - `backend/db/postgresql/002_add_user_profile_fields.sql`
   - `backend/db/postgresql/003_add_resend_verification_throttle.sql`
   - `backend/db/postgresql/004_create_eni_metadata_table.sql`
   - `backend/db/postgresql/005_create_public_content_entries_table.sql`
   - `backend/db/postgresql/006_seed_public_content_base.sql`
   - `backend/db/postgresql/007_public_content_translation_groups.sql`
   - `backend/db/postgresql/008_backfill_public_content_relations.sql`
3. Keep `ddl-auto: validate` in non-dev profiles.
4. Enable queue mode (`mailing.queue.enabled=true`) when RabbitMQ is available.

## Recommended Post-Deploy Verification

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- Backoffice dashboard:
  - `GET /api/v1/admin/dashboard/stats`
  - `GET /api/v1/admin/dashboard/report`
- ENI metadata queries:
  - `GET /api/v1/admin/eni/metadata/procedures/{id}`
  - `GET /api/v1/admin/eni/metadata/documents/{id}`
- Auth verification flow:
  - register user,
  - verify link,
  - resend verification cooldown behavior.
