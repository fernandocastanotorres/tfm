# Records API — TFG Electronic Citizen Records Management System

Spring Boot 3.x REST API backend for the Electronic Citizen Records Management System (TFG).

## Overview

This API provides the backend services for managing electronic citizen records (expedientes), including:

- **Authentication** — JWT-based auth with registration, OTP verification, password reset, and token rotation
- **Case Management** — Full CRUD for citizen cases (expedientes) with ownership enforcement, status transitions, and timeline tracking
- **Document Management** — Upload, download, listing, and deletion of documents associated with cases
- **Electronic Signature** — PAdES-like CMS/PKCS#7 signing using Bouncy Castle with self-signed service certificate
- **Procedure Catalog** — Browse available procedure types with dynamic form/task schemas for UI rendering
- **Catalog i18n** — Locale-aware catalog with DB-backed translations and bundle fallback

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Spring Boot 3.4.5 |
| Language | Java 17 |
| Build Tool | Maven |
| Database | PostgreSQL 16 (production), H2 (development) |
| ORM | Spring Data JPA + Hibernate |
| Security | Spring Security + JWT (jjwt 0.12.5) |
| BPM Engine | Flowable (embedded) |
| Validation | Jakarta Bean Validation |
| API Docs | SpringDoc OpenAPI 2.8.8 (Swagger UI) |
| Testing | JUnit 5, Mockito, Testcontainers |
| Crypto | Bouncy Castle 1.78.1 (CMS/PKCS#7) |
| PDF | OpenPDF 1.3.39 |
| Conversion | JODConverter 4.4.8 (LibreOffice) |
| Migration | Flyway (baseline v3) |
| Email | SMTP (`JavaMailSender`) + Mailpit (local runtime) |

## Architecture

The project follows **Hexagonal Architecture** (Ports & Adapters) with four logical layers:

```
  Client (Angular)
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  entrypoints (REST Controllers)         │
  │  - Request validation (@Valid)          │
  │  - Auth context extraction              │
  │  - Delegate to application services     │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │  application (Use Case Services)        │
  │  - Business logic orchestration         │
  │  - Ownership/authorization checks       │
  │  - Domain → DTO mapping                 │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │  domain (Entities + Repository Ports)   │
  │  - Pure domain models                   │
  │  - Repository interfaces (ports)        │
  │  - Domain value objects (Status, etc.)  │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │  infrastructure (JPA Adapters)          │
  │  - JPA entity implementations           │
  │  - Spring Data JPA repositories         │
  │  - Spring Security config               │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
           PostgreSQL 16
```

### Package Structure

```
backend/src/main/java/es/tfg/records/
├── RecordsApiApplication.java          # Spring Boot entry point
├── domain/
│   ├── model/                          # Domain entities (Procedure, Document, User, etc.)
│   └── port/                           # Repository port interfaces
├── application/
│   ├── service/                        # Use case service interfaces + implementations
│   ├── dto/                            # Request/Response DTOs
│   ├── mapper/                         # Domain → DTO manual mappers
│   └── exception/                      # Custom exception types
├── infrastructure/
│   ├── config/                         # Spring configuration (Security, JWT, OpenAPI, etc.)
│   ├── security/                       # JWT token provider & auth filter
│   ├── persistence/
│   │   ├── entity/                     # JPA entity implementations
│   │   ├── repository/                 # Spring Data JPA repositories
│   │   ├── adapter/                    # Domain port adapters
│   │   └── mapper/                     # Domain ↔ Entity mappers
│   └── storage/                        # File storage service
└── entrypoints/
    ├── controller/                     # REST controllers
    └── advice/                         # Global exception handler & response advice
```

## How to Run

### Full System in Dev (backend + sede + backoffice)

Use three terminals so the entire platform is online:

1) Backend API (`backend/`):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

2) Sede frontend (`front-end/`):

```bash
npm install
npx ng serve --configuration development --port 4200
```

3) Backoffice frontend (`back-office/`):

```bash
npm install
npx ng serve --configuration development --port 4300
```

Quick checks:

- Backend health: `http://localhost:8080/api/v1/health/live`
- Sede: `http://localhost:4200`
- Backoffice: `http://localhost:4300`

Dev users seeded by profile `dev`:

- Admin: `admin@tfg.es / Admin1234`
- Citizen: `citizen@tfg.es / Citizen1`

### Prerequisites

- Java 17 JDK
- Maven 3.9+
- PostgreSQL 16 (or use H2 for development)

### Development Mode (H2 in-memory)

1. Activate the `dev` profile:

```bash
export SPRING_PROFILES_ACTIVE=dev
```

2. Run the application:

```bash
./mvnw spring-boot:run
```

The application starts on `http://localhost:8080/api/v1`.

### Production Mode (PostgreSQL)

1. Set environment variables:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/records_db
export DB_USERNAME=records_user
export DB_PASSWORD=records_pass
export JWT_SECRET=<base64-encoded-secret-at-least-256-bits>
export STORAGE_DOCUMENTS_PATH=/var/data/documents
```

2. Apply required schema migration(s) before startup (recommended with a privileged DB user):

```bash
psql "$DB_URL" -U "$DB_USERNAME" -f db/postgresql/001_create_procedure_type_i18n.sql
```

3. Build and run:

```bash
./mvnw clean package -DskipTests
java -jar target/records-api-0.0.1-SNAPSHOT.jar
```

### Docker Compose

The project includes a `docker-compose.yml` at the repository root that orchestrates PostgreSQL, backend, and Mailpit:

```bash
docker compose up -d
```

Mailpit access:

- SMTP endpoint: `localhost:1025`
- Web UI: `http://localhost:8025`

## API Documentation

### Swagger UI

Interactive API documentation is available at:

```
http://localhost:8080/api/v1/swagger-ui.html
```

### OpenAPI Specification

The raw OpenAPI 3.0 spec is available at:

```
http://localhost:8080/api/v1/api-docs
```

### Endpoints Summary

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Authenticate user | Public |
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/verify-otp` | Verify OTP code | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| GET | `/citizen/procedures` | List citizen cases (paginated) | Required |
| POST | `/citizen/procedures` | Create case draft | Required |
| GET | `/citizen/procedures/{id}` | Get case detail | Required |
| GET | `/citizen/procedures/{id}/status` | Get case status | Required |
| POST | `/citizen/procedures/{id}/submit` | Submit case | Required |
| POST | `/citizen/procedures/{id}/request-amendment` | Request amendment | Required |
| POST | `/citizen/procedures/{caseId}/documents` | Upload document | Required |
| GET | `/citizen/procedures/{caseId}/documents` | List case documents | Required |
| GET | `/citizen/procedures/documents/{id}` | Get document metadata | Required |
| GET | `/citizen/procedures/documents/{id}/download` | Download document | Required |
| DELETE | `/citizen/procedures/documents/{id}` | Delete document | Required |
| POST | `/citizen/signatures/sign` | Sign document (PAdES CMS) | Required |
| POST | `/citizen/signatures/verify` | Verify document signature | Required |
| POST | `/citizen/signatures/digest` | Compute SHA-256 digest | Required |
| GET | `/citizen/signatures/certificate-info` | Get signing certificate info | Required |
| GET | `/citizen/procedures/catalog` | List procedure types | Required |
| GET | `/citizen/procedures/catalog/{procedureId}` | Get procedure detail | Public |
| GET | `/citizen/procedures/catalog/{procedureId}/form-schema` | Get form schema | Public |
| GET | `/citizen/procedures/catalog/{procedureId}/tasks/{taskId}/schema` | Get task schema | Public |
| GET | `/auth/verify-email` | Verify account email with token | Public |
| POST | `/auth/resend-verification` | Resend verification email (throttled) | Public |
| GET | `/auth/me` | Get authenticated user profile | Required |
| PUT | `/auth/me` | Update authenticated user profile | Required |
| GET | `/admin/dashboard/stats` | Dashboard KPI cards | Required |
| GET | `/admin/dashboard/report` | Dashboard distributions, SLA and trend report | Required |
| GET | `/admin/eni/metadata/procedures/{id}` | ENI metadata snapshot for a procedure | Required |
| GET | `/admin/eni/metadata/documents/{id}` | ENI metadata snapshot for a document | Required |
| POST | `/citizen/procedures/{id}/messages` | Send message from citizen | Required |
| GET | `/citizen/procedures/{id}/messages` | Get citizen thread messages (paginated) | Required |
| GET | `/citizen/procedures/{id}/messages/attachments/{aid}/download` | Download message attachment (citizen) | Required |
| GET | `/citizen/messages/unread-count` | Get citizen unread thread count | Required |
| GET | `/citizen/messages/threads` | Get citizen thread summaries | Required |
| POST | `/admin/procedures/{id}/messages` | Send message from admin | Required |
| GET | `/admin/procedures/{id}/messages` | Get admin thread messages (paginated) | Required |
| GET | `/admin/procedures/{id}/messages/attachments/{aid}/download` | Download message attachment (admin) | Required |
| GET | `/admin/messages/unread-count` | Get unread counts (citizen + admin) | Required |
| GET | `/admin/messages/unread-threads` | Get admin unread thread summaries | Required |
| GET | `/health/live` | Liveness probe | Public |
| GET | `/health/ready` | Readiness probe | Required |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | HTTP server port |
| `DB_URL` | `jdbc:postgresql://localhost:5432/records_db` | PostgreSQL connection URL |
| `DB_USERNAME` | `records_user` | Database username |
| `DB_PASSWORD` | `records_pass` | Database password |
| `JWT_SECRET` | *(insecure default)* | Base64-encoded secret key (min 256 bits) |
| `STORAGE_DOCUMENTS_PATH` | `./data/documents` | Local file storage path for uploads |
| `MAIL_HOST` | `mailpit` | SMTP host for outgoing mail |
| `MAIL_PORT` | `1025` | SMTP port |
| `MAIL_SMTP_AUTH` | `false` | SMTP auth toggle |
| `MAIL_SMTP_STARTTLS` | `false` | STARTTLS toggle |

## Testing

### Run All Tests

```bash
./mvnw test
```

### Run Specific Test Categories

```bash
# Unit tests only
./mvnw test -Dtest="*Test"

# Integration tests
./mvnw test -Dtest="*IntegrationTest"

# Controller tests (@WebMvcTest)
./mvnw test -Dtest="*ControllerTest"

# Repository tests (@DataJpaTest)
./mvnw test -Dtest="*RepositoryTest"
```

### Test Coverage

Generate JaCoCo coverage report:

```bash
./mvnw test jacoco:report
```

Report available at `target/site/jacoco/index.html`.

**Current Coverage (2026-05-18):**

| Scope | Instructions | Branches |
|-------|-------------|----------|
| **Domain Model** | **100%** | n/a |
| Application Exception | 92% | n/a |
| Infrastructure Config | 96% | 77% |
| Application Mapper | 76% | 71% |
| Persistence Adapter | 64% | n/a |
| Persistence Mapper | 60% | 26% |
| Persistence Entity | 55% | 0% |
| Application DTO | 34% | n/a |
| Controller Layer | 31% | 14% |
| Application Service | 24% | 13% |
| **Total (all code)** | **45%** | **22%** |

Tests cover:
- **Domain model** — 100% coverage (CaseAttachment, CaseTimelineEvent, Document, ProcedureTask, ProcedureType)
- **Service layer** — Business logic, ownership checks, state transitions
- **Controller layer** — Request/response contracts, validation, error handling
- **Repository layer** — JPA queries with H2 in-memory database
- **Security** — JWT filter, token validation, role-based access
- **Integration** — Full auth flow (register → verify → login → protected endpoint → refresh)
- **Mapper layer** — Domain ↔ DTO transformation with timeline/attachments/formData

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Password hashing | BCrypt (cost 12) | Spring Security native support |
| JWT library | jjwt | Simpler API, widely used in Spring ecosystem |
| Entity IDs | `java.util.UUID` | Native JPA support, type-safe |
| DTO mapping | Manual mappers | Fewer dependencies, clear transformation logic |
| Validation | Jakarta Bean Validation | Declarative, standard, integrates with Spring MVC |
| Electronic signature | Bouncy Castle CMS/PKCS#7 | SD-DSS unavailable on Maven Central; BC provides equivalent PAdES-BES functionality |

## Electronic Signature

The platform supports PAdES-like electronic document signing using Bouncy Castle cryptographic library.

### Architecture

- **SignatureService**: Core service for CMS/PKCS#7 detached signature generation
- **Self-signed certificate**: RSA 2048-bit, SHA256withRSA, generated at runtime (demo/TFG)
- **PDF embedding**: Manual trailer modification with `/Sig` dictionary for demo purposes
- **Verification**: CMS signature extraction and validation

### Signature Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/citizen/signatures/sign` | Upload PDF, return signed PDF with embedded CMS signature |
| `POST /api/v1/citizen/signatures/verify` | Verify CMS signature in a signed PDF |
| `POST /api/v1/citizen/signatures/digest` | Compute SHA-256 hash for external signing workflows |
| `GET /api/v1/citizen/signatures/certificate-info` | Get service signing certificate details |

### Certificate Details

- **Algorithm**: RSA 2048-bit
- **Hash**: SHA-256
- **Subject**: `CN=TFG Service Signing, O=TFG Records, C=ES`
- **Validity**: 1 year from service startup
- **Type**: PAdES-BES (Basic Electronic Signature)

### PDF Conversion

Documents can be converted to PDF format using LibreOffice via JODConverter before signing. Configure in `application.yml`:

```yaml
jodconverter:
  office-home: /usr/lib/libreoffice  # Optional, auto-detected if not set
  port-numbers: 2002
```
| Pagination | Spring Data Pageable | Built-in, custom response wrapper for API contract |
