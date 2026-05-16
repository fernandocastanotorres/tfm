import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ValidationErrors } from '@angular/forms';

/**
 * Centralized HTTP error handling.
 * - 401 (after refresh fail): redirect to /login
 * - 400: return ValidationErrors for form display
 * - 403: show toast notification and rethrow
 * - 500: show toast notification and rethrow
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            // Token refresh already failed in JwtAuthInterceptor; redirect to login
            this.router.navigate(['/sede/login']);
            break;

          case 400:
            // Return validation errors so components can display them on forms
            return throwError(() => this.extractValidationErrors(error));
            break;

          case 403:
            this.showToast('error', 'Access denied', 'You do not have permission to perform this action.');
            break;

          case 500:
            this.showToast('error', 'Server error', 'An unexpected error occurred. Please try again later.');
            break;

          default:
            // For other errors, just rethrow
            break;
        }

        return throwError(() => error);
      })
    );
  }

  private extractValidationErrors(error: HttpErrorResponse): ValidationErrors {
    if (error.error && typeof error.error === 'object') {
      // Support both single-field and multi-field error structures
      const errors: ValidationErrors = {};
      for (const [key, value] of Object.entries(error.error)) {
        errors[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
      return errors;
    }
    return { global: error.message || 'Bad request' };
  }

  private showToast(type: 'error' | 'warning' | 'info', title: string, message: string): void {
    // Placeholder: replace with actual toast service when available
    // e.g., this.toastService.show({ type, title, message });
    console.warn(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
}
