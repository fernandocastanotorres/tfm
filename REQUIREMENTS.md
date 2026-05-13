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
1.  **Public Frontend (Citizen):** Angular 17+ app with Tailwind CSS for procedure submission and status tracking.
2.  **Private Backoffice (Processor):** Angular 17+ app with Tailwind CSS for case management, workflow tasks, and BPMN configuration.
3.  **Core Backend:** Spring Boot 3.x API handling business logic, BPMN orchestration, and integrations.

## 3. Technology Stack & Tooling
*   **UI/UX:** Tailwind CSS (styling) + Angular Material (components) + `@ngx-translate` (i18n).
*   **Business Logic:** Spring Boot 3.x, Spring Security (JWT-based).
*   **Process Engine:** Camunda 7/8 or Activiti (BPMN 2.0).
*   **Persistence:** PostgreSQL via Spring Data JPA.
*   **DMS (Document Management):** Alfresco Content Services (CMIS/REST API).
*   **Orchestration:** **Docker & Docker Compose**. Essential services to containerize:
    *   `api-server` (Spring Boot).
    *   `db-postgres` (PostgreSQL).
    *   `dms-alfresco` (Alfresco).
    *   `office-headless` (LibreOffice for PDF/A conversion).
    *   `frontend-citizen` & `backoffice-admin` (Nginx).

## 4. Functional Requirements

### 4.1. Dynamic Process & UI
*   **JSON Schema Forms:** UI components must be generated dynamically. The Backend provides a schema based on the current BPMN `taskId`.
*   **Workflow Logic:** Support for linear and non-linear flows, including correction loops (returning files to the citizen for amendment and resubmission).

### 4.2. Document Management Pipeline
*   **Automated Conversion:** Server-side conversion of all uploaded documents to **PDF/A** (standard for long-term preservation).
*   **Electronic Signature:** Implementation of **XAdES-T** (Baseline T) server-side signature using an Organization Seal via the **SD-DSS** library.
*   **ENI Metadata Inference:** Automatic mapping of process context to ENI metadata (e.g., Mapping `task_id` "Upload_ID" to ENI document type "TD99").

### 4.3. Interoperability & Exchange
*   **Packager:** Service to generate a **ZIP (.enidoc)** containing:
    *   Original/Converted PDF/A documents.
    *   Detached signature files (.xsig).
    *   An `index.xml` valid against the official **ENI XSD schemas**.

## 5. Security & Audit Specs
*   **Public Identifiers:** Use **UUID v4** exclusively (no sequential IDs in URLs).
*   **Audit Trail:** Detailed logging of `timestamp`, `user_id`, `action`, `resource_uuid`, `client_ip`, and `app_context`.
*   **Authentication:** JWT with distinct roles: `ROLE_CITIZEN`, `ROLE_TRAMITADOR`, `ROLE_ADMIN`.

## 6. Deployment & DevOps
*   **Dockerization:** Multi-stage `Dockerfile` for each module.
*   **Persistence:** External volumes for PostgreSQL data and Alfresco Content Store.
*   **Networking:** Private bridge network for internal service communication (Backend ↔ Alfresco ↔ Office).
