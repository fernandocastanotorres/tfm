# ADR-0004: Select Camunda 7 as the BPMN Engine

## Status
Superseded by ADR-0008

## Date
2026-05-13

## Context
The requirements allow Camunda 7/8 or Activiti. The project needs deterministic BPMN execution for administrative procedures, dynamic task-based UI (`taskId`), and straightforward integration with a Spring Boot monolith/modular backend under strict compliance constraints.

## Decision
We select **Camunda 7** as the BPMN 2.0 process engine.

## Rationale
### Why Camunda 7
- Mature embedded model with strong Spring Boot integration.
- Predictable transactional behavior for process + domain data interactions.
- Rich BPMN capabilities and stable operational patterns for human-task workflows.
- Lower operational overhead versus event-stream-first architectures for this scope.

### Why not Camunda 8 (for now)
- Strong for distributed, event-driven orchestration, but introduces extra operational complexity (Zeebe cluster model, different runtime patterns).
- Migration of team skills and platform model would increase delivery risk in early phases.

### Why not Activiti
- Smaller ecosystem momentum and fewer modern operational references compared with Camunda.
- Lower confidence in long-term ecosystem leverage for this project profile.

## Consequences
### Positive
- Faster delivery with lower platform complexity.
- Better fit for synchronous administrative task workflows.
- Clearer troubleshooting and supportability in initial project stages.

### Negative
- Less cloud-native horizontal orchestration flexibility than Camunda 8.
- Potential future migration effort if event-driven scale needs grow significantly.

## Revisit Criteria
Reevaluate this decision if:
- Process throughput/scale requires high-volume event streaming orchestration.
- Architecture evolves to independently deployed microservices with asynchronous choreography.
