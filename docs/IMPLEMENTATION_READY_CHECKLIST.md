# Implementation Readiness Checklist (AI-Assisted Delivery)

This checklist ensures the project is ready for reliable AI-assisted implementation.

## Status Legend
- ✅ Ready
- 🟡 Partially Ready
- ❌ Missing

---

## 1) Project Baseline

- ✅ Source code baseline exists for all modules (citizen UI, backoffice UI, core API)
- ✅ Standard project structure is created in repository
- 🟡 Shared coding conventions are partially documented (architecture/security/testing docs exist; lint/format policy can be expanded)

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

- ✅ API endpoint inventory exists (`docs/api/API_CONTRACT.md`)
- ✅ Contract governance policy exists (versioning, compatibility, deprecation)
- ✅ Error model and pagination/filtering conventions are defined (`docs/api/ERROR_MODEL.md`, `docs/api/API_CONTRACT.md`)
- 🟡 Contract test coverage should keep growing for new endpoints

---

## 5) BPMN Execution Model (Flowable)

- ✅ BPM engine decision accepted (ADR-0008)
- ✅ BPMN conventions are documented (`docs/bpm/BPMN_CONVENTIONS.md`)
- ✅ Task variable contract between BPMN and API/UI is documented
- 🟡 Process instance migration strategy should be formalized per release

---

## 6) Security and Access Control

- ✅ Role set is defined (`ROLE_CITIZEN`, `ROLE_TRAMITADOR`, `ROLE_ADMIN`)
- ✅ JWT/RBAC is specified at principle and endpoint level
- ✅ Endpoint-level authorization matrix is defined (`docs/security/AUTHORIZATION_MATRIX.md`)
- ✅ Security event/audit event catalog is defined (`docs/security/AUDIT_EVENT_CATALOG.md`)

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

- ✅ Local file storage + LibreOffice + Bouncy Castle selected (ADR-0005)
- 🟡 ENIDOC package composition is defined at high level
- ❌ Conversion/signature failure handling and retry policy are defined
- ❌ XML/XSD validation workflow and error reporting contract are defined

Recommended next step:
- Create `docs/interoperability/ENIDOC_SPEC.md`.

---

## 9) Testing and Quality Gates

- ✅ Test strategy by module is documented (`docs/quality/TEST_STRATEGY.md`)
- ✅ CI quality gate blueprint is documented (`docs/quality/CI_COVERAGE_GATES.md`)
- ✅ Coverage scope and expectations are documented (`docs/quality/COVERAGE_SCOPE_MAP.md`)
- ✅ Backend domain model at 100% coverage (144 tests total)
- ✅ Back-office at 88.5% coverage (51 tests)
- 🟡 Front-end citizen at 42.5% coverage (58 tests) — below 80% target
- 🟡 Backend non-domain at 45% overall — below 80% target for controllers/services

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
