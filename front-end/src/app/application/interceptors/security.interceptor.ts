import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Adds security-related headers to outgoing HTTP requests.
 * - Accept: application/json (explicit content negotiation)
 */
@Injectable()
export class SecurityInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const securedReq = req.clone({
      setHeaders: {
        'Accept': 'application/json'
      }
    });

    return next.handle(securedReq);
  }
}
