# Records API — TFG Electronic Citizen Records Management System

Spring Boot 3.x REST API backend for the Electronic Citizen Records Management System (TFG).

## Overview

This API provides the backend services for managing electronic citizen records (expedientes), including:

- **Authentication** — JWT-based auth with registration, OTP verification, password reset, and token rotation
- **Case Management** — Full CRUD for citizen cases (expedientes) with ownership enforcement, status transitions, and timeline tracking
- **Document Management** — Upload, download, listing, and deletion of documents associated with cases
- **Procedure Catalog** — Browse available procedure types with dynamic form/task schemas for UI rendering

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Spring Boot 3.2.5 |
| Language | Java 21 |
| Build Tool | Maven |
| Database | PostgreSQL 15+ (production), H2 (development) |
| ORM | Spring Data JPA + Hibernate |
| Security | Spring Security + JWT (jjwt 0.12.5) |
| Validation | Jakarta Bean Validation |
| API Docs | SpringDoc OpenAPI 2.5.0 (Swagger UI) |
| Testing | JUnit 5, Mockito, Testcontainers |

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
          PostgreSQL 15+
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

- Java 21 JDK
- Maven 3.9+
- PostgreSQL 15+ (or use H2 for development)

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

The project includes a `docker-compose.yml` at the repository root that orchestrates PostgreSQL and the backend:

```bash
docker compose up -d
```

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
| GET | `/citizen/procedures/catalog` | List procedure types | Required |
| GET | `/citizen/procedures/catalog/{slug}` | Get procedure detail | Required |
| GET | `/citizen/procedures/catalog/{slug}/form-schema` | Get form schema | Required |
| GET | `/citizen/procedures/catalog/{slug}/tasks/{taskId}/schema` | Get task schema | Required |
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

Tests cover:
- **Service layer** — Business logic, ownership checks, state transitions
- **Controller layer** — Request/response contracts, validation, error handling
- **Repository layer** — JPA queries with H2 in-memory database
- **Security** — JWT filter, token validation, role-based access
- **Integration** — Full auth flow (register → verify → login → protected endpoint → refresh)

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Password hashing | BCrypt (cost 12) | Spring Security native support |
| JWT library | jjwt | Simpler API, widely used in Spring ecosystem |
| Entity IDs | `java.util.UUID` | Native JPA support, type-safe |
| DTO mapping | Manual mappers | Fewer dependencies, clear transformation logic |
| Validation | Jakarta Bean Validation | Declarative, standard, integrates with Spring MVC |
| Pagination | Spring Data Pageable | Built-in, custom response wrapper for API contract |
