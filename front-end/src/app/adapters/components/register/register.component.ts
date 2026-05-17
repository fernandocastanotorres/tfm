import { Component } from '@angular/core';
import { FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';
import { RegisterRequest } from '../../../application/models/auth.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  readonly registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    nationalId: ['', [Validators.required, Validators.pattern('^[0-9]{8}[A-Za-z]$|^[XYZ][0-9]{7}[A-Za-z]$')]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$')]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, { validators: [RegisterComponent.passwordsMatch] });

  isSubmitting = false;
  isResending = false;
  successMessageKey = '';
  errorMessageKey = '';
  infoMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  get returnUrl(): string {
    const candidate = this.route.snapshot.queryParamMap.get('returnUrl');
    return candidate && candidate.startsWith('/') ? candidate : '/';
  }

  onSubmit(): void {
    this.successMessageKey = '';
    this.errorMessageKey = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const request: RegisterRequest = {
      fullName: this.registerForm.value.fullName ?? '',
      email: this.registerForm.value.email ?? '',
      nationalId: this.registerForm.value.nationalId ?? '',
      phone: this.registerForm.value.phone ?? '',
      password: this.registerForm.value.password ?? ''
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessageKey = 'REGISTER.SUCCESS';
        this.infoMessage = 'Te hemos enviado un enlace de verificacion al correo indicado.';
      },
      error: (error) => {
        this.isSubmitting = false;

        // Handle HttpErrorResponse (401, 403, 409, 500, etc.)
        if (error?.status === 409) {
          this.errorMessageKey = 'REGISTER.ERROR_DUPLICATE';
        } else if (error?.error?.details && Array.isArray(error.error.details)) {
          // Backend ErrorResponse with details array
          const details = error.error.details as Array<{ field: string; issue: string }>;
          for (const detail of details) {
            const control = this.registerForm.get(detail.field);
            if (control) {
              control.setErrors({ server: detail.issue });
            }
          }
          this.errorMessageKey = 'REGISTER.ERROR_VALIDATION';
        } else if (error?.error?.message) {
          this.errorMessageKey = error.error.message;
        } else if (typeof error === 'object' && !error?.status) {
          // ValidationErrors from interceptor (400 transformed)
          this.applyValidationErrors(error as ValidationErrors);
          this.errorMessageKey = 'REGISTER.ERROR_VALIDATION';
        } else {
          this.errorMessageKey = 'REGISTER.ERROR_GENERIC';
        }
      }
    });
  }

  resendVerificationEmail(): void {
    const email = this.registerForm.value.email;
    if (!email) {
      return;
    }
    this.isResending = true;
    this.authService.resendVerificationEmail(email).subscribe({
      next: () => {
        this.isResending = false;
        this.infoMessage = 'Si la cuenta existe y no esta activa, hemos reenviado el enlace de verificacion.';
      },
      error: () => {
        this.isResending = false;
        this.infoMessage = 'No se pudo procesar la solicitud en este momento.';
      }
    });
  }

  /**
   * Apply ValidationErrors from the interceptor to form controls.
   */
  private applyValidationErrors(errors: ValidationErrors): void {
    for (const [field, message] of Object.entries(errors)) {
      if (field === 'global') continue;
      const control = this.registerForm.get(field);
      if (control) {
        control.setErrors({ server: message });
      }
    }
  }

  static passwordsMatch(group: { get: (key: string) => any }): null | { mismatch: true } {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { mismatch: true } : null;
  }
}
