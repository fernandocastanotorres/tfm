import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, AuthCredentials } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST to /auth/login and store tokens on success', (done) => {
      const credentials: AuthCredentials = { email: 'user@example.com', password: 'pass123' };
      const mockResponse = {
        accessToken: 'fake.access.token',
        refreshToken: 'fake.refresh.token',
        expiresIn: 900000
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response.accessToken).toBe('fake.access.token');
          expect(localStorage.getItem('tfg.access_token')).toBe('fake.access.token');
          expect(localStorage.getItem('tfg.refresh_token')).toBe('fake.refresh.token');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when a valid non-expired token is stored', () => {
      // Create a fake JWT with expiration far in the future
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('tfg.access_token', fakeToken);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when an expired token is stored', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      localStorage.setItem('tfg.access_token', fakeToken);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should send POST to /auth/logout and clear tokens', (done) => {
      localStorage.setItem('tfg.access_token', 'some-token');
      localStorage.setItem('tfg.refresh_token', 'some-refresh');

      service.logout().subscribe({
        next: () => {
          expect(localStorage.getItem('tfg.access_token')).toBeNull();
          expect(localStorage.getItem('tfg.refresh_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('should clear tokens even if logout request fails', (done) => {
      localStorage.setItem('tfg.access_token', 'some-token');
      localStorage.setItem('tfg.refresh_token', 'some-refresh');

      service.logout().subscribe({
        next: () => {
          expect(localStorage.getItem('tfg.access_token')).toBeNull();
          expect(localStorage.getItem('tfg.refresh_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Error' });
    });
  });

  describe('getToken / getRefreshToken', () => {
    it('should return stored tokens', () => {
      localStorage.setItem('tfg.access_token', 'access-123');
      localStorage.setItem('tfg.refresh_token', 'refresh-456');

      expect(service.getToken()).toBe('access-123');
      expect(service.getRefreshToken()).toBe('refresh-456');
    });

    it('should return null when tokens are not stored', () => {
      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });
});
