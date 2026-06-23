import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';

describe('AcceptLanguageInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AcceptLanguageInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Accept-Language header with default es-ES when no locale is stored', (done) => {
    http.get('/api/test').subscribe((response) => {
      done();
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Accept-Language')).toBe('es-ES');
    req.flush({});
  });

  it('should add Accept-Language header with stored locale', (done) => {
    localStorage.setItem('tfm.locale', 'ca-ES');

    http.get('/api/test').subscribe((response) => {
      done();
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Accept-Language')).toBe('ca-ES');
    req.flush({});
  });

  it('should support all supported locales', () => {
    const locales = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];

    locales.forEach((locale, index) => {
      localStorage.setItem('tfm.locale', locale);

      http.get(`/api/test-${index}`).subscribe();

      const req = httpMock.expectOne(`/api/test-${index}`);
      expect(req.request.headers.get('Accept-Language')).toBe(locale);
      req.flush({});
    });
  });
});
