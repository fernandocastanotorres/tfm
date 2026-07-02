import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard, tramitadorGuard, adminGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Component } from '@angular/core';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('Auth Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isTramitador', 'isAdmin']);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'dummy', component: DummyComponent }]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('should allow access when authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

      expect(result).toBeTrue();
    });

    it('should redirect to /login when not authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

      expect(result).toEqual(router.parseUrl('/login'));
    });
  });

  describe('tramitadorGuard', () => {
    it('should allow access when authenticated and is tramitador', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isTramitador.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => tramitadorGuard(null as any, null as any));

      expect(result).toBeTrue();
    });

    it('should allow access when authenticated and is admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isTramitador.and.returnValue(false);
      authServiceSpy.isAdmin.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => tramitadorGuard(null as any, null as any));

      expect(result).toBeTrue();
    });

    it('should redirect to /login when not authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => tramitadorGuard(null as any, null as any));

      expect(result).toEqual(router.parseUrl('/login'));
    });

    it('should redirect to /login when authenticated but neither tramitador nor admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isTramitador.and.returnValue(false);
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => tramitadorGuard(null as any, null as any));

      expect(result).toEqual(router.parseUrl('/login'));
    });
  });

  describe('adminGuard', () => {
    it('should allow access when authenticated and is admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));

      expect(result).toBeTrue();
    });

    it('should redirect to /dashboard when authenticated but not admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));

      expect(result).toEqual(router.parseUrl('/dashboard'));
    });

    it('should redirect to /dashboard when not authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard(null as any, null as any));

      expect(result).toEqual(router.parseUrl('/dashboard'));
    });
  });
});
