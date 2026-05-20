import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtAuthInterceptor } from './jwt-auth.interceptor';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('JwtAuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getToken',
      'getRefreshToken',
      'refreshToken',
      'logout'
    ]);

    localStorage.clear();

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
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

  describe('Authorization header', () => {
    it('should add Authorization header when token is available', () => {
      authServiceSpy.getToken.and.returnValue('fake.access.token');

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake.access.token');
    });

    it('should not add Authorization header when token is null', () => {
      authServiceSpy.getToken.and.returnValue(null);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
    });

    it('should not add Authorization header when token is empty string', () => {
      authServiceSpy.getToken.and.returnValue('');

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
    });

    it('should preserve existing headers when adding Authorization', () => {
      authServiceSpy.getToken.and.returnValue('my-token');

      httpClient.get('/test', { headers: { 'X-Custom': 'value' } }).subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
      expect(req.request.headers.get('X-Custom')).toBe('value');
    });
  });

  describe('401 error handling and token refresh', () => {
    it('should attempt token refresh on 401 response', (done) => {
      authServiceSpy.getToken.and.returnValue('expired.token');
      authServiceSpy.refreshToken.and.returnValue(of('new.access.token'));

      httpClient.get('/test').subscribe({
        next: () => {
          // After refresh, the request should be retried and succeed
          done();
        }
      });

      // First request gets 401
      const req1 = httpMock.expectOne('/test');
      req1.flush(null, { status: 401, statusText: 'Unauthorized' });

      // Since refreshToken is mocked, no HTTP call for refresh is made.
      // The interceptor retries the original request with the new token.
      const req2 = httpMock.expectOne('/test');
      expect(req2.request.headers.get('Authorization')).toBe('Bearer new.access.token');
      req2.flush({ data: 'success' });
    });

    it('should call logout when refresh token fails', (done) => {
      authServiceSpy.getToken.and.returnValue('expired.token');
      authServiceSpy.refreshToken.and.returnValue(throwError(() => new Error('Refresh failed')));

      httpClient.get('/test').subscribe({
        error: () => {
          expect(authServiceSpy.logout).toHaveBeenCalled();
          done();
        }
      });

      const req1 = httpMock.expectOne('/test');
      req1.flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should not attempt refresh for /auth/refresh endpoint itself', () => {
      authServiceSpy.getToken.and.returnValue('expired.token');

      httpClient.post('/auth/refresh', { refreshToken: 'old' }).subscribe({
        error: () => {
          // Should receive the 401 directly without retry
          expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne('/auth/refresh');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should queue concurrent requests during token refresh', (done) => {
      authServiceSpy.getToken.and.returnValue('expired.token');
      authServiceSpy.refreshToken.and.returnValue(of('new.access.token'));

      let completedRequests = 0;

      // Fire two concurrent requests
      httpClient.get('/test-1').subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === 2) done();
        }
      });

      httpClient.get('/test-2').subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === 2) done();
        }
      });

      // First request gets 401 — triggers refresh
      const req1 = httpMock.expectOne('/test-1');
      req1.flush(null, { status: 401, statusText: 'Unauthorized' });

      // Second request also gets 401 — will wait for refresh
      const req2 = httpMock.expectOne('/test-2');
      req2.flush(null, { status: 401, statusText: 'Unauthorized' });

      // Since refreshToken is mocked, no HTTP call for refresh is made.
      // Both requests are retried with the new token.
      const retry1 = httpMock.expectOne('/test-1');
      expect(retry1.request.headers.get('Authorization')).toBe('Bearer new.access.token');
      retry1.flush({ data: 'ok1' });

      const retry2 = httpMock.expectOne('/test-2');
      expect(retry2.request.headers.get('Authorization')).toBe('Bearer new.access.token');
      retry2.flush({ data: 'ok2' });
    });
  });

  describe('non-401 errors', () => {
    it('should pass through 500 errors without triggering refresh', (done) => {
      authServiceSpy.getToken.and.returnValue('valid.token');

      httpClient.get('/test').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne('/test');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should pass through 403 errors without triggering refresh', (done) => {
      authServiceSpy.getToken.and.returnValue('valid.token');

      httpClient.get('/test').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne('/test');
      req.flush(null, { status: 403, statusText: 'Forbidden' });
    });

    it('should pass through 404 errors without triggering refresh', (done) => {
      authServiceSpy.getToken.and.returnValue('valid.token');

      httpClient.get('/test').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne('/test');
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });
});
