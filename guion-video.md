# Guión para Presentación del TFM — Plataforma de Gestión de Expedientes Electrónicos

> Duración estimada: **20-25 minutos**  
> Estructura: 10 secciones con indicaciones de pantalla y tiempos orientativos

---

## 1. PORTADA (1 min)

**Pantalla:** Slide 1 de la presentación (PPTX) — título del proyecto

**Guión:**

> Buenos días/tardes. Mi Trabajo Fin de Máster consiste en el diseño e implementación de una plataforma completa de gestión de expedientes electrónicos para la Administración Pública española, cumpliendo con el Esquema Nacional de Seguridad en su nivel medio y con el Esquema Nacional de Interoperabilidad.
>
> El proyecto abarca tres módulos: una sede electrónica para el ciudadano, un backoffice para los tramitadores, y una API central que orquesta toda la lógica de negocio. Todo ello desplegado con Docker Compose en una arquitectura de 11 servicios con observabilidad completa.

---

## 2. CONTEXTO Y PROBLEMÁTICA (2 min)

**Pantalla:** Slide 2 — Contexto y Motivación

**Guión:**

> La Ley 39/2015 establece el derecho del ciudadano a relacionarse electrónicamente con la Administración. Sin embargo, muchas administraciones locales aún carecen de plataformas que cumplan simultáneamente con el ENS —que garantiza la seguridad— y con el ENI —que garantiza la interoperabilidad entre sistemas—.
>
> **El problema que ataca este proyecto es triple:**
> 1. El ciudadano tiene que desplazarse físicamente para iniciar trámites.
> 2. Los sistemas existentes no interoperan entre sí.
> 3. Los expedientes en papel carecen de trazabilidad y auditoría.
>
> **La solución** es una plataforma 100% digital, accesible 24/7, con expediente electrónico firmado criptográficamente, trazabilidad BPMN y auditoría inmutable. Todo ello bajo el marco del RD 311/2022 del ENS y el RD 4/2010 del ENI.

---

## 3. ARQUITECTURA DEL SISTEMA (3 min)

**Pantalla:** Slide 3 — Arquitectura de 11 servicios Docker

**Guión:**

> La arquitectura se despliega con Docker Compose sobre una red aislada con 11 servicios. Vamos a verlos:
>
> **[Señalar en pantalla cada grupo]**
>
> - **Base de datos**: PostgreSQL 16 como almacén principal.
> - **Backend API**: Spring Boot 3.4 con arquitectura hexagonal. Es el núcleo del sistema.
> - **Frontends**: Dos aplicaciones Angular 20 independientes — la sede electrónica para el ciudadano y el backoffice para tramitadores — cada una servida por nginx.
> - **Proxy central**: nginx actúa como reverse proxy único con terminación SSL, sirviendo 7 subdominios distintos.
> - **Observabilidad**: Grafana 11 + Loki 3.0 + Prometheus 2.53 + Promtail + cAdvisor para logs, métricas y dashboards.
> - **Desarrollo**: Mailpit como servidor SMTP local para probar envíos de correo sin mandar emails reales.

**Pantalla:** Slide 4 — Arquitectura Hexagonal

**Guión:**

> El backend sigue el patrón de arquitectura hexagonal —o ports & adapters— documentado en el ADR-0007. Esto nos da 4 capas con reglas de dependencia estrictas:
>
> - **domain/**: El núcleo puro de negocio. Modelos como Procedure, Document, User y puertos como interfaces de repositorio. Esta capa no depende de ningún framework y tiene cobertura de tests del 100%.
> - **application/**: 25 servicios de caso de uso que orquestan la lógica. Aquí residen CaseService, SignatureService, EniMetadataService, WorkflowService, entre otros.
> - **infrastructure/**: Los adaptadores concretos — 26 entidades JPA, seguridad con JWT y BCrypt, almacenamiento local de ficheros, envío de emails y un sistema de auditoría asíncrono basado en eventos.
> - **entrypoints/**: 16 controladores REST documentados con OpenAPI/Swagger, un manejador global de excepciones con 8 tipos, y la cadena de filtros de Spring Security.

---

## 4. TECH STACK (2 min)

**Pantalla:** Slide 5 — Tech Stack

**Guión:**

> El stack tecnológico se divide en cuatro bloques:
>
> **Backend**: Java 17 con Spring Boot 3.4.5. Para la automatización de workflows utilizo Flowable 7, un motor BPMN 2.0 que elegí tras evaluar Camunda — esta decisión está documentada en los ADR-0004 y 0008. Las firmas electrónicas las genero con Bouncy Castle mediante CMS/PKCS#7, y la conversión de documentos a PDF la realiza JODConverter con LibreOffice.
>
> **Frontends**: Ambos usan Angular 20 con Angular Material CDK y Tailwind CSS. La sede electrónica soporta 5 idiomas mediante ngx-translate y cumple con los criterios de accesibilidad WCAG 2.1 AA.
>
> **DevOps**: Multi-stage Dockerfiles que empaquetan LibreOffice dentro de la imagen del backend, eliminando la necesidad de un servicio separado. Los assets estáticos se cachean en nginx con expiración de 1 año.
>
> **Testing**: JUnit 5 + Mockito en backend, Jasmine + Karma en frontend, y Playwright para tests end-to-end. Todo con quality gates en CI.

---

## 5. DEMO — SEDE ELECTRÓNICA (4 min)

**Pantalla:** Navegador abierto en `https://sede.nbpdev.es`

**Guión:**

> Vamos a ver la plataforma en funcionamiento. Esto es la sede electrónica, el portal que ve el ciudadano.

**[Mostrar la landing pública]**

> La parte pública incluye catálogo de procedimientos, normativa, preguntas frecuentes, portal de transparencia con métricas en tiempo real, y un verificador de documentos mediante Código Seguro de Verificación que no requiere autenticación.

**[Login: citizen@tfm.es / Citizen1]**

> Al acceder con sus credenciales, el ciudadano ve su dashboard personal con un resumen de sus expedientes. Aquí tiene opciones para iniciar un nuevo trámite, consultar sus expedientes activos, mensajería con el tramitador y notificaciones.

**[Iniciar un nuevo expediente — mostrar el asistente multi-paso]**

> El asistente de nueva solicitud carga dinámicamente los pasos y formularios desde el esquema JSON del tipo de procedimiento. Cada paso puede tener validaciones, campos obligatorios y adjuntos. El sistema guarda borradores automáticamente para que el ciudadano pueda retomarlo después.

**[Subir documentos — drag & drop]**

> La subida de documentos acepta arrastrar y soltar. Al confirmar el expediente, el sistema ejecuta el pipeline completo: convierte los documentos a PDF, los firma digitalmente con CMS/PKCS#7, asigna números de registro de entrada, genera un documento resumen firmado con código QR, y crea el paquete ENIDOC compatible con el ENI.

**[Mostrar la pantalla de detalle de expediente]**

> En el detalle el ciudadano ve la línea de tiempo con todos los eventos del expediente, puede enviar mensajes al tramitador, ver el estado del workflow BPMN, y descargar los documentos firmados y el justificante electrónico.

**[A destacar en sede:]**
> - Asistente dinámico con formularios desde esquema JSON (no hardcodeado)
> - Drag & drop de documentos con previsualización
> - i18n completo en 5 idiomas
> - WCAG 2.1 AA: navegación por teclado, roles ARIA, contraste validado
> - Descarga de documento resumen firmado con código QR verificable

---

## 6. DEMO — BACKOFFICE (3 min)

**Pantalla:** `https://tramitador.nbpdev.es` — login como admin

**Guión:**

> Este es el backoffice, la herramienta de los tramitadores.

**[Dashboard con gráficos]**

> El dashboard muestra KPIs en tiempo real: expedientes por estado, carga de trabajo por usuario, tiempo medio de resolución y tasa de aprobación.

**[Lista de casos y detalle]**

> El tramitador filtra los expedientes por estado, tipo o fecha. Al abrir un caso, ve los documentos, la línea de tiempo completa y el historial de comunicaciones con el ciudadano.

**[Resolver tarea BPMN]**

> Las tareas del workflow BPMN aparecen en la bandeja del tramitador. Aquí vemos una tarea de revisión. El tramitador puede aprobar, rechazar o devolver a subsanación — esto dispara el amendment loop del proceso BPMN, notificando al ciudadano para que corrija la documentación.

**[Gestión de procedimientos]**

> Desde el panel de administración se gestionan usuarios, roles, tipos de procedimiento y sus esquemas de formulario. También se gestionan las notificaciones electrónicas y el contenido público de la sede.

**[A destacar en backoffice:]**
> - Dashboard con Chart.js en tiempo real
> - Integración directa con tareas BPMN de Flowable
> - Flujo completo: revisión → subsanación → aprobación/rechazo
> - SLA tracking con timer de 48 horas y escalado automático

---

## 7. SEGURIDAD Y CUMPLIMIENTO ENS/ENI (3 min)

**Pantalla:** Slides 7, 8 y 9 — ENS, Pipeline de firma, ENI

**Guión:**

> El cumplimiento normativo es el eje central del proyecto. Vamos a ver cómo se implementa.

**[Slide 7 — ENS]**

> El ENS Nivel Medio exige 20 medidas de seguridad. Las 10 más relevantes están implementadas: identificación con JWT, control de acceso RBAC con tres roles, auditoría inmutable con 24 tipos de eventos, integridad mediante JPA auditing, confidencialidad con TLS 1.3, política de contraseñas robusta, bloqueo de cuenta tras 5 intentos fallidos, sesiones stateless con refresh token rotado, cabeceras de seguridad HTTP, y rate limiting multi-capa tanto por IP como por email.

**[Slide 8 — Pipeline de documentos]**

> El pipeline de documentos electrónicos es uno de los puntos más técnicos del proyecto:
> 1. **Upload**: el ciudadano sube el documento original.
> 2. **Conversión**: JODConverter + LibreOffice lo transforma a PDF.
> 3. **Firma**: Bouncy Castle genera una firma CMS/PKCS#7 detached con RSA 2048 bits y SHA-256. La firma se incrusta en el PDF —resultando en un PAdES-like— y también se genera una versión detached .xsig para cumplimiento ENI.
> 4. **Registro**: RegistryService asigna número de registro de entrada mediante contadores atómicos en base de datos con `ON CONFLICT` de PostgreSQL, garantizando que dos peticiones concurrentes nunca obtengan el mismo número.
> 5. **Resumen**: Se genera un PDF resumen firmado que incluye los metadatos del expediente y un código QR con el CSV para verificación pública.
> 6. **ENI Package**: EniPackagerService crea un archivo .enidoc —un ZIP con los PDFs, las firmas detached y un index.xml validado contra el esquema XSD oficial del ENI.

**[Slide 9 — ENI]**

> La interoperabilidad ENI se materializa en tres componentes:
> - **Metadatos ENI** persistidos en PostgreSQL en formato JSON versionado.
> - **Paquete ENIDOC** con validación XSD en tiempo real.
> - **CSV** —Código Seguro de Verificación— de 32 caracteres, verificable públicamente sin autenticación, cumpliendo el artículo 16.4 de la Ley 39/2015.

---

## 8. OBSERVABILIDAD Y AUDITORÍA (2 min)

**Pantalla:** Grafana abierto en `https://grafana.nbpdev.es`

**Guión:**

> La observabilidad es obligatoria para el cumplimiento ENS. Todos los logs del sistema se emiten en formato JSON estructurado con Logstash Encoder, incluyendo un correlation ID que atraviesa toda la petición —desde nginx hasta la base de datos— permitiendo trazabilidad extremo a extremo.

**[Mostrar un dashboard de Grafana]**

> En Grafana tenemos dashboards con:
> - Estado de todos los servicios
> - Latencia de endpoints con percentiles P50, P95 y P99
> - Tasa de errores 5xx
> - Uso de la pool de conexiones de base de datos
> - Hit ratio de la caché Caffeine
>
> Las alertas se configuran para notificar por Telegram ante caídas de servicio o picos de error.

**[Slide 13 — Auditoría]**

> La tabla `security_audit_log` es inmutable —solo acepta INSERT, nunca UPDATE ni DELETE— y registra 24 tipos de eventos categorizados: autenticación, autorización, operaciones de workflow, documentos, interoperabilidad ENI y administración. La escritura es asíncrona mediante eventos de Spring para no bloquear la petición principal.

---

## 9. TESTING Y CALIDAD (1 min)

**Pantalla:** Slide 14 — Calidad y Testing

**Guión:**

> La calidad del código es otro pilar del proyecto. La cobertura global de tests supera el 86%, con el modelo de dominio al 100%. El pipeline CI incluye 6 quality gates: linting, tests unitarios y de integración, cobertura mínima, tests de autorización RBAC, verificación de eventos de auditoría y validación de paquetes ENIDOC contra el XSD.
>
> Para los tests de integración del backend se utiliza Testcontainers, que levanta un PostgreSQL real en un contenedor Docker, garantizando que las queries SQL —incluyendo los `ON CONFLICT` de los contadores atómicos— funcionan exactamente igual que en producción.

---

## 10. FORTALEZAS DEL PROYECTO (1 min)

**Pantalla:** Slide 16 — Métricas

**Guión:**

> Para cerrar, quiero destacar las fortalezas del proyecto en base a métricas objetivas:
>
> - **78.000 líneas de código** entre backend y frontends con una cobertura de tests del 86%.
> - **19 ADRs documentados** que justifican cada decisión arquitectónica tomada.
> - **Arquitectura hexagonal pura** con el dominio 100% aislado de frameworks.
> - **Pipeline de firma electrónica completo**: desde el upload hasta el paquete ENIDOC validado contra XSD oficial.
> - **Cumplimiento ENS Nivel Medio** con 10 medidas implementadas y auditables.
> - **Observabilidad real** con Loki, Grafana y Prometheus —no son teóricas, están funcionando—.
> - **Codebase profesional**: clean code, principios SOLID, separación de capas, DTOs, mapeo explícito.
> - **Entorno autocontenido**: un solo `docker-compose up` levanta toda la plataforma.

---

## 11. MEJORAS FUTURAS (1 min)

**Pantalla:** Slide 17 — Conclusiones, o slide específico de roadmap

**Guión:**

> Como líneas de trabajo futuro, identifico estas prioridades:
>
> - **Pasarela de pago**: integración con pasarela de pago para tasas administrativas, junto con la gestión de justificantes de pago.
> - **Notificaciones electrónicas completas**: integración con el servicio de notificaciones electrónicas de la Administración (notific@ o similar) para notificaciones con acuse de recibo legal.
> - **Firma cualificada eIDAS**: pasar del certificado auto-firmado a un certificado cualificado de persona jurídica o sello de órgano, emitido por un prestador cualificado de confianza según eIDAS.
> - **Integración con Cl@ve**: autenticación del ciudadano mediante el sistema Cl@ve de la Administración General del Estado (certificado digital, DNIe, Cl@ve PIN).
> - **Alta disponibilidad**: replicación de PostgreSQL y balanceo de carga del backend para cumplir con el nivel alto del ENS.
> - **SIR (Sistema de Interconexión de Registros)**: integración con el SIR para intercambio automático de asientos registrales entre administraciones.
> - **Carpeta ciudadana interoperable**: conexión con la Carpeta Ciudadana del Estado para que el ciudadano vea sus expedientes agregados.

---

## 12. CIERRE (30 seg)

**Pantalla:** Slide 18 — Q&A

**Guión:**

> En resumen, este proyecto demuestra que es viable construir una plataforma de administración electrónica moderna, segura e interoperable utilizando exclusivamente tecnologías open source y aplicando buenas prácticas de arquitectura de software.
>
> Muchas gracias. Quedo a su disposición para cualquier pregunta.

---

## CONSEJOS PARA LA GRABACIÓN

1. **Preparar el entorno antes de grabar**: levantar todos los servicios, tener las pestañas del navegador abiertas y logueadas, y el PPTX listo.
2. **Ensayar las transiciones**: el cambio entre PPTX y navegador debe ser fluido. Tener las ventanas preparadas en escritorios virtuales o monitores separados.
3. **Credenciales a mano**: `citizen@tfm.es/Citizen1` para sede, `admin@tfm.es/Admin1234` para backoffice, `admin/admin` para Grafana.
4. **Tener datos de demo**: crear un expediente de prueba antes de grabar para mostrar el detalle, la timeline y los documentos firmados.
5. **Grabar la pantalla a 1080p**: el texto de código y logs debe ser legible.
6. **Micrófono externo**: el audio es más importante que el vídeo para un tribunal.
