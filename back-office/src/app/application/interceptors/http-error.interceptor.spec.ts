import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { AuthService } from '../services/auth.service';

describe('HttpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true
        },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful responses', (done) => {
    http.get('/api/test').subscribe((response) => {
      expect(response).toEqual({ success: true });
      done();
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ success: true });
  });

  it('should call logout and navigate to /login on 401 error', (done) => {
    http.get('/api/test').subscribe({
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should extract error message from response body', (done) => {
    http.get('/api/test').subscribe({
      error: (error) => {
        expect(error.message).toBe('Resource not found');
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Resource not found' }, { status: 404, statusText: 'Not Found' });
  });

  it('should use default error message when response has no message', (done) => {
    http.get('/api/test').subscribe({
      error: (error) => {
        expect(error.message).toBe('Ha ocurrido un error inesperado');
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should not call logout or navigate on non-401 errors', (done) => {
    http.get('/api/test').subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 403 Forbidden without logout', (done) => {
    http.get('/api/test').subscribe({
      error: (error) => {
        expect(error.message).toBe('Access denied');
        expect(authService.logout).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Access denied' }, { status: 403, statusText: 'Forbidden' });
  });

  it('should handle 500 Server Error with default message', (done) => {
    http.get('/api/test').subscribe({
      error: (error) => {
        expect(error.message).toBe('Ha ocurrido un error inesperado');
        done();
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });
});
