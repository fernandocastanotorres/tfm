# ADR-0008: Select Flowable as the BPMN Engine

## Status
Accepted

## Date
2026-05-17

## Context
The running implementation already uses Flowable dependencies and process bootstrap in Spring Boot. Existing documentation still referenced Camunda 7, creating decision drift and onboarding confusion.

## Decision
Standardize the BPM engine to **Flowable embedded in Spring Boot**.

## Rationale
- Matches actual runtime dependencies and configuration.
- Keeps embedded operational model aligned with current monolithic backend.
- Avoids architectural ambiguity in BPM conventions, testing, and troubleshooting.

## Consequences
### Positive
- Documentation and implementation become consistent.
- Lower onboarding and maintenance risk.
- BPM integration/testing guidance can target one concrete engine.

### Negative
- Prior Camunda-specific wording in docs/tests must be updated.
- Future migration to another engine would require explicit migration ADR.

## Supersedes
- ADR-0004 (Camunda 7 selection).

## Revisit Criteria
Reevaluate if:
- process scaling requires a different distributed orchestration model,
- organizational constraints require vendor/tooling consolidation around another engine.
