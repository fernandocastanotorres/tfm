# ADR-0001: Adopt a Three-Module Architecture (Citizen UI, Backoffice UI, Core API)

## Status
Accepted

## Date
2026-05-13

## Context
The project must satisfy ENS (Medium), ENI interoperability, WCAG 2.1 AA, BPMN-driven workflows, and long-term document preservation/signature requirements. The requirements also separate citizen-facing and internal processing use cases.

## Decision
We will implement a decoupled architecture with three core modules:
1. Public Frontend (Citizen)
2. Private Backoffice (Processor/Admin)
3. Core Backend API

## Rationale
- Separates security boundaries and role exposure (citizen vs internal users).
- Enables independent release cadence for UX-heavy modules vs process/integration-heavy backend.
- Reduces coupling between public UX changes and core legal/compliance flows.
- Aligns naturally with ENS traceability and least-privilege principles.

## Consequences
### Positive
- Better maintainability and team specialization.
- Clear API contract for dynamic forms and workflow tasks.
- Easier scaling and incident isolation per module.

### Negative
- More deployment units and environment complexity.
- Requires stronger API/version governance.

## Alternatives Considered
- Monolithic full-stack app: rejected due to weaker boundary control and lower operational flexibility.
