# Estrategia de Migración: Angular Standalone & provide* APIs

Este documento define la estrategia técnica y los pasos quirúrgicos para migrar la Sede Electrónica (`front-end`) a la arquitectura moderna **Standalone Components** y **APIs funcionales de proveedores** (`provide*` APIs) de Angular 19.

El objetivo principal es reducir drásticamente el tamaño del **chunk inicial (vendor + main)** de **550KB** a su mínimo teórico, eliminando el overhead estático de los `NgModule` y preparando la aplicación para una hidratación y optimización avanzada de tree-shaking por el compilador (esbuild).

---

## 1. Justificación Técnica: Tradeoffs de Rendimiento

| Métrica / Elemento | Arquitectura Actual (NgModule) | Nueva Arquitectura (Standalone + provide*) | Impacto Lighthouse |
| :--- | :--- | :--- | :--- |
| **Tree-shaking compilador** | Limitado. Los `NgModule` actúan como grafos gigantes estáticos. El compilador arrastra componentes y dependencias "por si acaso" se usan dentro de la declaración del módulo. | Máximo. Grafos de dependencias puros basados en imports ESM directo de TypeScript. Esbuild elimina cualquier API interna no usada de Angular o RxJS. | **-15% a -25% TBT** |
| **Tiempo de Booteo (Bootup Time)** | Elevado (actualmente **1.4s**). Angular debe parsear el grafo de módulos e inicializar los inyectores jerárquicos de forma masiva en el arranque. | Mínimo. Bootstrap directo de `AppComponent` con `provideRouter`, etc. Menos sobrecarga en el Main Thread durante el bootstrap inicial. | **Baja TBT e Interactive** |
| **Estrategia de Carga (LCP)** | El landing `/sede` arrastra importaciones colaterales necesarias por pertenecer al mismo módulo físico. | Carga atómica. Solo se descarga, parsea y ejecuta el JS estrictamente necesario para renderizar el componente actual. | **Mejora drástica del LCP** |

---

## 2. Fase de Preparación (Fase de Pruebas y Seguridad)

Antes de realizar cambios destructivos o masivos en la arquitectura del código fuente:

1. **Crear una rama de Git dedicada**: `feature/migration-standalone-apis`.
2. **Establecer un Safety Net de Tests**: Ejecutar `npm run quality` para asegurar que el estado actual linter, checkeo de tipos y pruebas unitarias/E2E (Playwright) esté al 100% en verde. No se iniciará la migración si hay tests fallidos.
3. **Bloqueo de cambios concurrentes**: Asegurar que no hay desarrollos paralelos grandes en curso en `AppModule` para evitar conflictos complejos de fusión de Git.

---

## 3. Plan Quirúrgico de Migración (Paso a Paso)

### Paso 1: Migración Automática de Componentes, Directivas y Pipes (CLI)
Angular CLI proporciona un migrador automático altamente fiable. Ejecutaremos en orden secuencial:

```bash
# 1. Convertir todas las declaraciones (componentes, directivas, pipes) a Standalone
ng generate @angular/core:standalone --mode convert-to-standalone

# 2. Eliminar declaraciones redundantes de los NgModule existentes
ng generate @angular/core:standalone --mode remove-unused-declarations
```

*Nota del Arquitecto:* Tras este paso, cada componente tendrá `standalone: true` en su decorador `@Component` y su propia sección `imports: [...]` explícita, resolviendo sus dependencias a nivel atómico en lugar de heredarlas de los módulos parentales.

---

### Paso 2: Eliminación de Módulos Secundarios (Clean-Up)
Migraremos manualmente los módulos que actuaban de enrutadores o agrupadores:
1. **`AuthModule`**, **`PublicInfoModule`**, **`PublicLazyModule`**, **`ProtectedModule`**:
   - Eliminar los archivos físicos de estos módulos (`*.module.ts`).
   - Mover la definición de sus `routes` (`const routes: Routes = [...]`) directamente a archivos de rutas dedicados independientes (p. ej., `auth.routes.ts`, `protected.routes.ts`, etc.) o importarlos dinámicamente en el enrutador principal usando la sintaxis nativa de carga de rutas standalone:
     ```typescript
     // Ejemplo de carga en app-routing.module / app.routes.ts:
     {
       path: 'login',
       loadChildren: () => import('./adapters/modules/auth.routes').then(r => r.AUTH_ROUTES)
     }
     ```

---

### Paso 3: Bootstrap Standalone & provide* APIs en `main.ts`
Este es el cambio crítico de infraestructura. El objetivo es eliminar `AppModule` por completo y arrancar la aplicación de forma funcional en `main.ts`.

#### 1. Crear archivo `src/app/app.config.ts`:
```typescript
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withPreloading, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { routes } from './app.routes';
import { SelectivePreloadingStrategy } from './application/routing/selective-preloading.strategy';
import { HttpLoaderFactory } from './app.module'; // o mover HttpLoaderFactory aquí
import { I18nTitleStrategy } from './application/routing/i18n-title.strategy';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AcceptHeaderInterceptor } from './application/interceptors/accept-header.interceptor';
import { HttpErrorInterceptor } from './application/interceptors/http-error.interceptor';
import { AcceptLanguageInterceptor } from './application/interceptors/accept-language.interceptor';
import { JwtAuthInterceptor } from './application/interceptors/jwt-auth.interceptor';
import { CorrelationIdInterceptor } from './application/interceptors/correlation-id.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(SelectivePreloadingStrategy)
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(), // Cargará animaciones bajo demanda asíncronamente en lugar de bloquear el main thread en el arranque
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() }),
    
    // Interceptores heredados de Di (para mantener compatibilidad sin romper nada)
    { provide: HTTP_INTERCEPTORS, useClass: AcceptHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
    { provide: TitleStrategy, useClass: I18nTitleStrategy },

    // ngx-translate compatible con standalone providers
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

#### 2. Re-escribir `src/main.ts`:
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

#### 3. Eliminar `AppModule` (`src/app/app.module.ts`).

---

## 4. Fase de Verificación de Rendimiento y Calidad

Para asegurar que la migración ha sido exitosa y no ha introducido regresiones de rendimiento ni funcionales, se ejecutará el siguiente ciclo:

1. **Typecheck & Linter**:
   ```bash
   npm run typecheck && npm run lint
   ```
2. **Pruebas unitarias**:
   ```bash
   npm run test
   ```
3. **Build de producción y Análisis de Tamaño**:
   ```bash
   npm run build -- --configuration production --stats-json
   ```
   *Verificar que el tamaño del chunk inicial ha disminuido en al menos un **15%** y que las librerías se han segregado correctamente.*
4. **Verificación de UI & Flujo Crítico (E2E)**:
   ```bash
   npm run e2e
   ```
   *Playwright garantizará de manera automatizada que las rutas públicas y privadas siguen funcionando tras cambiar las entrañas de la aplicación.*

---

## 5. Próximo Paso Recomendado (Opcional pero altamente aconsejable)
Una vez la aplicación esté en arquitectura **Standalone**, se recomienda migrar los interceptores basados en clases (`HTTP_INTERCEPTORS`) a **interceptores funcionales modernos** usando `withInterceptors([authInterceptor, errorInterceptor, ...])` en `provideHttpClient()`. Esto elimina la necesidad de `withInterceptorsFromDi()`, quitando aún más código de la inyección de dependencias heredada y optimizando la velocidad de red.
