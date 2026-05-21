# TFG Records Platform - Final Documentation

## Project Overview

Electronic Citizen Records Management System (TFG) - A full-stack platform for managing electronic citizen procedures with document management, electronic signatures, and workflow automation.

## Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Spring Boot 3.4.5, Java 17, Maven |
| **Frontend** | Angular 17+, TypeScript, Tailwind CSS |
| **Database** | PostgreSQL 16 (prod), H2 (dev) |
| **BPM Engine** | Flowable 7.0.1 |
| **Security** | Spring Security + JWT (jjwt 0.12.5) |
| **Crypto** | Bouncy Castle 1.78.1 (CMS/PKCS#7) |
| **PDF** | OpenPDF 1.3.39 |
| **Conversion** | JODConverter 4.4.8 (LibreOffice) |
| **Email (dev/runtime)** | SMTP + Mailpit |
| **Testing** | JUnit 5, Mockito, Testcontainers, k6 |

### Architecture Pattern

**Hexagonal Architecture** (Ports & Adapters):
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
│  - Domain value objects                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  infrastructure (JPA Adapters)          │
│  - JPA entity implementations           │
│  - Spring Data JPA repositories         │
│  - Spring Security config               │
│  - File storage, audit, signatures      │
└──────────────┬──────────────────────────┘
               │
               ▼
        PostgreSQL 16+
```

## Key Features

### 1. Authentication & Authorization
- JWT-based authentication with access/refresh tokens
- Role-based access control (CITIZEN, TRAMITADOR, ADMIN)
- OTP verification for account activation
- Password reset with email verification
- Rate limiting on auth endpoints

### 2. Case Management (Expedientes)
- Full CRUD for citizen procedures
- Status transitions: DRAFT → SUBMITTED → IN_REVIEW → APPROVED/REJECTED
- Amendment workflow for document requests
- Timeline tracking for all case events
- Ownership enforcement (users can only access their cases)

### 3. Document Management
- Upload/download with progress tracking
- Document versioning
- Status tracking (PENDING, VALIDATED, REJECTED)
- File storage with configurable path
- MIME type validation

### 4. Electronic Signature
- **PAdES-like CMS/PKCS#7 signing** using Bouncy Castle
- Self-signed service certificate (RSA 2048, SHA-256)
- Signature verification
- SHA-256 digest computation
- PDF signature embedding (demo mode)

**Certificate Details:**
- Algorithm: RSA 2048-bit
- Hash: SHA-256
- Subject: `CN=TFG Service Signing, O=TFG Records, C=ES`
- Validity: 1 year from service startup
- Type: PAdES-BES (Basic Electronic Signature)

### 5. Procedure Catalog
- Dynamic form schemas per procedure type
- Task-based workflow (FORM, REVIEW, UPLOAD)
- Multi-language support (i18n)
- Public access for browsing procedures

### 6. Public Content
- Institutional information pages
- FAQ system with categories
- Transparency reports and metrics
- Calendar of events
- Legislation references

### 7. Audit & Compliance
- Immutable audit log for ENS Medium Level compliance
- Security events: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, SIGN
- Client IP tracking
- Application context tracking (CITIZEN, BACKOFFICE, API)

### 8. Internationalization
- 5 language support: Spanish, Catalan, Basque, Galician, Valencian
- DB-backed translations with bundle fallback
- Locale-aware procedure catalog

## API Endpoints

### Authentication
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Authenticate user | Public |
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/verify-otp` | Verify OTP code | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| GET | `/auth/verify-email` | Verify account email | Public |
| POST | `/auth/resend-verification` | Resend verification email | Public |
| GET | `/auth/me` | Get user profile | Required |
| PUT | `/auth/me` | Update user profile | Required |

### Citizen Procedures
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/citizen/procedures` | List citizen cases | Required |
| POST | `/citizen/procedures` | Create case draft | Required |
| GET | `/citizen/procedures/{id}` | Get case detail | Required |
| GET | `/citizen/procedures/{id}/status` | Get case status | Required |
| POST | `/citizen/procedures/{id}/submit` | Submit case | Required |
| POST | `/citizen/procedures/{id}/amend` | Request amendment | Required |
| POST | `/citizen/procedures/{caseId}/documents` | Upload document | Required |
| GET | `/citizen/procedures/{caseId}/documents` | List case documents | Required |
| GET | `/citizen/procedures/documents/{id}` | Get document metadata | Required |
| GET | `/citizen/procedures/documents/{id}/download` | Download document | Required |
| DELETE | `/citizen/procedures/documents/{id}` | Delete document | Required |

### Electronic Signatures
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/citizen/signatures/sign` | Sign document (PAdES CMS) | Required |
| POST | `/citizen/signatures/verify` | Verify document signature | Required |
| POST | `/citizen/signatures/digest` | Compute SHA-256 digest | Required |
| GET | `/citizen/signatures/certificate-info` | Get signing certificate info | Required |

### Procedure Catalog
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/citizen/procedures/catalog` | List procedure types | Public |
| GET | `/citizen/procedures/catalog/{slug}` | Get procedure detail | Public |
| GET | `/citizen/procedures/catalog/{slug}/form-schema` | Get form schema | Public |
| GET | `/citizen/procedures/catalog/{slug}/tasks/{taskId}/schema` | Get task schema | Public |

### Public Content
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/citizen/public-content/institutional` | Institutional info | Public |
| GET | `/citizen/public-content/faq` | FAQ entries | Public |
| GET | `/citizen/public-content/calendar` | Event calendar | Public |
| GET | `/citizen/public-content/transparency/reports` | Transparency reports | Public |
| GET | `/citizen/public-content/transparency/metrics` | Transparency metrics | Public |

### Health
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health/live` | Liveness probe | Public |
| GET | `/health/ready` | Readiness probe | Required |

## How to Run

### Development Mode (H2 in-memory)

```bash
# Backend
cd backend
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run

# Frontend (Sede)
cd front-end
npm install
npx ng serve --configuration development --port 4200

# Backoffice
cd back-office
npm install
npx ng serve --configuration development --port 4300
```

**Dev Users:**
- Admin: `admin@tfg.es / Admin1234`
- Citizen: `citizen@tfg.es / Citizen1`

### Production Mode (PostgreSQL)

```bash
# Set environment variables
export DB_URL=jdbc:postgresql://localhost:5432/records_db
export DB_USERNAME=records_user
export DB_PASSWORD=records_pass
export JWT_SECRET=<base64-encoded-secret>
export STORAGE_DOCUMENTS_PATH=/var/data/documents

# Build and run
cd backend
./mvnw clean package -DskipTests
java -jar target/records-api-0.0.1-SNAPSHOT.jar
```

### Docker Compose

```bash
docker compose up -d
```

## Testing

### Backend Tests

```bash
# Run all tests
cd backend
./mvnw test

# Run specific test
./mvnw test -Dtest=SignatureServiceTest

# Generate coverage report
./mvnw test jacoco:report
```

### Performance Tests

```bash
# Install k6
brew install k6  # macOS
# or see https://k6.io/docs/getting-started/installation/

# Run load tests
cd performance
BASE_URL=http://localhost:8080/api/v1 EMAIL=citizen@tfg.es PASSWORD=Citizen1 k6 run api-load-test.js
```

**Load Profile:**
- Ramp-up: 30s to 10 users
- Steady: 1m at 10 users
- Spike: 30s to 20 users
- Steady: 1m at 20 users
- Ramp-down: 30s to 0 users

**Thresholds:**
- 95th percentile response time: < 500ms
- Error rate: < 1%

## Security

### ENS Medium Level Compliance
- BCrypt password hashing (cost 12)
- JWT with 15-minute access token expiry
- Refresh token rotation
- Rate limiting on auth endpoints
- Security headers (CSP, X-Frame-Options, etc.)
- Immutable audit log
- CORS configuration

### Electronic Signature Security
- RSA 2048-bit key pair
- SHA-256 hash algorithm
- CMS/PKCS#7 detached signature format
- Self-signed certificate for demo (replace with CA-signed for production)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | HTTP server port |
| `DB_URL` | `jdbc:postgresql://localhost:5432/records_db` | PostgreSQL URL |
| `DB_USERNAME` | `records_user` | Database username |
| `DB_PASSWORD` | `records_pass` | Database password |
| `JWT_SECRET` | *(insecure default)* | Base64-encoded secret (min 256 bits) |
| `STORAGE_DOCUMENTS_PATH` | `./data/documents` | Local file storage path |
| `LIBREOFFICE_HOME` | *(auto-detect)* | LibreOffice installation path |
| `LIBREOFFICE_PORT` | `2002` | LibreOffice socket port |
| `MAIL_HOST` | `mailpit` | SMTP host for outbound transactional email |
| `MAIL_PORT` | `1025` | SMTP port |
| `MAIL_SMTP_AUTH` | `false` | SMTP auth enabled/disabled |
| `MAIL_SMTP_STARTTLS` | `false` | SMTP STARTTLS enabled/disabled |

## Project Structure

```
TFG/
├── backend/                 # Spring Boot API
│   ├── src/main/java/es/tfg/records/
│   │   ├── domain/          # Domain entities and ports
│   │   ├── application/     # Use case services
│   │   ├── infrastructure/  # JPA, security, config
│   │   └── entrypoints/     # REST controllers
│   └── src/test/            # Unit and integration tests
├── front-end/               # Angular citizen portal (Sede)
│   └── src/app/
│       ├── application/     # Services, models, utils
│       └── adapters/        # Components
├── back-office/             # Angular admin portal
├── performance/             # k6 load tests
├── docker-compose.yml       # Docker orchestration
└── docs/                    # Documentation
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Password hashing | BCrypt (cost 12) | Spring Security native support |
| JWT library | jjwt | Simpler API, widely used in Spring ecosystem |
| Entity IDs | `java.util.UUID` | Native JPA support, type-safe |
| DTO mapping | Manual mappers | Fewer dependencies, clear transformation logic |
| Validation | Jakarta Bean Validation | Declarative, standard, integrates with Spring MVC |
| Electronic signature | Bouncy Castle CMS/PKCS#7 | SD-DSS unavailable on Maven Central; BC provides equivalent PAdES-BES functionality |
| BPM Engine | Flowable | Active fork of Activiti, Spring Boot 3 compatible |
| Architecture | Hexagonal | Clear separation of concerns, testable, AI-navigable |

## Integration Test Results

| Test | Status | Details |
|------|--------|---------|
| Health Check | ✅ PASS | Returns UP status |
| Authentication | ✅ PASS | JWT token obtained successfully |
| Certificate Info | ✅ PASS | Returns subject, algorithm, type |
| List Procedures | ✅ PASS | Found 5 procedures |
| Compute Digest | ✅ PASS | SHA-256 hash computed correctly |
| Sign Document | ✅ PASS | HTTP 200, signature generated |
| Verify Signature | ✅ PASS | Returns valid/invalid status |

## Next Steps for Production

1. **Certificate Management**: Replace self-signed certificate with CA-signed certificate
2. **Database Migration**: Apply schema migrations for PostgreSQL
3. **Email Service**: Keep SMTP + Mailpit for local validation; evaluate external provider only for production hardening
4. **LibreOffice**: Install and configure for document-to-PDF conversion before signing
5. **Monitoring**: Set up Prometheus + Grafana for metrics
6. **Load Balancer**: Configure Nginx reverse proxy
7. **HTTPS**: Enable TLS with Let's Encrypt
8. **Backup Strategy**: Configure PostgreSQL backups
9. **CI/CD**: Set up GitHub Actions/GitLab CI pipeline
10. **Performance Testing**: Run k6 tests against staging environment
