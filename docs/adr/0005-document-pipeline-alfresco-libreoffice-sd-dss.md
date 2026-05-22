# ADR-0005: Adopt Alfresco + LibreOffice Headless + SD-DSS for Document Pipeline

## Status
Superseded (see revised [ADR-0005](./0005-document-pipeline-file-storage-libreoffice-bouncy-castle.md))

## Date
2026-05-13

## Context
The system must support ENI-compliant documentary exchange, PDF/A preservation, and server-side XAdES-T signature generation with system seal. Document custody and metadata traceability are critical.

## Decision
Use the following document pipeline:
- Alfresco Content Services as DMS (CMIS/REST integration)
- LibreOffice headless service for server-side PDF/A conversion
- SD-DSS library for XAdES-T signature generation

## Rationale
- Alfresco provides enterprise-grade repository/custody capabilities and integration standards.
- LibreOffice headless is a practical and proven conversion backend for heterogeneous office formats.
- SD-DSS aligns with EU signature standards and supports advanced signature profiles needed for administration.

## Consequences
### Positive
- Compliance-aligned archival and signature pipeline.
- Separation of concerns between business logic and document tooling.
- Easier interoperability package generation (.enidoc with index/signatures/documents).

### Negative
- Additional infrastructure footprint and operational dependencies.
- Conversion/signature performance must be monitored and tuned under load.

## Alternatives Considered
- Custom in-house repository and signature stack: rejected due to higher compliance and maintenance risk.
