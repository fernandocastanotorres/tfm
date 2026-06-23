import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AcceptLanguageInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const selectedLocale = localStorage.getItem('tfm.locale') ?? 'es-ES';

    const cloned = req.clone({
      setHeaders: {
        'Accept-Language': selectedLocale
      }
    });

    return next.handle(cloned);
  }
}
