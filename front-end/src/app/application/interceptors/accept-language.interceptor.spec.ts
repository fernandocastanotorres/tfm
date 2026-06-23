import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';

describe('AcceptLanguageInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Accept-Language header with default es-ES when no locale is set', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Accept-Language')).toBe('es-ES');
  });

  it('should add Accept-Language header with the stored locale', () => {
    localStorage.setItem('tfm.locale', 'en-US');

    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Accept-Language')).toBe('en-US');
  });

  it('should add Accept-Language header with ca-ES locale', () => {
    localStorage.setItem('tfm.locale', 'ca-ES');

    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Accept-Language')).toBe('ca-ES');
  });

  it('should preserve existing headers when adding Accept-Language', () => {
    localStorage.setItem('tfm.locale', 'fr-FR');

    httpClient.get('/test', { headers: { 'X-Custom': 'value' } }).subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Accept-Language')).toBe('fr-FR');
    expect(req.request.headers.get('X-Custom')).toBe('value');
  });

  it('should not modify the request method or URL', () => {
    httpClient.post('/api/data', { name: 'test' }).subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('POST');
    expect(req.request.url).toBe('/api/data');
    expect(req.request.body).toEqual({ name: 'test' });
  });
});
