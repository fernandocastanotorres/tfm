import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OtpService } from '../../../application/services/otp.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-password-recovery',
    templateUrl: './password-recovery.component.html',
    styleUrls: [],
    standalone: false
})
export class PasswordRecoveryComponent {
  readonly requestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nationalId: ['', [Validators.required, Validators.pattern('^[0-9]{8}[A-Za-z]$|^[XYZ][0-9]{7}[A-Za-z]$')]]
  });

  readonly otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  readonly resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$')]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: [PasswordRecoveryComponent.passwordsMatch] });

  step: 'request' | 'verify' | 'reset' | 'done' = 'request';
  helperMessageKey = '';
  errorMessageKey = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly otpService: OtpService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  requestOtp(): void {
    this.errorMessageKey = '';
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const { email } = this.requestForm.value;
    const code = this.otpService.generateOtp(email as string);
    this.helperMessageKey = 'RECOVERY.OTP_SENT';
    this.step = 'verify';
  }

  verifyOtp(): void {
    this.errorMessageKey = '';
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const { otp } = this.otpForm.value;
    const valid = this.otpService.verifyOtp(otp as string);
    if (valid) {
      this.step = 'reset';
    } else {
      this.errorMessageKey = 'RECOVERY.OTP_ERROR';
    }
  }

  resetPassword(): void {
    this.errorMessageKey = '';
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.step = 'done';
    setTimeout(() => {
      this.router.navigate(['/sede/login']);
    }, 1200);
  }

  static passwordsMatch(group: { get: (key: string) => any }): null | { mismatch: true } {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { mismatch: true } : null;
  }
}
