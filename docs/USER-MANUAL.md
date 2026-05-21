# Manual de Usuario - Plataforma de Expedientes Electronicos

> TFG - Sistema de Gestion de Expedientes Electronicos con Cumplimiento ENS/ENI
> Version: 1.0 | Mayo 2026

---

## Indice

1. [Portal Ciudadano (Sede Electronica)](#1-portal-ciudadano-sede-electronica)
2. [Backoffice (Panel de Administracion)](#2-backoffice-panel-de-administracion)
3. [Preguntas Frecuentes](#3-preguntas-frecuentes)
4. [Accesibilidad](#4-accesibilidad)

---

## 1. Portal Ciudadano (Sede Electronica)

### 1.1 Acceso

**URL:** `http://localhost:4200`

La sede electronica tiene dos areas:

- **Area publica:** Accesible sin registro. Incluye catalogo de tramites, informacion institucional, FAQ, calendario, transparencia, legislacion, glosario y directorio de organismos.
- **Area privada:** Requiere registro y autenticacion. Incluye dashboard personal, gestion de expedientes, documentos, mensajeria y perfil.

### 1.2 Registro

1. Click en **Registrarse** (esquina superior derecha).
2. Rellenar el formulario con:
   - Nombre completo
   - Email valido
   - DNI/NIE
   - Telefono
   - Contraseña (minimo 8 caracteres, 1 minuscula, 1 mayuscula, 1 numero, 1 caracter especial)
   - Aceptar los terminos y condiciones
3. Recibiras un email de verificacion.
4. Haz click en el enlace de verificacion o introduce el codigo OTP.
5. Ya puedes iniciar sesion.

### 1.3 Inicio de Sesion

1. Click en **Iniciar sesion**.
2. Introduce tu email y contraseña.
3. Si olvidaste tu contraseña, usa el enlace **Recuperar contraseña**.

### 1.4 Dashboard Personal

Tras iniciar sesion, veras tu panel personal con:

- **Mis expedientes:** Lista de todos tus tramites con su estado actual.
- **Notificaciones:** Avisos sobre cambios en tus expedientes.
- **Accesos rapidos:** Iniciar nuevo tramite, ver documentos, mensajeria.

### 1.5 Iniciar un Tramite

1. Ve al **Catalogo de Tramites**.
2. Selecciona el procedimiento que deseas iniciar.
3. Se abrira un asistente guiado con varios pasos:
   - **Formulario:** Rellena los datos requeridos.
   - **Documentacion:** Sube los documentos necesarios (arrastra y suelta o selecciona archivos).
   - **Revision:** Verifica toda la informacion antes de enviar.
4. Puedes **Guardar como borrador** para continuar mas tarde.
5. Cuando este completo, haz click en **Enviar**.

### 1.6 Seguir un Expediente

1. Ve a **Mis Expedientes** desde el dashboard.
2. Haz click en un expediente para ver el detalle.
3. Veras:
   - **Estado actual:** Borrador, Enviado, En Tramitacion, Aprobado, Rechazado.
   - **Linea temporal:** Historial completo de eventos con fechas.
   - **Documentos:** Lista de documentos asociados con opcion de descarga.
   - **Mensajes:** Sistema de mensajeria integrado para comunicarte con la administracion.

### 1.7 Gestion de Documentos

1. Ve a **Documentos** desde el menu.
2. Selecciona el expediente.
3. Puedes:
   - **Subir** nuevos documentos.
   - **Descargar** documentos existentes.
   - **Firmar** documentos electronicamente.
   - **Verificar** la firma de un documento.
   - **Eliminar** documentos (solo en estado borrador).

### 1.8 Mensajeria

1. Ve a **Mensajeria** desde el menu de usuario.
2. Veras los hilos de mensajes organizados por expediente.
3. Haz click en un hilo para ver la conversacion completa.
4. Puedes **Responder** con texto y adjuntar archivos.

### 1.9 Perfil de Usuario

1. Haz click en tu nombre (esquina superior derecha) > **Datos personales**.
2. Puedes consultar y modificar tu informacion personal.

### 1.10 Cambio de Idioma

- Usa el selector de idioma en la barra superior.
- Idiomas disponibles: Espanol, Catalan, Euskera, Gallego, Valenciano.

### 1.11 Modo Oscuro

- Click en el icono de luna/sol en la barra superior para alternar entre modo claro y oscuro.

---

## 2. Backoffice (Panel de Administracion)

### 2.1 Acceso

**URL:** `http://localhost:4300`

Requiere credenciales de Tramitador o Administrador.

### 2.2 Dashboard

El panel principal muestra:

- **Estadisticas generales:** Expedientes por estado, actividad reciente.
- **Graficos:** Tendencias de tramitacion.
- **Accesos rapidos:** Gestion de expedientes, tareas, usuarios.

### 2.3 Gestion de Expedientes

1. Ve a **Expedientes** en el menu lateral.
2. Usa los filtros para buscar por:
   - Texto libre (buscador)
   - Estado (Borrador, Enviado, En Tramitacion, etc.)
3. Click en **Ver detalle** para abrir un expediente.
4. Desde el detalle puedes:
   - Ver documentos adjuntos.
   - Consultar la linea temporal.
   - Resolver tareas pendientes.

### 2.4 Tareas

1. Ve a **Mis Tareas** en el menu lateral.
2. Filtra por: Todas, Urgentes, Sin asignar.
3. Cada tarea tiene un tipo:
   - **FORM:** Revision de datos del formulario.
   - **REVIEW:** Validacion de documentos.
   - **UPLOAD:** Solicitud de documentacion adicional.
4. Click en **Resolver** para procesar la tarea.
5. Puedes:
   - **Aprobar** documentos.
   - **Rechazar** documentos (con motivo).
   - **Devolver** al ciudadano para subsanacion.

### 2.5 Resolucion de Expedientes

1. Desde una tarea de revision, accede a la **Resolucion**.
2. Evalua la documentacion y los datos.
3. Decide:
   - **Aprobar:** El expediente se resuelve favorablemente.
   - **Rechazar:** El expediente se resuelve desfavorablemente (con motivo).
4. Tras la resolucion, el ciudadano puede descargar el paquete ENI (.enidoc).

### 2.6 Gestion de Usuarios (Solo Admin)

1. Ve a **Usuarios** en el menu lateral.
2. Veras la lista de todos los usuarios con:
   - Nombre, email, rol, estado, ultimo acceso.
3. Acciones disponibles:
   - **Crear usuario:** Nuevo tramitador o admin.
   - **Editar usuario:** Cambar datos o rol.
   - **Activar/Desactivar:** Habilitar o bloquear acceso.
4. Todos los cambios quedan registrados en el audit log.

### 2.7 Catalogo de Tramites (Solo Admin)

1. Ve a **Tipos de Procedimiento** en el menu lateral.
2. Puedes:
   - **Crear** nuevos tipos de tramite.
   - **Editar** tipos existentes.
   - **Gestionar traducciones** de campos de formulario (i18n).
3. Cada tipo de tramite define:
   - Nombre y descripcion (en 5 idiomas).
   - Esquema de formulario JSON.
   - Tareas del flujo de trabajo.
   - Requisitos de documentacion.

### 2.8 Estadisticas y Exportacion

1. Ve a **Estadisticas** en el menu lateral.
2. Visualiza graficos de actividad y metricas.
3. Click en **Exportar PDF** para generar un informe.

### 2.9 Buzon de Contacto

1. Ve a **Buzon de Contacto** en el menu lateral.
2. Veras los mensajes enviados por ciudadanos desde el formulario de contacto publico.
3. Puedes responder y gestionar las consultas.

### 2.10 Gestion de Contenido Publico

1. Ve a **Contenido Publico** en el menu lateral.
2. Puedes editar:
   - Informacion institucional.
   - Preguntas frecuentes (FAQ).
   - Calendario de eventos.
   - Informes de transparencia.
   - Legislacion.
   - Glosario.
   - Directorio de organismos.

---

## 3. Preguntas Frecuentes

### 3.1 No recibo el email de verificacion

- Comprueba la carpeta de spam.
- Verifica que el email es correcto.
- En el entorno de desarrollo, consulta Mailpit en `http://localhost:8025`.
- Usa el boton **Reenviar enlace de verificacion** en la pagina de login.

### 3.2 Mi expediente aparece como "Borrador"

- Significa que no has completado el envio.
- Puedes continuar el tramite desde **Mis Expedientes**.

### 3.3 Me piden subsanar mi expediente

- La administracion ha detectado documentacion faltante o incorrecta.
- Recibiras una notificacion con los detalles.
- Accede al expediente y sube la documentacion solicitada.

### 3.4 Como descargo el paquete ENI de mi expediente?

- Solo disponible para expedientes **Aprobados** o **Rechazados**.
- Abre el detalle del expediente y busca la opcion de descarga `.enidoc`.

### 3.5 Puedo cambiar el idioma de la plataforma?

- Si. Usa el selector de idioma en la barra superior (5 idiomas disponibles).

### 3.6 He olvidado mi contraseña

- Click en **Recuperar contraseña** en la pagina de login.
- Introduce tu email y recibiras un enlace para restablecerla.

---

## 4. Accesibilidad

La plataforma cumple con las directrices **WCAG 2.1 Nivel AA**:

- **Navegacion por teclado:** Toda la funcionalidad es accesible mediante teclado (Tab, Enter, Space, Escape).
- **Skip links:** Enlace "Saltar al contenido principal" disponible al pulsar Tab.
- **Contraste:** Todos los textos cumplen con el ratio minimo de 4.5:1.
- **Formularios:** Todos los campos tienen labels asociados.
- **Errores:** Los errores se anuncian automaticamente a lectores de pantalla.
- **Movimiento reducido:** Las animaciones se desactivan si el sistema prefiere movimiento reducido.
- **Declaracion de accesibilidad:** Disponible en `/sede/accesibilidad`.
