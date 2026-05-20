import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Generates a UUID v4 for each outgoing HTTP request
 * and attaches it as the X-Correlation-Id header.
 * Enables request tracing across frontend, backend, and logs.
 */
@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const correlationId = this.generateUuid();
    const cloned = req.clone({
      setHeaders: {
        'X-Correlation-Id': correlationId
      }
    });
    return next.handle(cloned);
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = (Math.random() * 16) | 0;
      const value = char === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  }
}
