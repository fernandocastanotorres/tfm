import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should allow navigation when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/dashboard' } as any)
    );

    expect(result).toBeTrue();
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/dashboard' } as any)
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/sede/login');
    expect((result as UrlTree).toString()).toContain('returnUrl');
  });

  it('should include the original URL as returnUrl query param', () => {
    authService.isAuthenticated.and.returnValue(false);
    const returnUrl = '/protected/resource?id=123';

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: returnUrl } as any)
    );

    const urlTree = result as UrlTree;
    expect(urlTree.toString()).toContain(`returnUrl=${encodeURIComponent(returnUrl)}`);
  });

  it('should call isAuthenticated on the AuthService', () => {
    authService.isAuthenticated.and.returnValue(true);

    TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/home' } as any)
    );

    expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
  });
});
