import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../application/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  function createRouteWithReturnUrl(url: string | null): jasmine.SpyObj<ActivatedRoute> {
    return {
      snapshot: {
        queryParamMap: {
          get: (key: string) => key === 'returnUrl' ? url : null
        }
      }
    } as unknown as jasmine.SpyObj<ActivatedRoute>;
  }

  function fillValidForm(): void {
    component.registerForm.setValue({
      fullName: 'Juan Pérez',
      email: 'juan@example.com',
      nationalId: '12345678A',
      phone: '600123456',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      acceptTerms: true
    });
  }

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['register', 'resendVerificationEmail']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routeSpy = createRouteWithReturnUrl(null);

    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── Form Creation ───────────────────────────────────────────────

  describe('Form Creation', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have registerForm with all 7 controls', () => {
      const form = component.registerForm;
      expect(form.get('fullName')).toBeTruthy();
      expect(form.get('email')).toBeTruthy();
      expect(form.get('nationalId')).toBeTruthy();
      expect(form.get('phone')).toBeTruthy();
      expect(form.get('password')).toBeTruthy();
      expect(form.get('confirmPassword')).toBeTruthy();
      expect(form.get('acceptTerms')).toBeTruthy();
    });

    it('should have acceptTerms default to false', () => {
      expect(component.registerForm.get('acceptTerms')?.value).toBeFalse();
    });
  });

  // ─── Form Validation ─────────────────────────────────────────────

  describe('Form Validation', () => {
    it('fullName should be invalid when empty', () => {
      const control = component.registerForm.get('fullName');
      control?.setValue('');
      expect(control?.invalid).toBeTrue();
    });

    it('fullName should be invalid when less than 3 chars', () => {
      const control = component.registerForm.get('fullName');
      control?.setValue('Jo');
      expect(control?.invalid).toBeTrue();
    });

    it('email should be invalid when not a valid email', () => {
      const control = component.registerForm.get('email');
      control?.setValue('not-an-email');
      expect(control?.invalid).toBeTrue();
    });

    it('nationalId should be invalid when wrong format', () => {
      const control = component.registerForm.get('nationalId');
      control?.setValue('12345');
      expect(control?.invalid).toBeTrue();
    });

    it('phone should be invalid when not 9 digits', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('12345');
      expect(control?.invalid).toBeTrue();
    });

    it('password should be invalid when less than 8 chars', () => {
      const control = component.registerForm.get('password');
      control?.setValue('Ab1!');
      expect(control?.invalid).toBeTrue();
    });

    it('password should be invalid when missing uppercase', () => {
      const control = component.registerForm.get('password');
      control?.setValue('password1!');
      expect(control?.invalid).toBeTrue();
    });

    it('passwordsMatch validator should detect mismatch', () => {
      component.registerForm.setValue({
        fullName: 'Juan Pérez',
        email: 'juan@example.com',
        nationalId: '12345678A',
        phone: '600123456',
        password: 'Password1!',
        confirmPassword: 'Different1!',
        acceptTerms: true
      });
      expect(component.registerForm.hasError('mismatch')).toBeTrue();
    });
  });

  // ─── Return URL ──────────────────────────────────────────────────

  describe('Return URL', () => {
    it('should return query param when valid', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [RegisterComponent],
        imports: [ReactiveFormsModule, TranslateModule.forRoot()],
        providers: [
          { provide: AuthService, useValue: authSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: createRouteWithReturnUrl('/dashboard') }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;

      expect(component.returnUrl).toBe('/dashboard');
    });

    it('should return "/" when no query param', () => {
      expect(component.returnUrl).toBe('/');
    });
  });

  // ─── Submit — Success ────────────────────────────────────────────

  describe('Submit — Success', () => {
    it('should call authService.register with correct data', fakeAsync(() => {
      authSpy.register.and.returnValue(of({} as any));
      fillValidForm();

      component.onSubmit();

      expect(authSpy.register).toHaveBeenCalledWith({
        fullName: 'Juan Pérez',
        email: 'juan@example.com',
        nationalId: '12345678A',
        phone: '600123456',
        password: 'Password1!'
      });
      tick();
    }));

    it('should show success message on success', fakeAsync(() => {
      authSpy.register.and.returnValue(of({} as any));
      fillValidForm();

      component.onSubmit();
      tick();

      expect(component.successMessageKey).toBe('REGISTER.SUCCESS');
      expect(component.infoMessage).toContain('verificacion');
      expect(component.isSubmitting).toBeFalse();
    }));
  });

  // ─── Submit — Validation ─────────────────────────────────────────

  describe('Submit — Validation', () => {
    it('should mark form as touched when invalid', () => {
      component.onSubmit();

      expect(component.registerForm.get('fullName')?.touched).toBeTrue();
      expect(component.registerForm.get('email')?.touched).toBeTrue();
      expect(component.registerForm.get('acceptTerms')?.touched).toBeTrue();
    });

    it('should NOT call register when form is invalid', () => {
      component.onSubmit();

      expect(authSpy.register).not.toHaveBeenCalled();
    });
  });

  // ─── Submit — Error Handling ─────────────────────────────────────

  describe('Submit — Error Handling', () => {
    it('should handle 409 conflict (duplicate)', fakeAsync(() => {
      authSpy.register.and.returnValue(throwError(() => ({ status: 409 })));
      fillValidForm();

      component.onSubmit();
      tick();

      expect(component.errorMessageKey).toBe('REGISTER.ERROR_DUPLICATE');
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle validation details from server', fakeAsync(() => {
      const serverError = {
        status: 400,
        error: {
          details: [
            { field: 'email', issue: 'already in use' },
            { field: 'nationalId', issue: 'invalid format' }
          ]
        }
      };
      authSpy.register.and.returnValue(throwError(() => serverError));
      fillValidForm();

      component.onSubmit();
      tick();

      expect(component.errorMessageKey).toBe('REGISTER.ERROR_VALIDATION');
      expect(component.registerForm.get('email')?.hasError('server')).toBeTrue();
      expect(component.registerForm.get('nationalId')?.hasError('server')).toBeTrue();
    }));

    it('should handle error message from server', fakeAsync(() => {
      const serverError = {
        status: 500,
        error: { message: 'REGISTER.ERROR_CUSTOM' }
      };
      authSpy.register.and.returnValue(throwError(() => serverError));
      fillValidForm();

      component.onSubmit();
      tick();

      expect(component.errorMessageKey).toBe('REGISTER.ERROR_CUSTOM');
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle generic error', fakeAsync(() => {
      authSpy.register.and.returnValue(throwError(() => ({ status: 500 })));
      fillValidForm();

      component.onSubmit();
      tick();

      expect(component.errorMessageKey).toBe('REGISTER.ERROR_GENERIC');
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle validation errors from interceptor', fakeAsync(() => {
      const interceptorErrors = {
        email: 'must be a valid email address',
        phone: 'must contain 9 digits'
      };
      authSpy.register.and.returnValue(throwError(() => interceptorErrors));
      fillValidForm();

      component.onSubmit();
      tick();

      expect(component.errorMessageKey).toBe('REGISTER.ERROR_VALIDATION');
      expect(component.registerForm.get('email')?.hasError('server')).toBeTrue();
      expect(component.registerForm.get('phone')?.hasError('server')).toBeTrue();
    }));
  });

  // ─── Resend Verification ─────────────────────────────────────────

  describe('Resend Verification', () => {
    it('should call service with email', fakeAsync(() => {
      authSpy.resendVerificationEmail.and.returnValue(of(undefined));
      component.registerForm.get('email')?.setValue('test@example.com');

      component.resendVerificationEmail();
      tick();

      expect(authSpy.resendVerificationEmail).toHaveBeenCalledWith('test@example.com');
      expect(component.isResending).toBeFalse();
    }));

    it('should do nothing when no email', () => {
      component.registerForm.get('email')?.setValue('');

      component.resendVerificationEmail();

      expect(authSpy.resendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should show info message on success', fakeAsync(() => {
      authSpy.resendVerificationEmail.and.returnValue(of(undefined));
      component.registerForm.get('email')?.setValue('test@example.com');

      component.resendVerificationEmail();
      tick();

      expect(component.infoMessage).toContain('reenviado');
    }));
  });

  // ─── Static Validator ────────────────────────────────────────────

  describe('Static Validator — passwordsMatch', () => {
    it('should return null when passwords match', () => {
      const mockGroup = {
        get: (key: string) => ({
          value: key === 'password' ? 'Secret1!' : 'Secret1!'
        })
      };

      expect(RegisterComponent.passwordsMatch(mockGroup)).toBeNull();
    });

    it('should return mismatch when different', () => {
      const mockGroup = {
        get: (key: string) => ({
          value: key === 'password' ? 'Secret1!' : 'Different1!'
        })
      };

      expect(RegisterComponent.passwordsMatch(mockGroup)).toEqual({ mismatch: true });
    });
  });
});
