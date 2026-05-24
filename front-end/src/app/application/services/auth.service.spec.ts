import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, AuthCredentials } from './auth.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [AuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
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
          expect(sessionStorage.getItem('tfg.access_token')).toBe('fake.access.token');
          expect(sessionStorage.getItem('tfg.refresh_token')).toBe('fake.refresh.token');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send POST to /auth/register on success', (done) => {
      const registerRequest = {
        email: 'new@example.com',
        password: 'pass123',
        fullName: 'John Doe',
        nationalId: '12345678A',
        phone: '+34600000000',
        termsAccepted: true
      };

      service.register(registerRequest).subscribe({
        next: (profile) => {
          expect(profile.email).toBe('new@example.com');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('new@example.com');
      req.flush({ email: 'new@example.com', firstName: 'John', lastName: 'Doe' });
    });
  });

  describe('verifyEmailToken', () => {
    it('should send GET to /auth/verify-email with token param', (done) => {
      service.verifyEmailToken('abc-123').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${environment.apiBaseUrl}/auth/verify-email` &&
        request.params.get('token') === 'abc-123'
      );
      expect(req.request.method).toBe('GET');
      req.flush(null);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should send POST to /auth/resend-verification with email', (done) => {
      service.resendVerificationEmail('user@example.com').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/resend-verification`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('user@example.com');
      req.flush(null);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when a valid non-expired token is stored', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when an expired token is stored', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600, sub: 'user-1' }));
      const fakeToken = `${header}.${payload}.fakesig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false when token is malformed (catches in isTokenExpired)', () => {
      sessionStorage.setItem('tfg.access_token', 'not-a-valid-jwt');
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should send POST to /auth/logout and clear tokens', (done) => {
      sessionStorage.setItem('tfg.access_token', 'some-token');
      sessionStorage.setItem('tfg.refresh_token', 'some-refresh');

      service.logout().subscribe({
        next: () => {
          expect(sessionStorage.getItem('tfg.access_token')).toBeNull();
          expect(sessionStorage.getItem('tfg.refresh_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('should clear tokens even if logout request fails', (done) => {
      sessionStorage.setItem('tfg.access_token', 'some-token');
      sessionStorage.setItem('tfg.refresh_token', 'some-refresh');

      service.logout().subscribe({
        next: () => {
          expect(sessionStorage.getItem('tfg.access_token')).toBeNull();
          expect(sessionStorage.getItem('tfg.refresh_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Error' });
    });
  });

  describe('getToken / getRefreshToken', () => {
    it('should return stored tokens', () => {
      sessionStorage.setItem('tfg.access_token', 'access-123');
      sessionStorage.setItem('tfg.refresh_token', 'refresh-456');

      expect(service.getToken()).toBe('access-123');
      expect(service.getRefreshToken()).toBe('refresh-456');
    });

    it('should return null when tokens are not stored', () => {
      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully and store new tokens', (done) => {
      sessionStorage.setItem('tfg.refresh_token', 'old-refresh');

      service.refreshToken().subscribe({
        next: (newToken) => {
          expect(newToken).toBe('new-access-token');
          expect(sessionStorage.getItem('tfg.access_token')).toBe('new-access-token');
          expect(sessionStorage.getItem('tfg.refresh_token')).toBe('new-refresh-token');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.refreshToken).toBe('old-refresh');
      req.flush({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });
    });

    it('should error when no refresh token is available', (done) => {
      service.refreshToken().subscribe({
        next: () => fail('should have errored'),
        error: (err) => {
          expect(err.message).toBe('No refresh token available');
          done();
        }
      });
    });

    it('should clear tokens and return empty string on refresh failure', (done) => {
      sessionStorage.setItem('tfg.access_token', 'old-access');
      sessionStorage.setItem('tfg.refresh_token', 'old-refresh');

      service.refreshToken().subscribe({
        next: (result) => {
          expect(result).toBe('');
          expect(sessionStorage.getItem('tfg.access_token')).toBeNull();
          expect(sessionStorage.getItem('tfg.refresh_token')).toBeNull();
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/auth/refresh`)
        .flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getAuthenticatedUserLabel', () => {
    it('should return null when no token is stored', () => {
      expect(service.getAuthenticatedUserLabel()).toBeNull();
    });

    it('should return email from token payload', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ email: 'user@example.com', exp: Math.floor(Date.now() / 1000) + 3600 }));
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBe('user@example.com');
    });

    it('should prefer preferred_username over email', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        email: 'user@example.com',
        preferred_username: 'johndoe',
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBe('johndoe');
    });

    it('should return trimmed label', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        email: '  spaced@example.com  ',
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBe('spaced@example.com');
    });

    it('should return null when token has no email or preferred_username', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ sub: 'user-123', exp: Math.floor(Date.now() / 1000) + 3600 }));
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBeNull();
    });

    it('should return null when token payload is not valid JSON', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa('not-valid-json');
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBeNull();
    });

    it('should return null when preferred_username is not a string', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        preferred_username: 12345,
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBeNull();
    });

    it('should return null when email is not a string', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        email: { notAString: true },
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      const fakeToken = `${header}.${payload}.sig`;

      sessionStorage.setItem('tfg.access_token', fakeToken);
      expect(service.getAuthenticatedUserLabel()).toBeNull();
    });
  });
});
