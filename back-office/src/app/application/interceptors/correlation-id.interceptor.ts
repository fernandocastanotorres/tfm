import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const correlationId = this.generateCorrelationId();
    const cloned = req.clone({
      setHeaders: {
        'X-Correlation-Id': correlationId
      }
    });
    return next.handle(cloned);
  }

  private generateCorrelationId(): string {
    return `bo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
