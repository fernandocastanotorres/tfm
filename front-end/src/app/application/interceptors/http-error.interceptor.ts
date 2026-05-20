import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ValidationErrors } from '@angular/forms';
import { ToastService } from '../services/toast.service';

/**
 * Centralized HTTP error handling.
 * - 401 (after refresh fail): redirect to /login
 * - 400: return ValidationErrors for form display
 * - 403: show toast notification and rethrow
 * - 409: show toast notification and rethrow
 * - 500: show toast notification and rethrow
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toastService: ToastService
  ) {}

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
            break;

          case 409:
            this.toastService.warning('Conflicto', error.error?.message ?? 'Operacion no permitida en este momento.');
            break;

          case 500:
            this.toastService.error('Error del servidor', 'Ha ocurrido un error inesperado. Intentalo de nuevo mas tarde.');
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
