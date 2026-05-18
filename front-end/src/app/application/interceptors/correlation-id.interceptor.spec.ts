import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';

describe('CorrelationIdInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('should add X-Correlation-Id header to requests', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    const correlationId = req.request.headers.get('X-Correlation-Id');

    expect(correlationId).toBeTruthy();
  });

  it('should generate a valid UUID v4 format', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    const correlationId = req.request.headers.get('X-Correlation-Id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(correlationId).toMatch(uuidRegex);
  });

  it('should generate a unique ID per request', () => {
    httpClient.get('/test-1').subscribe();
    httpClient.get('/test-2').subscribe();

    const req1 = httpMock.expectOne('/test-1');
    const req2 = httpMock.expectOne('/test-2');

    const id1 = req1.request.headers.get('X-Correlation-Id');
    const id2 = req2.request.headers.get('X-Correlation-Id');

    expect(id1).not.toBe(id2);
  });

  it('should preserve existing headers when adding X-Correlation-Id', () => {
    httpClient.get('/test', { headers: { 'Authorization': 'Bearer token123' } }).subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('X-Correlation-Id')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
  });

  it('should work with POST requests', () => {
    httpClient.post('/api/data', { name: 'test' }).subscribe();

    const req = httpMock.expectOne('/api/data');
    const correlationId = req.request.headers.get('X-Correlation-Id');

    expect(correlationId).toBeTruthy();
    expect(req.request.method).toBe('POST');
  });

  it('should work with PUT requests', () => {
    httpClient.put('/api/data/1', { name: 'updated' }).subscribe();

    const req = httpMock.expectOne('/api/data/1');
    const correlationId = req.request.headers.get('X-Correlation-Id');

    expect(correlationId).toBeTruthy();
    expect(req.request.method).toBe('PUT');
  });

  it('should work with DELETE requests', () => {
    httpClient.delete('/api/data/1').subscribe();

    const req = httpMock.expectOne('/api/data/1');
    const correlationId = req.request.headers.get('X-Correlation-Id');

    expect(correlationId).toBeTruthy();
    expect(req.request.method).toBe('DELETE');
  });
});
