# Guión de Defensa - Plataforma de Expedientes Electrónicos

> **TFG - Sistema de Gestión de Expedientes Electrónicos con Cumplimiento ENS/ENI**
> Duración estimada: 20-25 minutos | Preparado: Mayo 2026

---

## 0. Preparación previa (antes de la defensa)

### 0.1 Arranque del entorno

```bash
# Desde la raiz del proyecto TFG/
docker compose up -d
```

Esperar ~30 segundos a que todos los servicios estén saludables.

### 0.2 URLs de referencia

| Servicio | URL | Uso en demo |
|----------|-----|-------------|
| Sede ciudadana | `http://localhost:4200` | Portal ciudadano |
| Backoffice | `http://localhost:4300` | Panel de administración |
| API REST | `http://localhost:8080/api/v1` | Backend |
| Mailpit (correo) | `http://localhost:8025` | Bandeja de correo local |

### 0.3 Credenciales de demostración

| Rol | Email | Contraseña |
|-----|-------|------------|
| Ciudadano | `citizen@sede.local` | `Citizen1234!` |
| Tramitador | `tramitador@ayto.local` | `Tramitador1234!` |
| Administrador | `admin@sede.local` | `Admin1234!` |

> **Nota:** Si las credenciales no funcionan, registrar un nuevo ciudadano desde la sede (`/sede/registro`).

---

## 1. Introducción y Arquitectura (2-3 min)

### Qué decir

> "Este TFG consiste en una plataforma completa de gestión de expedientes electrónicos para la administración pública, diseñada con cumplimiento del Esquema Nacional de Seguridad (nivel medio) y del Esquema Nacional de Interoperabilidad."

### Puntos clave a mencionar

- **Arquitectura hexagonal** (Ports & Adapters) con separación clara de responsabilidades
- **Tres módulos independientes:**
  - Backend: Spring Boot 3.4, Java 17, API REST
  - Frontend ciudadano: Angular 18, Tailwind CSS
  - Backoffice: Angular 18, Tailwind CSS
- **Motor de procesos:** Flowable 7.0.1 (BPMN 2.0)
- **Base de datos:** PostgreSQL 16 con Flyway para migraciones
- **Despliegue:** Docker Compose con 5 servicios orquestados

### Diagrama rápido (si hay proyector)

```
Ciudadano (Angular) ──┐
                       ├──► API REST (Spring Boot + Flowable) ──► PostgreSQL
Backoffice (Angular) ──┘                                         │
                                                                 ├── Mailpit (email)
                                                                 └── File Storage (docs)
```

---

## 2. Portal Ciudadano - Sede Electrónica (5-7 min)

### 2.1 Página pública

**URL:** `http://localhost:4200`

**Demostrar:**
1. Navegar por la página de inicio
2. Mostrar el catálogo de trámites disponibles
3. Acceder a secciones públicas:
   - Información institucional
   - Preguntas frecuentes (FAQ)
   - Calendario de eventos
   - Transparencia (informes y métricas)
   - Legislación
   - Glosario
   - Directorio de organismos

**Qué destacar:**
- Diseño responsive
- Internacionalización: cambiar entre los 5 idiomas (ES, CA, EU, GL, VA)
- Accesibilidad: navegación por teclado, estructura semántica

### 2.2 Registro y autenticación

**Demostrar:**
1. Click en "Iniciar sesión" → "Registrarse"
2. Rellenar formulario de registro con datos válidos
3. Explicar política de contraseñas: ≥8 caracteres, 1 minúscula, 1 mayúscula, 1 número, 1 carácter especial
4. Mostrar email de verificación en Mailpit (`http://localhost:8025`)
5. Verificar la cuenta (click en enlace o código OTP)
6. Iniciar sesión con las credenciales

**Qué destacar:**
- Validación en tiempo real de formularios
- Protección contra fuerza bruta (rate limiting)
- Verificación de email obligatoria
- Recuperación de contraseña con token por email

### 2.3 Dashboard ciudadano

**Demostrar:**
1. Tras login, se muestra el dashboard personal
2. Explicar las secciones:
   - Mis expedientes (lista con estados)
   - Notificaciones
   - Accesos rápidos

### 2.4 Crear un expediente nuevo

**Demostrar:**
1. Ir al catálogo de trámites
2. Seleccionar un procedimiento (ej: "Solicitud de licencia")
3. Rellenar el formulario dinámico (generado desde JSON Schema)
4. Subir documentos requeridos (drag & drop o selector)
5. Guardar como borrador o enviar directamente

**Qué destacar:**
- Formularios dinámicos basados en JSON Schema por tipo de trámite
- Validación de tipos MIME y tamaños de archivo
- Estados del expediente: BORRADOR → ENVIADO → EN TRAMITACIÓN → RESUELTO

### 2.5 Seguimiento de expediente

**Demostrar:**
1. Abrir un expediente existente
2. Mostrar la línea temporal (timeline) con todos los eventos
3. Ver documentos asociados
4. Mostrar sistema de mensajería (1 hilo por expediente, con adjuntos)
5. Responder a una solicitud de subsanación (amendment)

**Qué destacar:**
- Timeline inmutable con auditoría
- Mensajería integrada con paginación (10/20/50 mensajes)
- Soporte para adjuntos en mensajes
- Estados visuales con colores

### 2.6 Búsqueda de expedientes

**Demostrar:**
1. Ir a la sección de búsqueda
2. Buscar un expediente por identificador (UUID)
3. Mostrar resultados

### 2.7 Perfil de usuario

**Demostrar:**
1. Acceder al perfil
2. Mostrar datos personales
3. Opción de modificar datos

---

## 3. Backoffice - Panel de Administración (5-7 min)

### 3.1 Login y Dashboard

**URL:** `http://localhost:4300`

**Demostrar:**
1. Login como tramitador o admin
2. Dashboard con estadísticas generales:
   - Expedientes por estado
   - Gráficos de actividad
   - Métricas clave

### 3.2 Gestión de expedientes

**Demostrar:**
1. Ir a "Expedientes"
2. Mostrar lista con filtros (estado, tipo, fecha)
3. Abrir un expediente para ver detalle
4. Revisar documentos y timeline

### 3.3 Resolución de tareas

**Demostrar:**
1. Ir a "Mis tareas"
2. Mostrar tareas pendientes (FORM, REVIEW, UPLOAD)
3. Abrir una tarea de revisión
4. Validar/rechazar documentos
5. Resolver el expediente (APROBADO / RECHAZADO)

**Qué destacar:**
- Motor BPMN Flowable gestiona el flujo de trabajo
- Ciclos de subsanación: devolver al ciudadano para corrección
- Cada tarea tiene su propio esquema de formulario

### 3.4 Gestión de usuarios (solo Admin)

**Demostrar:**
1. Ir a "Gestión de usuarios"
2. Mostrar lista de usuarios con roles
3. Crear un nuevo usuario (tramitador)
4. Asignar/revocar roles
5. Activar/desactivar usuarios
6. Mostrar "último acceso" (columna real, no hardcoded)

**Qué destacar:**
- Auditoría de cambios de rol y estado
- Rate limiting en operaciones de escritura (20 req/min)
- Política de contraseñas segura

### 3.5 Gestión de tipos de procedimiento

**Demostrar:**
1. Ir a "Catálogo de trámites"
2. Mostrar tipos existentes
3. Editar un tipo de procedimiento
4. Gestionar traducciones de campos (i18n)

**Qué destacar:**
- Traducciones persistentes en base de datos
- 5 idiomas soportados simultáneamente
- Formularios dinámicos por tipo de tarea

### 3.6 Estadísticas y exportación

**Demostrar:**
1. Ir a "Estadísticas"
2. Mostrar gráficos de actividad
3. **Exportar informe PDF** (botón de exportación)

**Qué destacar:**
- Generación de PDF con OpenPDF
- Datos reales de la plataforma

### 3.7 Buzón de contacto (solo Backoffice)

**Demostrar:**
1. Ir a "Buzón de contacto"
2. Mostrar mensajes ciudadanos recibidos
3. Responder a un mensaje

**Qué destacar:**
- Exclusivo del backoffice (no visible para ciudadanos)
- Gestión centralizada de consultas

### 3.8 Gestión de contenido público

**Demostrar:**
1. Ir a "Contenido público"
2. Editar contenido de páginas públicas (FAQ, institucional, etc.)

---

## 4. Características Técnicas Clave (4-5 min)

### 4.1 Firma electrónica

**Qué demostrar:**
1. Explicar el sistema de firma PAdES-BES con Bouncy Castle
2. Certificado de servicio: RSA 2048, SHA-256
3. Endpoint de firma: `POST /citizen/signatures/sign`
4. Endpoint de verificación: `POST /citizen/signatures/verify`

**Qué destacar:**
- Firma CMS/PKCS#7 detached
- Cálculo de digest SHA-256
- Información del certificado disponible

### 4.2 Paquete ENI (.enidoc)

**Qué demostrar:**
1. Abrir un expediente RESUELTO (APROBADO o RECHAZADO)
2. Descargar el paquete `.enidoc` (endpoint: `GET /citizen/cases/{id}/enidoc`)
3. Explicar el contenido del ZIP:
   - Documentos PDF
   - Firmas desprendidas (.xsig)
   - `index.xml` válido contra XSD oficial ENI
   - `justificante.txt`

**Qué destacar:**
- Cumplimiento ENI (Esquema Nacional de Interoperabilidad)
- Namespace: `http://administracionelectronica.gob.es/ENI/XSD/v1.0`
- Hashes SHA-256 para integridad
- Solo disponible para expedientes resueltos

### 4.3 Auditoría inmutable (ENS)

**Qué demostrar:**
1. Explicar el catálogo de eventos de auditoría:
   - LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, SIGN
2. Cada evento registra: timestamp, user_id, acción, resource_uuid, IP, contexto
3. Los cambios de rol/estado en backoffice se auditan automáticamente

**Qué destacar:**
- Cumplimiento ENS Nivel Medio
- Log inmutable (solo escritura, sin borrado)
- Trazabilidad completa de accesos y modificaciones

### 4.4 Sistema de correo (Mailpit)

**Qué demostrar:**
1. Abrir `http://localhost:8025`
2. Mostrar emails recibidos (verificación, notificaciones, reset de contraseña)
3. Explicar que es SMTP local autocontenido

**Qué destacar:**
- Sin dependencia de servicios externos (SaaS)
- Configuración SMTP estándar (host, puerto, auth, TLS)
- Determinístico para demos y pruebas

### 4.5 Internacionalización completa

**Qué demostrar:**
1. En sede: cambiar idioma en el selector (header)
2. Mostrar que todo el contenido se traduce:
   - Catálogo de trámites
   - Formularios
   - Interfaz de usuario
   - Backoffice (5 archivos i18n completos)

**Qué destacar:**
- 5 idiomas: Español, Catalán, Euskera, Gallego, Valenciano
- Traducciones en base de datos + fallback a bundles
- `Accept-Language` para catálogo

---

## 5. Seguridad y Cumplimiento (2-3 min)

### 5.1 ENS Nivel Medio

| Requisito | Implementación |
|-----------|----------------|
| Autenticación | JWT con access token (15 min) + refresh token con rotación |
| Autorización | RBAC: CITIZEN, TRAMITADOR, ADMIN |
| Cifrado en tránsito | TLS 1.2/1.3 (configurable en producción) |
| Cifrado en reposo | BCrypt cost 12 para contraseñas |
| Trazabilidad | Audit log inmutable con IP y contexto |
| Protección fuerza bruta | Rate limiting en endpoints auth y admin |

### 5.2 Rate Limiting

- Endpoints de autenticación: 5 intentos/minuto
- Endpoints de admin (escritura): 20 peticiones/minuto
- Protección contra enumeración de usuarios

### 5.3 CORS y Security Headers

- CORS configurado para orígenes específicos (4200, 4300)
- Headers de seguridad: CSP, X-Frame-Options, X-Content-Type-Options

---

## 6. Calidad del Código y Testing (1-2 min)

### Métricas de testing

| Módulo | Tests | Estado |
|--------|-------|--------|
| Backend | 579 | ✅ Todos pasan |
| Frontend (Sede) | 695 | ✅ Todos pasan |
| Backoffice | 34 | ✅ Todos pasan |

### Herramientas de testing

- **Backend:** JUnit 5, Mockito, Testcontainers
- **Frontend:** Jasmine/Karma (Angular)
- **Performance:** k6 (perfiles de carga con umbrales p95 < 500ms)

### Código limpio

- Sin datos hardcoded (eliminados todos los mocks y valores fijos)
- Números mágicos extraídos a constantes con nombre
- Arquitectura hexagonal respetada en todos los módulos
- Convención de nombres en inglés para código Angular

---

## 7. Preguntas frecuentes del tribunal

### P1: ¿Por qué Flowable y no Camunda?

> "Camunda 7 requería dependencias incompatibles con Spring Boot 3. Flowable es el fork activo de Activiti, completamente compatible con Spring Boot 3.4 y soporta BPMN 2.0 nativamente."

### P2: ¿Cómo garantizas la inmutabilidad del audit log?

> "El audit log es solo-escritura: no hay endpoints de UPDATE ni DELETE sobre la tabla de auditoría. Cada registro incluye timestamp, IP, usuario, acción y UUID del recurso. Además, los cambios de rol y estado en backoffice se registran automáticamente."

### P3: ¿Qué es el paquete .enidoc?

> "Es un archivo ZIP conforme al Esquema Nacional de Interoperabilidad que contiene los documentos PDF del expediente, las firmas desprendidas (.xsig), un index.xml válido contra el XSD oficial de ENI con hashes SHA-256, y un justificante de descarga. Solo se genera para expedientes resueltos."

### P4: ¿Por qué Mailpit y no un servicio real de email?

> "Para el alcance del TFG necesitamos un entorno autocontenido sin dependencias externas. Mailpit proporciona un SMTP estándar con interfaz web para inspección, lo que permite demostrar el flujo completo de verificación y notificación sin credenciales de terceros."

### P5: ¿Cómo manejas la accesibilidad?

> "La plataforma sigue las directrices WCAG 2.1 Nivel AA: navegación por teclado, estructura semántica HTML, contraste adecuado, labels en formularios, y declaración de accesibilidad disponible públicamente."

### P6: ¿Qué pasa si un ciudadano empieza un trámite sin estar logueado?

> "Se aplica la política 'Login-First': si el ciudadano intenta iniciar un procedimiento protegido sin autenticar, se le redirige al login y, tras autenticarse, continúa automáticamente a la ruta original."

---

## 8. Cierre (1 min)

### Resumen final

> "En resumen, esta plataforma implementa un sistema completo de gestión de expedientes electrónicos que cumple con los requisitos del ENS (nivel medio) y ENI, con arquitectura hexagonal, motor BPMN embebido, firma electrónica, y despliegue containerizado. Los más de 1.300 tests automatizados garantizan la calidad del código."

### Tecnologías utilizadas

- Spring Boot 3.4, Java 17, Flowable 7.0.1
- Angular 18, TypeScript, Tailwind CSS
- PostgreSQL 16, Flyway, Docker Compose
- Bouncy Castle, OpenPDF, Mailpit

### Código fuente

- Repositorio local con rama `master`
- 14 ADRs documentados en `docs/adr/`
- Documentación técnica en `docs/`

---

## Checklist de preparación rápida

- [ ] `docker compose up -d` ejecutado y servicios saludables
- [ ] Verificar que backend responde: `curl http://localhost:8080/api/v1/health/live`
- [ ] Verificar sede accesible: `http://localhost:4200`
- [ ] Verificar backoffice accesible: `http://localhost:4300`
- [ ] Verificar Mailpit accesible: `http://localhost:8025`
- [ ] Credenciales de demo funcionales (probar login en ambos portales)
- [ ] Al menos 1 expediente creado con documentos para mostrar
- [ ] Al menos 1 expediente RESUELTO para descargar .enidoc
- [ ] Emails de verificación visibles en Mailpit
- [ ] Cambio de idioma funcionando en sede
- [ ] Exportación PDF de estadísticas funcional
