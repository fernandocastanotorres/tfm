# BPMN Conventions (Flowable)

This document defines BPMN modeling, deployment, and runtime conventions for the platform.

It complements:
- ADR-0008 (Flowable selection)
- `docs/api/API_CONTRACT.md`
- `docs/security/AUTHORIZATION_MATRIX.md`

## 1) Scope and Goals

Goals:
- Consistent process modeling across teams
- Predictable task-to-UI/API integration
- Safer versioning and deployments
- Better auditability and maintainability

## 2) Process Definition Naming

Use this pattern:

- `processDefinitionKey`: `<domain>_<procedure>_v<major>`
  - Example: `citizen_registry_update_v1`

Rules:
- Lowercase snake_case only.
- No environment-specific names in process keys.
- Major version in key only when functional flow breaks compatibility.

## 3) BPMN Element Naming Rules

- Service tasks: `svc_<verb>_<object>` (e.g., `svc_generate_enidoc`)
- User tasks: `usr_<role>_<action>` (e.g., `usr_processor_validate_docs`)
- Gateways: `gw_<decision_subject>` (e.g., `gw_documents_complete`)
- Events: `evt_<type>_<context>` (e.g., `evt_msg_citizen_amendment_received`)

Each user task must have:
- `taskDefinitionKey` stable across minor updates
- Clear display name for business users

## 4) Variable Conventions

## 4.1 Core Variables

Minimum required process variables:
- `procedureUuid` (UUID v4)
- `citizenUserId`
- `currentTaskId`
- `procedureState`
- `eniMetadata` (object)
- `documents` (array metadata)
- `correlationId`

## 4.2 Naming and Typing

- Use camelCase for variable names.
- Prefer primitive + JSON object structures over Java-specific serialized objects.
- Avoid storing sensitive raw content in process variables when a reference is enough.

## 5) Task-to-UI Contract

For each user task exposed to UI, backend must provide:
- `taskId`
- `taskDefinitionKey`
- `schemaVersion`
- `formSchema`
- `uiSchema` (optional)
- `initialData` (optional)
- `allowedActions`

Rule:
- UI must not infer business transitions outside `allowedActions`.

## 6) State Transition Policy

- Procedure state updates must happen in explicit workflow transitions.
- Illegal transitions must fail with deterministic domain errors (`409` with state code mapping).
- Amendment loops must use explicit BPMN branches and event history.

## 7) Error Handling in Processes

Use explicit BPMN error boundaries for:
- PDF/A conversion failures
- Signature failures
- ENI XML validation failures
- External dependency timeouts

Rules:
- Classify retryable vs non-retryable errors.
- Emit audit events on failure and recovery actions.

## 8) Deployment and Versioning

## 8.1 Packaging

- Bundle BPMN and required forms/config artifacts together per deployment unit.
- Keep deployment manifest with process keys and versions.

## 8.2 Versioning

- Minor non-breaking modeling adjustments can reuse major process family.
- Breaking flow changes require new major key or explicit migration strategy.

## 8.3 Migration

For running instances:
- define whether to keep on old version or migrate,
- document migration preconditions,
- test migration paths in staging before production.

## 9) Authorization in Workflow Actions

- User task claim/complete operations must enforce role checks and assignment policy.
- Sensitive task completions (approval/signature/finalization) require explicit authorization validation in backend use-case layer.

## 10) Audit Requirements for BPM Actions

At minimum, audit these events:
- task claimed
- task completed
- return for amendment
- process suspended/resumed
- process completed
- process error/failure path entered

Include `correlationId`, `procedureUuid`, actor, decision, and reason code.

## 11) Modeling Quality Checklist

Before deployment:
- [ ] All tasks/events/gateways follow naming rules
- [ ] All user tasks have stable `taskDefinitionKey`
- [ ] Variable contract documented and validated
- [ ] Error boundaries defined for external calls
- [ ] Authorization-sensitive transitions identified
- [ ] Audit event points mapped

## 12) Change Management

When changing BPMN definitions:

1. Update this conventions document if rules evolve.
2. Update API/UI task contract docs if payload shape changes.
3. Update authorization and audit catalogs if action semantics change.
4. Add/adjust ADR when change is architectural.
