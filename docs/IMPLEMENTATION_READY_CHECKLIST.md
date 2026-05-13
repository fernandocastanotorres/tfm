# Implementation Readiness Checklist (AI-Assisted Delivery)

This checklist ensures the project is ready for reliable AI-assisted implementation.

## Status Legend
- ✅ Ready
- 🟡 Partially Ready
- ❌ Missing

---

## 1) Project Baseline

- ❌ Source code baseline exists for all modules (citizen UI, backoffice UI, core API)
- ❌ Standard project structure is created in repository
- ❌ Shared coding conventions are documented (formatting, naming, lint)

Notes:
- Current repository state is documentation-first; implementation scaffolding is still required.

---

## 2) Architecture and Decision Governance

- ✅ ADR set exists and is indexed (`docs/adr/INDEX.md`)
- ✅ Architecture style and boundaries are defined (ADR-0007)
- ✅ Enforceable boundary rules are documented (`docs/architecture/BOUNDARY_RULES.md`)
- ✅ Architecture-impact PR checklist snippet exists (`docs/architecture/PR_TEMPLATE_ARCHITECTURE.md`)

---

## 3) Compliance Requirements (ENS/ENI/WCAG)

- ✅ ENS/ENI/WCAG requirements are documented (`REQUIREMENTS.md`)
- 🟡 ENI mapping rules are described conceptually but not fully tabulated
- ❌ Compliance acceptance test matrix is defined (automated/verifiable)

Recommended next step:
- Add a dedicated ENI mapping table document and a compliance test catalog.

---

## 4) API and Contract Definition

- 🟡 High-level API behavior is implied by requirements
- ❌ Endpoint inventory exists (path, method, auth, request/response, errors)
- ❌ JSON schema contract governance exists (versioning, compatibility, deprecation)
- ❌ Error model and API pagination/filtering conventions are defined

Recommended next step:
- Create `docs/api/API_CONTRACT.md` + `docs/api/ERROR_MODEL.md`.

---

## 5) BPMN Execution Model (Camunda 7)

- ✅ BPM engine decision accepted (ADR-0004)
- ❌ BPMN packaging/deployment conventions are defined
- ❌ Task variable contract between BPMN and API/UI is defined
- ❌ Process versioning and migration policy is documented

Recommended next step:
- Create `docs/bpm/BPMN_CONVENTIONS.md`.

---

## 6) Security and Access Control

- ✅ Role set is defined (`ROLE_CITIZEN`, `ROLE_TRAMITADOR`, `ROLE_ADMIN`)
- 🟡 JWT/RBAC is specified at principle level
- ❌ Endpoint-level authorization matrix is defined
- ❌ Security event/audit event catalog is defined by action type

Recommended next step:
- Create `docs/security/AUTHORIZATION_MATRIX.md` + `docs/security/AUDIT_EVENT_CATALOG.md`.

---

## 7) Data and Persistence Model

- ✅ PostgreSQL + JPA selected (ADR-0003)
- ❌ Entity model and aggregate boundaries are defined
- ❌ Database migration strategy is defined (tooling + policy)
- ❌ UUID/public ID usage rules are codified in model conventions

Recommended next step:
- Create `docs/data/DOMAIN_MODEL.md` + migration policy document.

---

## 8) Document Pipeline and Interoperability

- ✅ Alfresco + LibreOffice + SD-DSS selected (ADR-0005)
- 🟡 ENIDOC package composition is defined at high level
- ❌ Conversion/signature failure handling and retry policy are defined
- ❌ XML/XSD validation workflow and error reporting contract are defined

Recommended next step:
- Create `docs/interoperability/ENIDOC_SPEC.md`.

---

## 9) Testing and Quality Gates

- ❌ Test strategy by module is documented (unit/integration/e2e)
- ❌ Required CI quality gates are defined (lint, test, architecture checks, security)
- ❌ Minimum coverage expectations are defined
- ❌ Test data strategy and fixtures policy are defined

Recommended next step:
- Create `docs/quality/TEST_STRATEGY.md` and CI gate definitions.

---

## 10) Delivery Planning for AI Execution

- ❌ Prioritized implementation backlog exists (vertical slices)
- ❌ “Definition of Done” per slice/module is explicit
- ❌ Risk-first sequencing is documented (compliance-critical flows first)

Recommended next step:
- Create `docs/planning/IMPLEMENTATION_SLICES.md` with 1–2 week increments.

---

## Minimum “Go” Criteria for AI Implementation

Before requesting full implementation, ensure at least:

1. Endpoint inventory + auth matrix
2. BPMN conventions and task variable contract
3. ENI mapping table and ENIDOC validation contract
4. Test strategy + CI quality gates
5. Initial code scaffolding for all 3 modules

Without these, AI can still generate code, but consistency and compliance risk increase significantly.
