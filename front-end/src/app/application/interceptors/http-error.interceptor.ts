import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ValidationErrors } from '@angular/forms';
import { ToastService } from '../services/toast.service';

/**
 * Centralized HTTP error handling.
 * Uses Injector to lazily resolve Router to avoid circular DI:
 * Router → HttpClient → HTTP_INTERCEPTORS → HttpErrorInterceptor → Router
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) {}

  private get router(): Router {
    return this.injector.get(Router);
  }

  private get toastService(): ToastService {
    return this.injector.get(ToastService);
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this.router.navigate(['/sede/login']);
            break;

          case 400:
            return throwError(() => this.extractValidationErrors(error));

          case 403:
            this.toastService.error('Acceso denegado', 'No tienes permisos para realizar esta accion.');
            this.router.navigate(['/sede/error/403']);
            break;

          case 409:
            this.toastService.warning('Conflicto', error.error?.message ?? 'Operacion no permitida en este momento.');
            break;

          case 500:
            this.toastService.error('Error del servidor', 'Ha ocurrido un error inesperado. Intentalo de nuevo mas tarde.');
            this.router.navigate(['/sede/error/500']);
            break;

          default:
            if (error.status >= 400) {
              this.toastService.error('Error', error.error?.message ?? 'Ha ocurrido un error inesperado.');
            }
            break;
        }

        return throwError(() => error);
      })
    );
  }

  private extractValidationErrors(error: HttpErrorResponse): ValidationErrors {
    if (error.error && typeof error.error === 'object') {
      const errors: ValidationErrors = {};
      for (const [key, value] of Object.entries(error.error)) {
        errors[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
      return errors;
    }
    return { global: error.message || 'Bad request' };
  }
}
