import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HttpErrorInterceptor } from './http-error.interceptor';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';

describe('HttpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: spy },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
      ],
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
      (error: HttpErrorResponse) => {
        expect(error.error).toEqual(validationErrors);
      }
    );

    httpMock
      .expectOne('/test')
      .flush(validationErrors, { status: 400, statusText: 'Bad Request' });
  });

  // Add tests for 403 and 500 errors with relevant expectations
});