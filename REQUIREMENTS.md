# Project Requirements: Electronic Records Management System (ENS/ENI Compliant)

## 1. Compliance Framework (Legal & Security)
*   **ENS (Esquema Nacional de Seguridad):** **Medium Level**. 
    *   Encryption: AES-256 for data at rest, TLS 1.2/1.3 for data in transit.
    *   Traceability: Immutable audit logs (JPA Audit) for every access or modification.
    *   Identity: Role-based access control (RBAC).
*   **ENI (Esquema Nacional de Interoperabilidad):** 
    *   Mandatory generation of ENI-compliant XML indexes.
    *   Creation of **.enidoc (ZIP)** exchange packages.
    *   Compliance with Technical Standards for Electronic Documents and Records.
*   **Accessibility:** **WCAG 2.1 Level AA** (Mandatory for Spanish Public Administration).

## 2. Module Architecture
The system is divided into three decoupled core modules:
1.  **Public Frontend (Citizen):** Angular 19 app with Tailwind CSS for procedure submission and status tracking.
2.  **Private Backoffice (Processor):** Angular 19 app with Tailwind CSS for case management, workflow tasks, and BPMN configuration.
3.  **Core Backend:** Spring Boot 3.x API handling business logic, BPMN orchestration, and integrations.

## 3. Technology Stack & Tooling
*   **UI/UX:** Tailwind CSS (styling) + Angular Material (components) + `@ngx-translate` (i18n).
*   **Business Logic:** Spring Boot 3.x, Spring Security (JWT-based).
*   **Process Engine:** Flowable embedded engine (BPMN 2.0).
*   **Persistence:** PostgreSQL via Spring Data JPA.
*   **Document Storage:** Local file system (configurable path).
*   **Orchestration:** **Docker & Docker Compose**. Essential services to containerize:
    *   `api-server` (Spring Boot, includes LibreOffice for PDF conversion).
    *   `db-postgres` (PostgreSQL).
    *   `frontend-citizen` & `backoffice-admin` (Nginx).

## 4. Functional Requirements

### 4.1. Dynamic Process & UI
*   **JSON Schema Forms:** UI components must be generated dynamically. The Backend provides a schema based on the current BPMN `taskId`.
*   **Workflow Logic:** Support for linear and non-linear flows, including correction loops (returning files to the citizen for amendment and resubmission).
*   **Stable Procedure Start:** Procedure start and wizard resolution must use a stable identifier (`procedureId` UUID), not localized slugs.
*   **Login-First Start Policy:** If a citizen starts a protected procedure while unauthenticated, the UI must redirect to login and then continue automatically to the original route.

### 4.1.1. Catalog Localization
*   **Request Locale:** Catalog localization must be driven by `Accept-Language`.
*   **Supported Locales:** `es-ES`, `ca-ES`, `eu-ES`, `gl-ES`, `va-ES`.
*   **Translation Persistence:** Procedure translations must be editable from backoffice and persisted in database (`procedure_type_i18n`).
*   **Fallback:** If DB translation is missing, fallback to server bundle/default language.

### 4.2. Document Management Pipeline
*   **Automated Conversion:** Server-side conversion of all uploaded documents to **PDF** via LibreOffice (JODConverter).
*   **Electronic Signature:** Implementation of **PAdES-BES** (CMS/PKCS#7) server-side signature using an Organization Seal via the **Bouncy Castle** library.
*   **ENI Metadata Inference:** Automatic mapping of process context to ENI metadata (e.g., Mapping `task_id` "Upload_ID" to ENI document type "TD99").

### 4.3. Interoperability & Exchange
*   **Packager:** Service to generate a **ZIP (.enidoc)** containing:
    *   Original/Converted PDF documents.
    *   Detached signature files (.xsig).
    *   An `index.xml` valid against the official **ENI XSD schemas**.

### 4.4. Transactional Email (Project Scope)
*   **Mandatory local runtime:** Account verification and notification emails must work in a self-contained environment without external SaaS dependency.
*   **SMTP baseline:** The backend must use SMTP configuration (`MAIL_HOST`, `MAIL_PORT`, auth/tls toggles) to avoid provider lock-in.
*   **Inspection service:** The containerized stack must include a local SMTP sink and UI (Mailpit) for deterministic validation in development and demos.

## 5. Security & Audit Specs
*   **Public Identifiers:** Use **UUID v4** exclusively (no sequential IDs in URLs).
*   **Audit Trail:** Detailed logging of `timestamp`, `user_id`, `action`, `resource_uuid`, `client_ip`, and `app_context`.
*   **Authentication:** JWT with distinct roles: `ROLE_CITIZEN`, `ROLE_TRAMITADOR`, `ROLE_ADMIN`.
*   **Session Resilience:** Backoffice protected requests must support token refresh + retry on `401` to avoid forced logout on normal token expiry.

## 6. Deployment & DevOps
*   **Dockerization:** Multi-stage `Dockerfile` for each module.
*   **Persistence:** External volumes for PostgreSQL data.
*   **Networking:** Private bridge network for internal service communication (Backend ↔ Office).
