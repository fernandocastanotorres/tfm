# ADR-0007: Adopt Hexagonal-Clean Boundaries Across Core Modules

## Status
Accepted

## Date
2026-05-13

## Context
The project already adopts a three-module architecture (Citizen UI, Backoffice UI, Core API) under ENS/ENI constraints. To keep long-term maintainability, compliance traceability, and low coupling, module separation alone is not enough; internal architectural boundaries must also be explicit.

## Decision
We adopt a **Hexagonal/Clean architectural style** with explicit boundaries and ownership rules:

1. **Core API**
   - Domain and application use-cases are framework-agnostic.
   - External systems (DB, BPM engine, storage/DMS, signature, conversion) are accessed through ports/adapters.
   - Security and audit are cross-cutting policies, not domain logic.

2. **Frontends (Citizen and Backoffice)**
   - Feature-based slicing with strict separation between presentation components and data-access/application services.
   - UI renders from backend contracts (JSON schema + workflow state), without embedding business rules that belong to backend processes.

3. **Integration Boundaries**
   - Only stable contracts cross module boundaries (REST DTOs/events/schema payloads).
   - No direct persistence or process-engine coupling from frontends.

## Rationale
- Preserves compliance-sensitive logic in controlled backend layers.
- Minimizes accidental coupling to frameworks/vendors.
- Improves testability by isolating domain/use-cases from infrastructure.
- Enables safer evolution (e.g., replacing BPM/DMS adapters with minimal core impact).

## Consequences
### Positive
- Clear ownership and dependency direction.
- Higher maintainability and easier onboarding.
- Better resilience to technology changes in infrastructure adapters.

### Negative
- More upfront design discipline and boilerplate.
- Requires review rigor to prevent layer violations.

## Alternatives Considered
- Layered architecture without ports/adapters: rejected due to higher long-term coupling with infrastructure frameworks.
- “Pragmatic mixed” architecture: rejected because blurred boundaries increase compliance and maintenance risk.

## Revisit Criteria
Reevaluate if:
- Team size/scope becomes too small for boundary overhead to be justified, or
- Delivery metrics show architecture ceremony is consistently harming lead time without quality gains.

## Supersedes / Superseded by
- Complements: ADR-0001
