import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { HttpClient, HTTP_INTERCEPTORS, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastService } from '../services/toast.service';

describe('HttpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);
    toastSpy = jasmine.createSpyObj('ToastService', ['error', 'warning']);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: Router, useValue: spy },
        { provide: ToastService, useValue: toastSpy },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => httpMock.verify());

  it('should redirect to /login for a 401 error', () => {
    httpClient.get('/test').subscribe(
      () => fail('Expected error response'),
      () => expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/login'])
    );
    
    httpMock.expectOne('/test').flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('should return validation errors for a 400 status', () => {
    const validationErrors = { field: ['Invalid value'] };

    httpClient.post('/test', {}).subscribe(
      () => fail('Expected error response'),
      (error: unknown) => {
        // Interceptor transforms { field: ['Invalid value'] } -> { field: 'Invalid value' }
        expect(error).toEqual({ field: 'Invalid value' });
      }
    );

    httpMock
      .expectOne('/test')
      .flush(validationErrors, { status: 400, statusText: 'Bad Request' });
  });

  it('should return global error when 400 body is not an object', () => {
    httpClient.post('/test', {}).subscribe(
      () => fail('Expected error response'),
      (error: unknown) => {
        // error.message on HttpErrorResponse is the full HTTP message
        expect((error as any).global).toContain('400');
      }
    );

    httpMock
      .expectOne('/test')
      .flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  it('should show toast error for a 403 error then rethrow', () => {
    httpClient.get('/test').subscribe({
      next: () => fail('Expected error'),
      error: () => {
        expect(toastSpy.error).toHaveBeenCalledWith('Acceso denegado', 'No tienes permisos para realizar esta accion.');
      }
    });

    httpMock.expectOne('/test').flush(null, { status: 403, statusText: 'Forbidden' });
  });

  it('should show toast warning for a 409 error with message, then rethrow', () => {
    httpClient.post('/test', {}).subscribe({
      next: () => fail('Expected error'),
      error: () => {
        expect(toastSpy.warning).toHaveBeenCalledWith('Conflicto', jasmine.any(String));
      }
    });

    httpMock.expectOne('/test').flush({ message: 'Resource conflict' }, { status: 409, statusText: 'Conflict' });
  });

  it('should show toast warning for a 409 error without message, then rethrow', () => {
    httpClient.post('/test', {}).subscribe({
      next: () => fail('Expected error'),
      error: () => {
        expect(toastSpy.warning).toHaveBeenCalledWith('Conflicto', 'Operacion no permitida en este momento.');
      }
    });

    httpMock.expectOne('/test').flush(null, { status: 409, statusText: 'Conflict' });
  });

  it('should show toast error for a 500 error', () => {
    httpClient.get('/test').subscribe({
      next: () => fail('Expected error'),
      error: () => {
        expect(toastSpy.error).toHaveBeenCalledWith('Error del servidor', 'Ha ocurrido un error inesperado. Intentalo de nuevo mas tarde.');
      }
    });

    httpMock.expectOne('/test').flush(null, { status: 500, statusText: 'Server Error' });
  });

  it('should show toast error for a generic 4xx error (default branch)', () => {
    httpClient.get('/test').subscribe({
      next: () => fail('Expected error'),
      error: () => {
        expect(toastSpy.error).toHaveBeenCalledWith('Error', 'Ha ocurrido un error inesperado.');
      }
    });

    httpMock.expectOne('/test').flush(null, { status: 402, statusText: 'Payment Required' });
  });

  it('should return global validation error when error body is a string', () => {
    httpClient.post('/test', {}).subscribe({
      next: () => fail('Expected error'),
      error: (error: unknown) => {
        expect((error as any).global).toBeDefined();
      }
    });

    httpMock.expectOne('/test').flush('string body', { status: 400, statusText: 'Bad Request' });
  });

  it('should return global validation error when error body is null', () => {
    httpClient.post('/test', {}).subscribe({
      next: () => fail('Expected error'),
      error: (error: unknown) => {
        expect((error as any).global).toBeDefined();
      }
    });

    httpMock.expectOne('/test').flush(null, { status: 400, statusText: 'Bad Request' });
  });
});