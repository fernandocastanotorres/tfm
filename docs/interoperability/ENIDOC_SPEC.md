# ENIDOC Specification (ENI Exchange Package)

This document defines the `.enidoc` package contract for interoperability exchange.

It complements:
- `REQUIREMENTS.md`
- ADR-0005 (document pipeline)
- `docs/bpm/BPMN_CONVENTIONS.md`
- `docs/api/API_CONTRACT.md`

## 1) Scope

The ENIDOC package is a ZIP container used to exchange electronic records with ENI-compliant metadata and validation.

Mandatory goals:
- Include preservation-ready document artifacts
- Include detached signatures
- Include ENI-compliant XML index validated against official XSD schemas

## 2) Package Format

- Extension: `.enidoc`
- Physical format: ZIP
- Character encoding for XML and metadata files: UTF-8

Recommended package naming pattern:

`ENIDOC_<procedureUuid>_<yyyyMMddHHmmssZ>.enidoc`

Example:

`ENIDOC_2f7e90ad-486b-4d45-8297-37fc0b04fb33_20260513T183000Z.enidoc`

## 3) Internal Directory Layout

Minimum structure:

```text
/
  index.xml
  /documents
    <docUuid>.pdf
  /signatures
    <docUuid>.xsig
  /metadata
    checksums.json
```

Notes:
- If original source files are required by policy, include them in `/documents/original/`.
- `index.xml` remains authoritative for logical relationships.

## 4) Mandatory Contents

1. `index.xml` (ENI-compliant, XSD-valid)
2. At least one document artifact (PDF when conversion is required)
3. Detached signature file(s) (`.xsig`) for signed artifacts
4. Checksum manifest for integrity verification

## 5) ENI Metadata Mapping Rules

Metadata must be inferred from procedure/workflow context using deterministic mapping rules.

Minimum mapping fields (project baseline):
- `procedureUuid` -> package/procedure identifier
- `taskDefinitionKey` / process context -> ENI document type code
- actor context -> producer/issuer metadata
- timestamps -> creation/signature/exchange instants

Rule:
- Mapping logic must be documented, versioned, and testable.

## 6) XML Validation Contract

Validation sequence:

1. Build `index.xml` from domain metadata.
2. Validate against official ENI XSD set.
3. Fail package generation on validation error.
4. Return structured error response (`ENI-*` code family) with correlation ID.
5. Emit audit event (`ENI_INDEX_XML_VALID` / `ENI_INDEX_XML_INVALID`).

## 7) Signature and Integrity Rules

- Signature profile: CMS/PKCS#7 detached (PAdES-like in current implementation).
- Signature files must unambiguously reference signed document identifiers.
- Hash/checksum entries must cover:
  - signed document payload,
  - detached signature file,
  - `index.xml` (recommended).

Checksum policy recommendation:
- Use SHA-256 for manifest entries.

## 8) Error Handling and Retry Policy

Classify failures:

1. **Validation failures (non-retryable without data/process correction)**
   - ENI XSD mismatch
   - required metadata missing

2. **Transient dependency failures (retryable)**
   - DMS temporary outage
   - conversion/signature service timeout

3. **Permanent technical failures (investigate + fail fast)**
   - corrupted source artifact
   - incompatible input format outside supported policy

Retry policy baseline:
- Bounded retries with exponential backoff for transient failures only.
- Idempotent package generation key by `procedureUuid + packageIntent + version`.

## 9) API Contract Alignment

Related endpoints:
- `POST /api/v1/backoffice/procedures/{procedureUuid}/enidoc`
- `GET /api/v1/backoffice/procedures/{procedureUuid}/enidoc`

Response expectations:
- On success: package metadata + retrieval link/reference.
- On failure: canonical error shape from `ERROR_MODEL.md` with `ENI-*` code.

## 10) Audit and Traceability Requirements

Every ENIDOC generation attempt must record:
- `procedureUuid`
- actor (`user_id`, roles)
- generation decision (`ALLOW`/`DENY`)
- reason code
- validation outcome
- `correlationId`

Minimum event codes:
- `ENIDOC_BUILD_SUCCESS`
- `ENIDOC_BUILD_FAILURE`
- `ENI_INDEX_XML_VALID`
- `ENI_INDEX_XML_INVALID`

## 11) Test Requirements

Minimum automated checks:

1. Package contains all mandatory files.
2. `index.xml` validates against official XSDs.
3. Signature file linkage to document IDs is correct.
4. Checksum manifest verifies package integrity.
5. Failure modes return expected `ENI-*` error codes.
6. Audit events are emitted with correlation IDs.

## 12) Change Management

When ENI schemas or mapping rules change:

1. Version the mapping rules and update this spec.
2. Update API and error code references if behavior changes.
3. Update audit catalog when event semantics change.
4. Create/update ADR if architectural impact exists.
