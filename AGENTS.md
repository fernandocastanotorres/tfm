# Agent Roles and Collaboration Workflow

## 1. Role Definitions & Responsibilities

### 1.1. Architect Agent (ENS/ENI Specialist)
- **Responsibility:** Technical lead for compliance and system integrity.
- **Focus:** 
    - ENS (Medium Level) compliance (encryption, TLS, audit logic).
    - ENI XML Schema validation and metadata mapping.
    - Security-first infrastructure design.

### 1.2. Backend Agent (Spring Boot & BPMN)
- **Responsibility:** Core logic, API development, and process automation.
- **Focus:** 
    - Camunda/Activiti engine integration.
    - Electronic Signature (SD-DSS) and PDF/A conversion logic.
    - Alfresco CMIS connectivity and JPA persistence.

### 1.3. Frontend Agent (Angular & UX)
- **Responsibility:** User and Backoffice interface development.
- **Focus:** 
    - Dynamic Form Rendering from JSON schemas.
    - Tailwind CSS + Angular Material integration.
    - WCAG 2.1 AA accessibility and i18n support.

### 1.4. DevOps Agent (Orchestration)
- **Responsibility:** Environment lifecycle and containerization.
- **Focus:** 
    - Docker Compose orchestration (PostgreSQL, Alfresco, LibreOffice).
    - Multi-stage Dockerfile optimization for Spring Boot and Angular.
    - Network bridging and volume management.

## 2. Specific Skills Matrix

| Agent | Core Skills | Specific Tools & Frameworks |
| :--- | :--- | :--- |
| **Architect** | Security Standards, System Design | ENS/ENI Frameworks, Keytool, XSD Validation |
| **Backend** | Java 17+, BPMN, Signature APIs | Spring Boot 3.x, Hibernate, SD-DSS, JODConverter |
| **Frontend** | Angular 17+, Responsive UI | TypeScript, Tailwind CSS, Material, Reactive Forms |
| **DevOps** | Infrastructure as Code, CI/CD | Docker, Docker Compose, Nginx Configuration |

## 3. Collaboration Protocol

1.  **Architecture Setup:** The Architect and DevOps agents define the `docker-compose.yml` and security networking.
2.  **Contract Definition:** Backend and Frontend agents agree on the JSON Schema structure for the Dynamic Forms.
3.  **Process Implementation:** Backend implements the BPMN flow; Frontend develops the dynamic renderer based on the active `taskId`.
4.  **Compliance Review:** Architect validates that the metadata inferred by the Backend matches the official ENI Technical Standards.
5.  **Signature Integration:** Backend implements XAdES signing; Frontend ensures the citizen can download the signed evidence.
6.  **Final Audit:** DevOps and Architect verify that all actions are being correctly recorded in the immutable audit log for ENS compliance.

## 4. Mandatory Frontend Language Standard

- **All Angular frontend development must be written in English**, including:
  - Variable names
  - Method/function names
  - Class and file names
  - Component selectors
- This is mandatory to keep the codebase professional and consistent across teams.
