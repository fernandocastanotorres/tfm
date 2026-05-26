import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.toastService.error('Acceso denegado', 'No tienes permisos para realizar esta accion.');
          this.router.navigate(['/error/403']);
        } else if (error.status >= 500) {
          this.toastService.error('Error interno', 'Se ha producido un error inesperado en el servidor.');
          this.router.navigate(['/error/500']);
        } else if (error.status === 409) {
          this.toastService.warning('Conflicto de estado', error.error?.message || 'No se puede completar la operacion en el estado actual.');
        } else if (error.status >= 400) {
          this.toastService.error('Error', error.error?.message || 'Ha ocurrido un error inesperado.');
        }

        const message = error.error?.message || 'Ha ocurrido un error inesperado';
        return throwError(() => new Error(message));
      })
    );
  }
}
