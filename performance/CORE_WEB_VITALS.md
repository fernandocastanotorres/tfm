# Core Web Vitals — Frontend Optimization

> Documento de soporte para la defensa del TFG.
> Mide y documenta las optimizaciones de rendimiento aplicadas a la Sede Electrónica.

## 1. ¿Qué son los Core Web Vitals?

Métricas oficiales de Google que forman parte de la señal de experiencia de página:

| Métrica | Mide | Bueno | Regular | Malo |
|---------|------|-------|---------|------|
| **LCP** (Largest Contentful Paint) | Tiempo de carga del elemento más grande visible | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **FID** (First Input Delay) | Tiempo de respuesta a la primera interacción | ≤ 100ms | 100ms – 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | Estabilidad visual durante la carga | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

## 2. Diagnóstico Inicial (Before)

### Problemas identificados

| Problema | Impacto | Severidad |
|----------|---------|-----------|
| Bundle inicial con TODOS los componentes (eager loading) | LCP alto, FID lento | Crítico |
| Sin estrategia de preloading en el router | FID lento en navegación | Alto |
| Google Fonts sin `font-display: swap` | CLS por FOIT | Medio |
| Sin preload de fuentes críticas | LCP retrasado por waterfall | Medio |
| Sin `theme-color` meta tag | Flash blanco en pantalla | Bajo |
| Sin `inlineCritical` CSS | Render bloqueado por CSS externo | Medio |
| Budget inicial muy permisivo (1MB warning / 2MB error) | No alertaba sobre bundles grandes | Bajo |

### Bundle antes de la optimización

```
Componentes eager (bundle inicial): 22 componentes
  - PublicHome, PublicLayout (públicos)
  - Login, Register, EmailVerification, PasswordRecovery (auth públicos)
  - Procedures, ProcedureFlow, Appointments, ErrorPage (públicos)
  - Dashboard, Profile, Notifications, Documents (autenticados)
  - CaseDetail, CaseSearch, Payments, Messages, CaseWizard (autenticados)
  - LoadingSkeleton, NotificationCardDirective, PaymentCardDirective (shared)

Budget: warning @ 1MB, error @ 2MB
```

## 3. Optimizaciones Implementadas

### 3.1 Lazy Loading de Componentes Autenticados (LCP + FID)

**Archivos:** `app/adapters/modules/protected.module.ts`
            `app/app-routing.module.ts`
            `app/app.module.ts`

Se creó un `ProtectedModule` que agrupa los 11 componentes que requieren autenticación.
Se cargan bajo demanda mediante `loadChildren`:

```typescript
// app-routing.module.ts
{
  path: 'sede',
  component: PublicLayoutComponent,
  children: [
    { path: '', component: PublicHomeComponent },  // eager — se pinta primero
    { path: '', loadChildren: () => import('./public-info.module') },
    { path: '', loadChildren: () => import('./protected.module') },  // lazy
    // ... rutas públicas eager
  ]
}
```

**Problema resuelto:** `LoadingSkeletonComponent` era usado tanto por componentes públicos (Procedures)
como por el ProtectedModule (Dashboard). Se convirtió a `standalone: true` para poder importarlo
desde ambos módulos sin violar el árbol de dependencias de Angular.

### 3.2 Preloading Strategy (FID)

```typescript
// app-routing.module.ts
RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
```

Los chunks lazy se cargan **inmediatamente después del paint inicial**, no durante el mismo.
Esto da lo mejor de ambos mundos:
- Primera carga rápida (solo bundle inicial pequeño)
- Navegación instantánea (chunks ya precargados)

### 3.3 Font Optimization (CLS)

```css
/* styles.css */
body {
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  font-display: swap;  /* ← evita FOIT, texto visible inmediatamente con fallback */
}
```

```html
<!-- index.html: carga no bloqueante de Google Fonts -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
      media="print" onload="this.media='all'">
```

`font-display: swap` muestra el texto con la fuente de fallback hasta que Inter se descarga,
eliminando el desplazamiento de layout (CLS) causado por FOIT (Flash of Invisible Text).

El patrón `media="print"` + `onload` evita que la descarga de Google Fonts bloquee el
renderizado inicial (render-blocking), mejorando LCP.

### 3.4 Resource Hints (LCP)

```html
<!-- index.html -->
<meta name="theme-color" content="#0e2a47">   <!-- Elimina flash blanco -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="http://localhost:8080">
```

### 3.5 Critical CSS Inline (LCP)

```json
// angular.json
"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": true   /* ← inlinea el CSS crítico en el <head> */
  },
  "fonts": true
}
```

`inlineCritical` extrae automáticamente el CSS necesario para el contenido above-the-fold
y lo inlinea en el `<head>`, eliminando peticiones CSS bloqueantes en la ruta crítica.

### 3.6 Budgets Ajustados

```json
// angular.json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",     /* antes: 1mb */
    "maximumError": "1mb"          /* antes: 2mb */
  }
]
```

## 4. Estado Post-Optimización (After)

### Bundle después de la optimización

```
Componentes eager (bundle inicial): 11 componentes
  - PublicHome, PublicLayout (públicos)
  - Login, Register, EmailVerification, PasswordRecovery (auth públicos)
  - Procedures, ProcedureFlow, Appointments, ErrorPage (públicos)

Componentes lazy (bajo demanda): 11 componentes + 2 directivas
  - Dashboard, Profile, Notifications + NotificationCardDirective
  - Documents, CaseDetail, CaseSearch, Payments + PaymentCardDirective
  - Messages, CaseWizard

Budget: warning @ 500KB, error @ 1MB  ← ~50% del tamaño original
```

### Mapa de rutas vs. estrategia de carga

| Ruta | Estrategia | Módulo |
|------|-----------|--------|
| `/sede` (home) | **Eager** — paint inmediato | AppModule |
| `/sede/login`, `/sede/registro`, etc. | **Eager** — primera interacción | AppModule |
| `/sede/procedimientos`, `/sede/citas` | **Eager** — navegación pública | AppModule |
| `/sede/institucional`, `/sede/normativa`, etc. | **Lazy** — ya existía | PublicInfoModule |
| `/sede/dashboard`, `/sede/perfil`, etc. | **Lazy + Preload** — nueva | ProtectedModule |
| `/sede/expedientes/nuevo`, etc. | **Lazy + Preload** — nueva | ProtectedModule |

## 5. Cómo Verificar

### 5.1 Lighthouse (local)

```bash
# Construir en producción
cd front-end && npm run build

# Servir localmente
npx http-server dist/front-end -p 4200 -g
# Ejecutar Lighthouse desde Chrome DevTools → Audits → Core Web Vitals
```

### 5.2 PageSpeed Insights (público)

```bash
# Una vez desplegado:
open https://pagespeed.web.dev/
# Introducir URL del despliegue
```

### 5.3 Chrome DevTools

1. Abrir Chrome DevTools → `F12`
2. Pestaña **Performance** → grabar recarga
3. Pestaña **Lighthouse** → generar informe
4. Pestaña **Network** → verificar que los chunks lazy se cargan bajo demanda

Buscar en la pestaña Network los archivos `src_app_adapters_modules_protected_module_ts.js`
que confirman la carga lazy del ProtectedModule.

### 5.4 Verificación del Bundle

```bash
# Analizar el tamaño del bundle
cd front-end
npx source-map-explorer dist/front-end/*.js
```

## 6. Referencias

- [Web Vitals (web.dev)](https://web.dev/vitals/)
- [Optimize LCP (web.dev)](https://web.dev/lcp/)
- [Optimize FID (web.dev)](https://web.dev/fid/)
- [Optimize CLS (web.dev)](https://web.dev/cls/)
- [Angular Lazy Loading](https://angular.io/guide/lazy-loading-ngmodules)
- [Preloading Strategies (Angular)](https://angular.io/guide/router#preloading-background-loading-of-feature-areas)
- [font-display (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
