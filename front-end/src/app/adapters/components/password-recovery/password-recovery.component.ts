import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../application/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-password-recovery',
    templateUrl: './password-recovery.component.html',
    standalone: false
})
export class PasswordRecoveryComponent implements OnInit {
  readonly requestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$')]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: [PasswordRecoveryComponent.passwordsMatch] });

  step: 'request' | 'reset' | 'done' = 'request';
  isSubmitting = false;
  helperMessageKey = '';
  errorMessageKey = '';
  private resetToken: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.resetToken = token;
      this.step = 'reset';
    }
  }

  requestReset(): void {
    this.errorMessageKey = '';
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email } = this.requestForm.value;
    this.authService.forgotPassword(email as string).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.helperMessageKey = 'RECOVERY.EMAIL_SENT';
        this.step = 'done';
      },
      error: () => {
        this.isSubmitting = false;
        this.helperMessageKey = 'RECOVERY.EMAIL_SENT';
        this.step = 'done';
      }
    });
  }

  resetPassword(): void {
    this.errorMessageKey = '';
    if (this.resetForm.invalid || !this.resetToken) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { newPassword } = this.resetForm.value;
    this.authService.resetPassword(this.resetToken, newPassword as string).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.step = 'done';
        this.helperMessageKey = 'RECOVERY.RESET_SUCCESS';
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessageKey = 'RECOVERY.RESET_ERROR';
      }
    });
  }

  static passwordsMatch(group: { get: (key: string) => any }): null | { mismatch: true } {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { mismatch: true } : null;
  }
}
