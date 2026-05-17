import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UserManagementService } from '../services/user-management.service';
import { AuthService } from '../services/auth.service';
import { JwtAuthInterceptor } from './jwt-auth.interceptor';

describe('JwtAuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let userManagementService: UserManagementService;

  const authServiceMock: Pick<AuthService, 'getAccessToken' | 'refreshToken' | 'logout'> = {
    getAccessToken: jasmine.createSpy('getAccessToken').and.returnValue('expired-token'),
    refreshToken: jasmine.createSpy('refreshToken').and.returnValue(of('new-token')),
    logout: jasmine.createSpy('logout')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserManagementService,
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtAuthInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    userManagementService = TestBed.inject(UserManagementService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('retries update user after refreshing token on 401', () => {
    (authServiceMock.getAccessToken as jasmine.Spy).and.returnValue('expired-token');
    (authServiceMock.refreshToken as jasmine.Spy).and.returnValue(of('new-token'));

    userManagementService.update('f58830ec-45cb-4086-8e47-8502c87b3d6e', {
      email: 'fcastano.tsol@gmail.com',
      roles: ['ROLE_CITIZEN'],
      isActive: true
    }).subscribe();

    const firstUpdate = httpMock.expectOne((request) =>
      request.method === 'PUT' && request.url.includes('/admin/users/f58830ec-45cb-4086-8e47-8502c87b3d6e')
    );
    expect(firstUpdate.request.headers.get('Authorization')).toBe('Bearer expired-token');
    firstUpdate.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retriedUpdate = httpMock.expectOne((request) =>
      request.method === 'PUT' && request.url.includes('/admin/users/f58830ec-45cb-4086-8e47-8502c87b3d6e')
    );
    expect(retriedUpdate.request.headers.get('Authorization')).toBe('Bearer new-token');
    retriedUpdate.flush({
      id: 'f58830ec-45cb-4086-8e47-8502c87b3d6e',
      email: 'fcastano.tsol@gmail.com',
      roles: ['ROLE_CITIZEN'],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    });

    expect(authServiceMock.refreshToken).toHaveBeenCalled();
  });
});
