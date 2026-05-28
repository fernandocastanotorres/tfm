# Agent Roles and Collaboration Workflow

## 1. Role Definitions & Responsibilities

### 1.1. Architect Agent (ENS/ENI Specialist)
- **Responsibility:** Technical lead for compliance and system integrity.
- **Focus:** 
    - ENS (Medium Level) compliance (encryption, TLS, audit logic).
    - ENI XML Schema validation and metadata mapping (`EniMetadataService`, `EniPackagerService`).
    - Security-first infrastructure design (`SecurityConfig`, `SecurityHeadersFilter`, `JwtConfig`).

### 1.2. Backend Agent (Spring Boot 3.4 & BPMN)
- **Responsibility:** Core logic, API development, and process automation.
- **Focus:** 
    - Flowable BPMN engine integration (`WorkflowController`, `CaseController`).
    - Electronic Signature (Bouncy Castle CMS/PKCS#7) and PDF conversion via JODConverter + LibreOffice (bundled in Docker image).
    - Local file storage (`STORAGE_DOCUMENTS_PATH`) and JPA persistence.
    - REST APIs with OpenAPI/Swagger via Springdoc 2.8.

### 1.3. Frontend Agent (Angular 19 & UX)
- **Responsibility:** User and Backoffice interface development.
- **Focus:** 
    - Dynamic Form Rendering from JSON schemas.
    - Tailwind CSS + Angular Material 19 (CDK) integration.
    - WCAG 2.1 AA accessibility and i18n support (`@ngx-translate/core`, 5 languages).
    - Playwright E2E tests.
    - Built with Node.js 20, served via nginx:1.25-alpine (multi-stage Docker).

### 1.4. DevOps Agent (Orchestration & Observability)
- **Responsibility:** Environment lifecycle, containerization, and monitoring.
- **Focus:** 
    - Docker Compose orchestration: PostgreSQL 16, Mailpit, backend, frontend, backoffice.
    - **Observability stack**: Loki (logs), Promtail (log collector), Grafana 11 (dashboards), Prometheus 2.53 (metrics), cAdvisor (container metrics).
    - Multi-stage Dockerfiles for Spring Boot (eclipse-temurin:17-jre) and Angular (nginx:1.25-alpine).
    - LibreOffice installed inside backend Docker image (not a separate service).
    - Network bridging, SSL certificates, and volume management.

## 2. Specific Skills Matrix

| Agent | Core Skills | Specific Tools & Frameworks |
| :--- | :--- | :--- |
| **Architect** | Security Standards, System Design | ENS/ENI Frameworks, Keytool, XSD Validation, JWT |
| **Backend** | Java 17, BPMN, Signature APIs | Spring Boot 3.4.5, Hibernate, Flowable, Bouncy Castle, JODConverter, JJWT 0.12, Springdoc 2.8 |
| **Frontend** | Angular 19, Responsive UI, A11Y | TypeScript, Tailwind CSS, Angular Material 19 CDK, Reactive Forms, ngx-translate, Playwright |
| **DevOps** | Infrastructure as Code, Observability | Docker Compose, Multi-stage Dockerfiles, nginx 1.25, Loki/Promtail/Grafana/Prometheus/cAdvisor, PostgreSQL 16 |

## 3. Collaboration Protocol

1.  **Architecture Setup:** The Architect and DevOps agents define the `docker-compose.yml`, security networking, and observability pipeline.
2.  **Contract Definition:** Backend and Frontend agents agree on the JSON Schema structure for the Dynamic Forms.
3.  **Process Implementation:** Backend implements the BPMN flow; Frontend develops the dynamic renderer based on the active `taskId`.
4.  **Compliance Review:** Architect validates that the metadata inferred by the Backend matches the official ENI Technical Standards.
5.  **Signature Integration:** Backend implements CMS/PKCS#7 (PAdES-like) signing; Frontend ensures the citizen can download the signed evidence.
6.  **Final Audit:** DevOps and Architect verify that all actions are correctly recorded in the immutable audit log (`AuditLogEntity`) and observable via Loki/Grafana for ENS compliance.

## 4. Mandatory Frontend Language Standard

- **All Angular frontend development must be written in English**, including:
  - Variable names
  - Method/function names
  - Class and file names
  - Component selectors
- This is mandatory to keep the codebase professional and consistent across teams.
