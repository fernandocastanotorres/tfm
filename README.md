# TFM Records — Plataforma de Gestión de Expedientes Electrónicos

Plataforma completa de administración electrónica para la tramitación de expedientes, cumpliendo con el **Esquema Nacional de Seguridad (ENS) Nivel Medio** y el **Esquema Nacional de Interoperabilidad (ENI)**.

## a. Descripción general

TFM Records permite a los ciudadanos iniciar, firmar y hacer seguimiento de trámites administrativos desde una sede electrónica accesible 24/7. Los tramitadores gestionan los expedientes desde un backoffice unificado, con flujos de trabajo automatizados mediante BPMN.

**Marco normativo:**

- **Ley 39/2015** — Procedimiento Administrativo Común de las Administraciones Públicas
- **Ley 40/2015** — Régimen Jurídico del Sector Público
- **ENS** — RD 311/2022, Nivel Medio (20 medidas de seguridad)
- **ENI** — RD 4/2010 + Normas Técnicas de Interoperabilidad
- **eIDAS** — Reglamento UE 910/2014 de firma electrónica

**Tres módulos independientes:**

| Módulo | Descripción | Usuarios |
|--------|-------------|----------|
| `front-end/` | Sede electrónica — portal ciudadano | Ciudadanos |
| `back-office/` | Backoffice — gestión interna | Tramitadores y administradores |
| `backend/` | API REST — núcleo de negocio, BPMN, firmas | (consumido por los frontends) |

## b. Stack tecnológico

### Backend (Spring Boot 3.4)

| Tecnología | Uso |
|-----------|-----|
| Java 17, Spring Boot 3.4.5 | Framework principal |
| Spring Security 6 + JWT (jjwt 0.12) | Autenticación y autorización stateless |
| Flowable 7.0.1 | Motor de workflow BPMN 2.0 |
| JPA / Hibernate + PostgreSQL 16 | Persistencia y ORM |
| Bouncy Castle 1.84 | Firma electrónica CMS/PKCS#7 |
| JODConverter 4.4 + LibreOffice | Conversión de documentos a PDF |
| OpenPDF 1.3, ZXing 3.5 | Generación de PDFs y códigos QR |
| Caffeine | Caché en memoria |
| Flyway | Migraciones de base de datos |
| Springdoc OpenAPI 2.8 | Documentación Swagger de la API |
| Micrometer + Prometheus | Métricas de aplicación |
| Logstash Logback Encoder | Logs estructurados en JSON |
| Testcontainers, JUnit 5, Mockito | Testing |

### Frontends (Angular 20)

| Tecnología | Uso |
|-----------|-----|
| Angular 20.3, TypeScript 5.x | Framework SPA |
| Angular Material CDK 20 | Componentes de interfaz accesibles |
| Tailwind CSS 3.4 | Estilos utilitarios |
| ngx-translate 16.x | Internacionalización (5 idiomas) |
| RxJS 7, Zone.js 0.15 | Programación reactiva |
| Chart.js 4.4 + ng2-charts | Gráficos del dashboard de backoffice |
| jsPDF 4.2, SweetAlert2, intro.js | PDFs, diálogos y tours guiados |
| Playwright, Jasmine, Karma | Testing E2E y unitario |

### Infraestructura y observabilidad

| Tecnología | Uso |
|-----------|-----|
| Docker Compose | Orquestación multi-servicio (11 contenedores) |
| nginx 1.25 | Reverse proxy central con SSL termination |
| PostgreSQL 16 Alpine | Base de datos |
| Grafana 11 + Loki 3.0 + Promtail | Dashboards y agregación de logs |
| Prometheus 2.53 + cAdvisor | Métricas de sistema y contenedores |
| Mailpit | Servidor SMTP local para desarrollo |

## c. Instalación y ejecución

### Requisitos previos

- Docker Engine 24+ y Docker Compose v2
- Java 17+ (solo para desarrollo sin Docker)
- Node.js 20+ y npm (solo para desarrollo de frontends sin Docker)
- Maven 3.9+ (solo para desarrollo backend sin Docker)

### Arranque rápido con Docker Compose

```bash
# 1. Clonar el repositorio
git clone https://github.com/fernandocastanotorres/tfm.git
cd tfm

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con las contraseñas deseadas (o usar las de ejemplo para desarrollo local)

# 3. Levantar todos los servicios
docker compose up -d
```

**Servicios expuestos tras el arranque:**

| Servicio | URL local | Producción |
|----------|-----------|------------|
| Sede electrónica | `http://localhost:4200` | `https://sede.nbpdev.es` |
| Backoffice | `http://localhost:4300` | `https://tramitador.nbpdev.es` |
| Backend API | `http://localhost:8080/api/v1` | `https://api.nbpdev.es/api/v1` |
| Swagger UI | `http://localhost:8080/api/v1/swagger-ui.html` | No expuesto en prod |
| Grafana | `http://localhost:3000` | `https://grafana.nbpdev.es` |
| Prometheus | `http://localhost:9090` | `https://prometheus.nbpdev.es` |
| Mailpit | `http://localhost:8025` | `https://mail.nbpdev.es` |

### Desarrollo por módulo (sin Docker)

**Backend:**

```bash
cd backend
# Con perfil dev usa H2 en memoria (no necesita PostgreSQL)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Sede electrónica:**

```bash
cd front-end
npm install
npm start
# Abrir http://localhost:4200
```

**Backoffice:**

```bash
cd back-office
npm install
npm start
# Abrir http://localhost:4300
```

### Variables de entorno principales

| Variable | Descripción | Default (local) |
|----------|-------------|-----------------|
| `DB_URL` | JDBC URL de PostgreSQL | `jdbc:postgresql://localhost:5432/records_db` |
| `DB_USERNAME` | Usuario de base de datos | `records_user` |
| `DB_PASSWORD` | Contraseña de base de datos | (obligatorio en `.env`) |
| `JWT_SECRET` | Clave de firma de tokens JWT | (obligatorio en `.env`) |
| `SIGNING_KEYSTORE_PASSWORD` | Contraseña del keystore de firma | `changeit` |
| `GRAFANA_PASSWORD` | Contraseña de Grafana | `admin` |
| `APP_CORS_ALLOWED_ORIGINS` | Orígenes CORS permitidos | `http://localhost:4200,http://localhost:4300` |

## d. Estructura del proyecto

```
tfm/
├── backend/                          # API REST Spring Boot 3.4
│   ├── src/main/java/es/tfm/records/
│   │   ├── domain/                   #   Núcleo de negocio (modelos + puertos)
│   │   │   ├── model/                #     Procedure, Document, User, CaseStatus...
│   │   │   └── port/                 #     Interfaces de repositorio
│   │   ├── application/              #   Casos de uso
│   │   │   ├── service/              #     25 servicios (Case, Signature, Workflow...)
│   │   │   ├── dto/                  #     Objetos de transferencia
│   │   │   ├── exception/            #     Jerarquía RecordsException
│   │   │   └── mapper/               #     Mapeo entidad ↔ DTO
│   │   ├── infrastructure/           #   Adaptadores concretos
│   │   │   ├── persistence/entity/   #     26 entidades JPA
│   │   │   ├── persistence/repository/ #   Spring Data repos
│   │   │   ├── config/               #     SecurityConfig, CORS...
│   │   │   ├── security/             #     JWT, filtros, rate limiting
│   │   │   ├── storage/              #     FileStorageService
│   │   │   ├── mailing/              #     EmailGateway
│   │   │   ├── audit/                #     AuditService async
│   │   │   └── jobs/                 #     Tareas programadas
│   │   └── entrypoints/              #   Controladores REST
│   │       ├── controller/           #     16 controladores
│   │       └── advice/               #     GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── db/migration/             #     Migraciones Flyway (V1–V15)
│   │   ├── processes/                #     Definiciones BPMN (Flowable)
│   │   └── eni/xsd/                  #     XSD oficial ENI para validación
│   └── src/test/                     #   Tests unitarios e integración
├── front-end/                        # Sede electrónica Angular 20
│   └── src/app/
│       ├── adapters/
│       │   ├── components/           #     36 componentes (wizard, docs, messages...)
│       │   └── routes/               #     Rutas públicas, auth y protegidas
│       ├── application/services/     #     41 servicios (auth, cases, signatures...)
│       └── domain/models/            #     Modelos de dominio
├── back-office/                      # Backoffice Angular 20
│   └── src/app/
│       ├── adapters/components/      #     16 componentes (dashboard, tasks, admin...)
│       └── application/services/     #     26 servicios
├── infrastructure/
│   ├── nginx/                        # Configuración nginx (prod + dev)
│   ├── grafana/provisioning/         # Dashboards, datasources y alertas
│   ├── loki/                         # Configuración Loki
│   ├── prometheus/                   # Configuración Prometheus
│   └── promtail/                     # Configuración Promtail
├── docs/
│   ├── adr/                          # 19 ADRs documentados
│   ├── architecture/                 # Diseño del sistema, hexagonal
│   ├── security/                     # Catálogo de auditoría, matriz de autorización
│   ├── interoperability/             # Especificación ENIDOC
│   └── quality/                      # Estrategia de testing
├── performance/                      # Scripts de pruebas de carga (k6)
├── docker-compose.yml                # Orquestación de 11 servicios
├── docker-compose.override.yml       # Overrides para desarrollo
├── .env.example                      # Plantilla de variables de entorno
└── guion-video.md                    # Guión para presentación del TFM
```

## e. Funcionalidades principales

### Para el ciudadano (Sede electrónica)

- **Catálogo de procedimientos** con búsqueda, filtros y flujo visual del trámite
- **Asistente dinámico multi-paso** con formularios generados desde esquema JSON
- **Subida de documentos** con drag & drop y previsualización
- **Borrador automático** — el expediente se guarda y puede retomarse después
- **Firma electrónica CMS/PKCS#7** — los documentos se firman criptográficamente al confirmar el expediente
- **Documento resumen firmado** con código QR y CSV para verificación pública
- **Mensajería bidireccional** con el tramitador asignado
- **Notificaciones** por correo electrónico en cada cambio de estado
- **Verificación CSV pública** sin autenticación (art. 16.4 Ley 39/2015)
- **Portal de transparencia** con métricas de actividad en tiempo real
- **i18n** en 5 idiomas (español, inglés, catalán, gallego, euskera)
- **WCAG 2.1 AA** — navegación por teclado, roles ARIA, contraste validado

### Para el tramitador (Backoffice)

- **Dashboard con KPIs** (Chart.js): expedientes por estado, carga de trabajo, tiempo medio de resolución
- **Bandeja de tareas BPMN** — revisión, aprobación, rechazo, devolución a subsanación
- **SLA tracking** con timer de 48 horas y escalado automático a administrador
- **Workflow realista** con bifurcaciones, paralelismo y amendment loop
- **Gestión de usuarios y roles** (ROLE_CITIZEN, ROLE_TRAMITADOR, ROLE_ADMIN)
- **Administración de tipos de procedimiento** y esquemas de formulario
- **Notificaciones electrónicas** y gestión de contenido público

### Pipeline de documentos electrónicos

```
Upload → Conversión PDF (LibreOffice) → Firma CMS/PKCS#7 (Bouncy Castle)
       → Registro (NRE/RS atómico) → PDF Resumen firmado (QR + CSV)
       → Paquete ENIDOC (.enidoc) validado contra XSD oficial ENI
```

### Cumplimiento normativo

- **ENS Nivel Medio**: 10 medidas de seguridad implementadas (autenticación JWT, RBAC, auditoría inmutable, TLS, rate limiting, cabeceras de seguridad, bloqueo de cuenta, política de contraseñas)
- **ENI**: metadatos en PostgreSQL, paquete ENIDOC con validación XSD, CSV de verificación
- **Auditoría**: 24 eventos categorizados (AUTH, WORKFLOW, DOC, ENI, ADMIN), escritura asíncrona, tabla inmutable
- **Observabilidad**: logs JSON estructurados, métricas Prometheus, dashboards Grafana, correlation ID transversal

## f. Usuarios y contraseñas de prueba

Los siguientes usuarios se crean automáticamente al inicializar la base de datos (`DataInitializer.java`):

| Email | Contraseña | Rol | Acceso |
|-------|-----------|-----|--------|
| `admin@tfm.es` | `Admin1234` | ROLE_ADMIN, ROLE_CITIZEN | Sede + Backoffice (todos los permisos) |
| `citizen@tfm.es` | `Citizen1` | ROLE_CITIZEN | Sede electrónica |

**Otros servicios:**

| Servicio | Usuario | Contraseña |
|----------|---------|-------------|
| Grafana | `admin` | `admin` |
| PostgreSQL | `records_user` | (definida en `.env`) |
| Prometheus | *sin auth* | — |
| Mailpit | *sin auth* | — |

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md) | Visión técnica completa del proyecto |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Requisitos funcionales y de compliance |
| [docs/architecture/SYSTEM_DESIGN.md](docs/architecture/SYSTEM_DESIGN.md) | Diseño del sistema y reglas de dependencia |
| [docs/DEPLOYMENT_AND_BUILD.md](docs/DEPLOYMENT_AND_BUILD.md) | Build, despliegue y pipeline CI/CD |
| [docs/USER-MANUAL.md](docs/USER-MANUAL.md) | Manual de usuario final |
| [docs/DEFENSE-DEMO-SCRIPT.md](docs/DEFENSE-DEMO-SCRIPT.md) | Guion de defensa del TFM |
| [docs/adr/INDEX.md](docs/adr/INDEX.md) | Índice de 19 ADRs |
| [docs/SECURITY.md](docs/SECURITY.md) | Cumplimiento ENS + OWASP Top 10 |
| [docs/security/AUDIT_EVENT_CATALOG.md](docs/security/AUDIT_EVENT_CATALOG.md) | Catálogo de 24 eventos de auditoría |
| [docs/interoperability/ENIDOC_SPEC.md](docs/interoperability/ENIDOC_SPEC.md) | Especificación del paquete ENIDOC |
| [docs/quality/TEST_STRATEGY.md](docs/quality/TEST_STRATEGY.md) | Estrategia de testing y cobertura |
| [guion-video.md](guion-video.md) | Guión para presentación en vídeo |
