import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../application/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let translateService: TranslateService;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'resendVerificationEmail']);

    await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, TranslateModule.forRoot(), LoginComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        { provide: AuthService, useValue: authSpy },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    queryParamMap: {
                        get: () => null
                    }
                }
            }
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
    ],
}).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    translateService = TestBed.inject(TranslateService);
    translateService.currentLang = 'es';
    spyOn(translateService, 'instant').and.callFake((key: string) => {
      const translations: Record<string, string> = {
        'LOGIN.RESEND_SUCCESS': 'Se ha reenviado el enlace de verificación.',
        'LOGIN.RESEND_ERROR': 'No se pudo procesar la solicitud. Intente nuevamente.',
      };
      return translations[key] || key;
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should navigate on successful login', () => {
    authService.login.and.returnValue(of({} as any));
    component.loginForm.setValue({ email: 'user@example.com', password: 'password123' });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should show error when login fails', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 401 })));
    component.loginForm.setValue({ email: 'user@example.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessageKey).toBe('LOGIN.ERROR_INVALID');
  });

  it('should show custom error message when login fails with error.message', () => {
    authService.login.and.returnValue(throwError(() => ({ error: { message: 'Account locked' } })));
    component.loginForm.setValue({ email: 'user@example.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessageKey).toBe('Account locked');
  });

  it('should show generic error when login fails without specific error', () => {
    authService.login.and.returnValue(throwError(() => new Error('Network error')));
    component.loginForm.setValue({ email: 'user@example.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessageKey).toBe('LOGIN.ERROR_GENERIC');
  });

  it('should return returnUrl when queryParamMap has valid path', () => {
    (component as any).route.snapshot.queryParamMap.get = () => '/dashboard';
    expect(component.returnUrl).toBe('/dashboard');
  });

  it('should return "/" when returnUrl does not start with /', () => {
    (component as any).route.snapshot.queryParamMap.get = () => 'http://evil.com';
    expect(component.returnUrl).toBe('/');
  });

  it('resendVerificationEmail should not call service when email is invalid', () => {
    component.loginForm.get('email')?.setValue('invalid-email');
    component.resendVerificationEmail();
    expect(authService.resendVerificationEmail).not.toHaveBeenCalled();
  });

  it('resendVerificationEmail should show info message on success', () => {
    authService.resendVerificationEmail.and.returnValue(of(undefined));
    component.loginForm.get('email')?.setValue('user@example.com');
    component.resendVerificationEmail();
    expect(component.infoMessage).toContain('reenviado el enlace');
    expect(component.isResending).toBeFalse();
  });

  it('resendVerificationEmail should show error message on failure', () => {
    authService.resendVerificationEmail.and.returnValue(throwError(() => new Error('Failed')));
    component.loginForm.get('email')?.setValue('user@example.com');
    component.resendVerificationEmail();
    expect(component.infoMessage).toContain('No se pudo procesar');
    expect(component.isResending).toBeFalse();
  });
});
