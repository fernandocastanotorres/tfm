import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, TitleStrategy } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SelectivePreloadingStrategy } from './app/application/routing/selective-preloading.strategy';
import { I18nTitleStrategy } from './app/application/routing/i18n-title.strategy';
import { CustomLoader, HttpLoaderFactory } from './app/application/services/translation-loader.service';

// Interceptors
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AcceptHeaderInterceptor } from './app/application/interceptors/accept-header.interceptor';
import { HttpErrorInterceptor } from './app/application/interceptors/http-error.interceptor';
import { AcceptLanguageInterceptor } from './app/application/interceptors/accept-language.interceptor';
import { JwtAuthInterceptor } from './app/application/interceptors/jwt-auth.interceptor';
import { CorrelationIdInterceptor } from './app/application/interceptors/correlation-id.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(SelectivePreloadingStrategy)
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideNoopAnimations(),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() }),

    // Legacy interceptors and strategies
    { provide: HTTP_INTERCEPTORS, useClass: AcceptHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
    { provide: TitleStrategy, useClass: I18nTitleStrategy },

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
}).catch(err => console.error(err));
