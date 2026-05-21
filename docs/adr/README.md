# ADR Guidelines

This folder contains the project Architecture Decision Records (ADRs).

## Purpose
ADRs document **why** key technical decisions were made, what alternatives were considered, and what consequences were accepted.

## Naming Convention
- File pattern: `NNNN-short-kebab-case-title.md`
- Example: `0008-select-flowable-as-bpmn-engine.md`

## Recommended Structure
Each ADR should include at least:
- `Status`
- `Date`
- `Context`
- `Decision`
- `Rationale`
- `Consequences` (positive and negative)
- `Alternatives Considered`

## Status Lifecycle
- `Proposed`: Draft decision, pending review.
- `Accepted`: Approved and in force.
- `Superseded`: Replaced by a newer ADR.
- `Deprecated` (optional): No longer recommended, but not fully replaced.

## How to Change an Existing Decision
Do **not** rewrite historical ADRs to hide previous decisions.

Use this process:
1. Create a new ADR with a new sequential number.
2. Explain why the old decision is no longer valid.
3. In the old ADR, update status to `Superseded` and reference the new ADR.
4. In the new ADR, add a short note like: `Supersedes: ADR-000X`.

## Scope in This Project
Current ADR set covers:
- Modular architecture (Citizen UI / Backoffice UI / Core API)
- Frontend stack
- Backend and persistence stack
- BPM engine choice
- Document pipeline (storage, PDF conversion, signature)
- Containerized deployment topology
