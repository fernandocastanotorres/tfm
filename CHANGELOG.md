# Changelog

## 2026-05-20 - Mail runtime standardization (Mailpit)

### Added
- ADR-0014 (`docs/adr/0014-local-email-delivery-with-mailpit-over-brevo.md`) documenting the decision to use SMTP + Mailpit for project scope.
- Root `README.md` with quick-start and Mailpit access (`http://localhost:8025`).

### Changed
- Project docs aligned to local SMTP runtime (Mailpit) instead of Brevo/SendGrid assumptions:
  - `PROJECT-DOCUMENTATION.md`
  - `backend/README.md`
  - `docs/DEPLOYMENT_AND_BUILD.md`
  - `docs/architecture/SYSTEM_DESIGN.md`
  - `docs/architecture-diagrams.md`
  - `docs/README.md`
  - `REQUIREMENTS.md`
  - `docs/TFG-MEMORIA-TECNICA.md`
  - `docs/adr/INDEX.md`

### Rationale
- Ensure fully self-contained execution for TFG demos and validation.
- Remove external credential dependency from normal development flow.
- Improve reproducibility of verification-email and notification tests.
