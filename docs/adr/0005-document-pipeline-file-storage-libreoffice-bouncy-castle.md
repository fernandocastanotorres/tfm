# ADR-0005: Adopt File Storage + LibreOffice Headless + Bouncy Castle for Document Pipeline

## Status
Accepted (Revised)

## Date
2026-05-13

## Revised
2026-05-20

## Context
The system must support ENI-compliant documentary exchange, PDF/A preservation, and server-side electronic signature generation with system seal. Document custody and metadata traceability are critical.

## Decision
Use the following document pipeline:
- **Local file storage** for document persistence (filesystem-backed, configurable path)
- LibreOffice headless service (via JODConverter) for server-side PDF conversion
- **Bouncy Castle** library for CMS/PKCS#7 (PAdES-BES) signature generation

## Rationale
- **File storage** was chosen over Alfresco because Alfresco was not available as a Maven dependency and added excessive infrastructure complexity for a TFG scope. Local file storage with proper path management is sufficient for the current scale.
- LibreOffice headless is a practical and proven conversion backend for heterogeneous office formats.
- **Bouncy Castle** was chosen because SD-DSS was unavailable on Maven Central. Bouncy Castle provides equivalent PAdES-BES (Basic Electronic Signature) functionality with CMS/PKCS#7 detached signatures, which satisfies the TFG requirements.

## Consequences
### Positive
- Simpler infrastructure with fewer external dependencies.
- Bouncy Castle is well-maintained and widely used in the Java ecosystem.
- File storage is easy to backup and migrate.
- Self-contained deployment without Alfresco Content Services.

### Negative
- PAdES-BES (not XAdES-T or PAdES-T) — does not include timestamp from a TSA. Acceptable for TFG but would need enhancement for production ENI compliance.
- File storage lacks enterprise DMS features (versioning, metadata indexing, CMIS) that Alfresco would provide.
- Conversion/signature performance must be monitored and tuned under load.

## Alternatives Considered
- **Alfresco Content Services**: Rejected due to infrastructure complexity and Maven Central unavailability.
- **SD-DSS library**: Rejected because it was not available on Maven Central at the time of implementation.
- **Custom in-house repository and signature stack**: Rejected due to higher compliance and maintenance risk.
