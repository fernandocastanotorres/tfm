# TFG Records Platform

Plataforma de gestion de expedientes electronicos con tres modulos:

- `backend/` (Spring Boot 3.4, Java 17)
- `front-end/` (Sede ciudadana Angular)
- `back-office/` (Backoffice Angular)

## Arranque rapido (Docker Compose)

```bash
docker compose up -d
```

Servicios principales:

- API: `http://localhost:8080/api/v1`
- Sede: `http://localhost:4200`
- Backoffice: `http://localhost:4300`
- Mailpit (UI de correo local): `http://localhost:8025`

## Correo transaccional en desarrollo

El proyecto usa SMTP local con Mailpit para verificacion de cuenta y notificaciones:

- SMTP host: `mailpit`
- SMTP port: `1025`
- UI de inspeccion: `http://localhost:8025`

Decision arquitectonica: ver `docs/adr/0014-local-email-delivery-with-mailpit-over-brevo.md`.

## Documentacion clave

- Vision general: `PROJECT-DOCUMENTATION.md`
- Requisitos: `REQUIREMENTS.md`
- Arquitectura: `docs/architecture/SYSTEM_DESIGN.md`
- Build y despliegue: `docs/DEPLOYMENT_AND_BUILD.md`
- ADRs: `docs/adr/INDEX.md`
