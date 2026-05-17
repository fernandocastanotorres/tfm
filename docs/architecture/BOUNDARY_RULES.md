# Boundary Rules (Hexagonal/Clean Enforcement)

This document operationalizes ADR-0001 and ADR-0007 with concrete rules for implementation and review.

## 1) Dependency Direction (Mandatory)

For the Core API, dependencies must flow inward:

1. `domain` -> depends on nothing internal (no frameworks, no infra)
2. `application` -> may depend on `domain`
3. `adapters/infrastructure` -> may depend on `application` and `domain`
4. `entrypoints` (REST/controllers) -> may depend on `application` (never on infra internals)

Rule: outer layers can depend on inner layers; inner layers must never depend on outer layers.

## 2) Allowed vs Forbidden Dependencies

| From | To | Allowed | Notes |
|---|---|---:|---|
| domain | Spring/JPA/Flowable/Alfresco SDK | No | Keep domain framework-agnostic |
| application | domain | Yes | Use-case orchestration |
| application | controllers | No | No web coupling |
| infrastructure adapters | application/domain | Yes | Implement ports |
| controllers | application | Yes | Input mapping + use-case execution |
| frontends | DB/BPM engine | No | Frontends consume backend contracts only |
| citizen-ui | backoffice-ui code | No | Separate deployable modules |

## 3) Module Ownership and Change Boundaries

- `citizen-ui`: public-facing workflows and status tracking UI.
- `backoffice-ui`: internal task processing and admin UI.
- `core-api`: domain/application logic, contracts, security, audit.
- `integration adapters`: BPM, DMS, signature, conversion, persistence implementations.

Cross-boundary changes (e.g., API contract changes impacting both frontends) require explicit reviewer acknowledgment from affected module owners.

## 4) Contract-First Rules (UI <-> API)

1. API contracts and JSON schemas are source of truth.
2. Frontends must not embed BPM decision logic that belongs to backend workflows.
3. Contract-breaking changes require:
   - versioning or compatibility strategy,
   - migration note,
   - update of affected ADR/tech docs when significant.

## 5) Backend Structural Standard

Recommended package layout (adapt names to final code style):

- `.../domain` -> entities, value objects, domain services, domain policies
- `.../application` -> use cases, ports, command/query handlers
- `.../infrastructure` -> adapters (JPA repos, Flowable, Alfresco, DSS, converters)
- `.../entrypoints` -> REST controllers, request/response mappers

Rules:
- No business rules in controllers.
- No framework annotations in pure domain classes unless unavoidable and documented.

## 6) Frontend Boundary Rules

1. Prefer feature-sliced organization per module.
2. Separate presentation components from data-access/application services.
3. Components should not call HTTP clients directly when a feature service exists.
4. Dynamic form rendering follows backend-provided schema/task context.

## 7) Cross-Cutting Policies

- Security (JWT/RBAC) enforcement is mandatory at backend entrypoints and use-case authorization points.
- Audit trail fields are mandatory for sensitive actions: `timestamp`, `user_id`, `action`, `resource_uuid`, `client_ip`, `app_context`.
- UUID v4 is required for public identifiers.

## 8) PR Architecture Checklist

Before merging, verify:

- [ ] Dependency direction is preserved.
- [ ] No forbidden cross-layer/module coupling introduced.
- [ ] API/schema contract changes are versioned or documented.
- [ ] Security and audit requirements are preserved.
- [ ] ADR/documentation updated when decision-level impact exists.

## 9) Fitness Checks (Automation Guidance)

Recommended automation:

- Backend: architecture tests (e.g., ArchUnit) to enforce package/layer rules.
- Frontend: lint rules for module boundaries and import constraints.
- CI: fail when forbidden dependencies or boundary violations are detected.

## 10) Exception Process

If a boundary exception is unavoidable:

1. Open a short architecture exception note (issue/ADR reference).
2. Explain scope, risk, and rollback plan.
3. Add expiration/review date.
4. Track removal as explicit technical debt.
