import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    localStorage.clear();
  });

  it('should return false when credentials are missing', () => {
    expect(service.login({ email: '', password: '' })).toBeFalse();
  });

  it('should store authenticated flag on login', () => {
    const result = service.login({ email: 'user@example.com', password: 'password123' });
    expect(result).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should clear authentication on logout', () => {
    service.login({ email: 'user@example.com', password: 'password123' });
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
