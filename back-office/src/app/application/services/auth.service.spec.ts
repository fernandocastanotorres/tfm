import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  function setupService() {
    TestBed.configureTestingModule({
    imports: [],
    providers: [AuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpMock?.verify();
    TestBed.resetTestingModule();
  });

  describe('isAuthenticated', () => {
    beforeEach(() => setupService());

    it('should return false when no token is stored', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when a valid non-expired token is stored', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when an expired token is stored', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false when token is malformed', () => {
      localStorage.setItem('bo_access_token', 'not-a-valid-token');
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('hasRole', () => {
    it('should return false when no user is logged in', () => {
      setupService();
      expect(service.hasRole('ADMIN')).toBeFalse();
    });

    it('should return true when user has the requested role', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'admin@tfg.es',
        roles: ['ROLE_ADMIN', 'ROLE_CITIZEN']
      }));

      setupService();

      expect(service.hasRole('ADMIN')).toBeTrue();
    });

    it('should return true when role is passed with ROLE_ prefix', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'tramitador@tfg.es',
        roles: ['ROLE_TRAMITADOR']
      }));

      setupService();

      expect(service.hasRole('ROLE_TRAMITADOR')).toBeTrue();
    });

    it('should return false when user does not have the requested role', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'tramitador@tfg.es',
        roles: ['ROLE_TRAMITADOR']
      }));

      setupService();

      expect(service.hasRole('ADMIN')).toBeFalse();
    });
  });

  describe('isTramitador', () => {
    it('should return true when user has TRAMITADOR role', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'tramitador@tfg.es',
        roles: ['ROLE_TRAMITADOR']
      }));

      setupService();

      expect(service.isTramitador()).toBeTrue();
    });

    it('should return false when user does not have TRAMITADOR role', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'admin@tfg.es',
        roles: ['ROLE_ADMIN']
      }));

      setupService();

      expect(service.isTramitador()).toBeFalse();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user has ADMIN role', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'admin@tfg.es',
        roles: ['ROLE_ADMIN']
      }));

      setupService();

      expect(service.isAdmin()).toBeTrue();
    });

    it('should return false when user does not have ADMIN role', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('bo_access_token', fakeToken);
      localStorage.setItem('bo_user', JSON.stringify({
        id: 'user-1',
        email: 'tramitador@tfg.es',
        roles: ['ROLE_TRAMITADOR']
      }));

      setupService();

      expect(service.isAdmin()).toBeFalse();
    });
  });

  describe('getAccessToken / getRefreshToken', () => {
    beforeEach(() => setupService());

    it('should return stored access token', () => {
      localStorage.setItem('bo_access_token', 'access-123');
      expect(service.getAccessToken()).toBe('access-123');
    });

    it('should return stored refresh token', () => {
      localStorage.setItem('bo_refresh_token', 'refresh-456');
      expect(service.getRefreshToken()).toBe('refresh-456');
    });

    it('should return null when tokens are not stored', () => {
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => setupService());

    it('should error when no refresh token is available', (done) => {
      service.refreshToken().subscribe({
        error: (err) => {
          expect(err.message).toBe('No refresh token available');
          done();
        }
      });
    });

    it('should send POST to /auth/refresh and store new tokens', (done) => {
      localStorage.setItem('bo_refresh_token', 'old-refresh');

      service.refreshToken().subscribe({
        next: (token) => {
          expect(token).toBe('new-access-token');
          expect(localStorage.getItem('bo_access_token')).toBe('new-access-token');
          expect(localStorage.getItem('bo_refresh_token')).toBe('new-refresh');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush({ accessToken: 'new-access-token', refreshToken: 'new-refresh' });
    });
  });

  describe('login', () => {
    beforeEach(() => setupService());

    it('should send POST to /auth/login and store tokens and user', (done) => {
      const loginRequest = { email: 'admin@tfg.es', password: 'pass123' };
      const mockResponse = {
        accessToken: 'fake.access.token',
        refreshToken: 'fake.refresh.token',
        user: { id: 'user-1', email: 'admin@tfg.es', roles: ['ROLE_ADMIN'] }
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response.accessToken).toBe('fake.access.token');
          expect(localStorage.getItem('bo_access_token')).toBe('fake.access.token');
          expect(localStorage.getItem('bo_refresh_token')).toBe('fake.refresh.token');
          expect(service.currentUser).toBeTruthy();
          expect(service.currentUser?.email).toBe('admin@tfg.es');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    beforeEach(() => setupService());

    it('should clear all stored tokens and user without calling server when no refresh token', () => {
      localStorage.setItem('bo_access_token', 'some-token');
      localStorage.setItem('bo_user', JSON.stringify({ id: 'user-1', email: 'admin@tfg.es', roles: ['ROLE_ADMIN'] }));

      service.logout();

      expect(localStorage.getItem('bo_access_token')).toBeNull();
      expect(localStorage.getItem('bo_refresh_token')).toBeNull();
      expect(localStorage.getItem('bo_user')).toBeNull();
      expect(service.currentUser).toBeNull();
    });

    it('should call server logout when refresh token exists', () => {
      localStorage.setItem('bo_access_token', 'some-token');
      localStorage.setItem('bo_refresh_token', 'some-refresh');
      localStorage.setItem('bo_user', JSON.stringify({ id: 'user-1', email: 'admin@tfg.es', roles: ['ROLE_ADMIN'] }));

      service.logout();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);

      expect(localStorage.getItem('bo_access_token')).toBeNull();
      expect(localStorage.getItem('bo_refresh_token')).toBeNull();
      expect(localStorage.getItem('bo_user')).toBeNull();
      expect(service.currentUser).toBeNull();
    });
  });
});
