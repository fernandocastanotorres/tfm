import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';

describe('CorrelationIdInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CorrelationIdInterceptor,
          multi: true
        }
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add X-Correlation-Id header to every request', (done) => {
    http.get('/api/test').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/test');
    const correlationId = req.request.headers.get('X-Correlation-Id');
    expect(correlationId).toBeTruthy();
    req.flush({});
  });

  it('should generate correlation ID with correct format bo-{timestamp}-{random}', (done) => {
    http.get('/api/test').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/test');
    const correlationId = req.request.headers.get('X-Correlation-Id')!;

    const parts = correlationId.split('-');
    expect(parts[0]).toBe('bo');
    expect(parts[1]).toBeTruthy(); // timestamp
    expect(parts[2]).toBeTruthy(); // random string
    expect(parts.length).toBe(3);

    req.flush({});
  });

  it('should generate unique correlation IDs for each request', (done) => {
    const correlationIds: string[] = [];

    http.get('/api/test-1').subscribe();
    const req1 = httpMock.expectOne('/api/test-1');
    correlationIds.push(req1.request.headers.get('X-Correlation-Id')!);
    req1.flush({});

    http.get('/api/test-2').subscribe(() => {
      expect(correlationIds[0]).not.toBe(correlationIds[1]);
      done();
    });
    const req2 = httpMock.expectOne('/api/test-2');
    correlationIds.push(req2.request.headers.get('X-Correlation-Id')!);
    req2.flush({});
  });

  it('should have a numeric timestamp in the correlation ID', (done) => {
    http.get('/api/test').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/test');
    const correlationId = req.request.headers.get('X-Correlation-Id')!;
    const timestamp = parseInt(correlationId.split('-')[1], 10);

    expect(timestamp).toBeGreaterThan(0);
    expect(timestamp).toBeLessThanOrEqual(Date.now());

    req.flush({});
  });
});
