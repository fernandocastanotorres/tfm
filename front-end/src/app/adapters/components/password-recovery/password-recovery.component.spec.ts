import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { OtpService } from '../../../application/services/otp.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('PasswordRecoveryComponent', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;
  let otpService: OtpService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PasswordRecoveryComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        OtpService,
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryComponent);
    component = fixture.componentInstance;
    otpService = TestBed.inject(OtpService);
    fixture.detectChanges();
  });

  it('should move to verify step after requesting otp', () => {
    component.requestForm.setValue({ email: 'user@example.com', nationalId: '12345678A' });
    component.requestOtp();
    expect(component.step).toBe('verify');
  });

  it('should move to reset step when otp is valid', () => {
    component.requestForm.setValue({ email: 'user@example.com', nationalId: '12345678A' });
    component.requestOtp();
    const code = otpService.generateOtp('user@example.com');
    component.otpForm.setValue({ otp: code });
    component.verifyOtp();
    expect(component.step).toBe('reset');
  });

  it('should finish when reset form is valid', () => {
    component.step = 'reset';
    component.resetForm.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    component.resetPassword();
    expect(component.step).toBe('done');
  });

  it('should redirect to login after reset', (done) => {
    const router = TestBed.inject(Router);
    component.step = 'reset';
    component.resetForm.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    component.resetPassword();
    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/sede/login']);
      done();
    }, 1300);
  });

  it('should NOT request otp when request form is invalid', () => {
    component.requestForm.setValue({ email: 'invalid', nationalId: '123' });
    component.requestOtp();
    expect(component.step).toBe('request');
  });

  it('should NOT verify otp when otp form is invalid', () => {
    component.otpForm.setValue({ otp: 'abc' });
    component.verifyOtp();
    expect(component.step).toBe('request');
  });

  it('should show error when OTP is invalid', () => {
    component.requestForm.setValue({ email: 'user@example.com', nationalId: '12345678A' });
    component.requestOtp();
    component.otpForm.setValue({ otp: '000000' });
    component.verifyOtp();
    expect(component.errorMessageKey).toBe('RECOVERY.OTP_ERROR');
  });

  it('should NOT reset password when reset form is invalid', () => {
    component.step = 'reset';
    component.resetForm.setValue({ newPassword: '', confirmPassword: '' });
    component.resetPassword();
    expect(component.step).toBe('reset');
  });

  it('passwordsMatch should return null when password is missing', () => {
    const group = { get: (key: string) => key === 'newPassword' ? { value: '' } : { value: 'test' } };
    const result = PasswordRecoveryComponent.passwordsMatch(group as any);
    expect(result).toBeNull();
  });

  it('passwordsMatch should return null when confirm is missing', () => {
    const group = { get: (key: string) => key === 'newPassword' ? { value: 'test' } : { value: '' } };
    const result = PasswordRecoveryComponent.passwordsMatch(group as any);
    expect(result).toBeNull();
  });

  it('passwordsMatch should return mismatch when passwords differ', () => {
    const group = { get: (key: string) => key === 'newPassword' ? { value: 'Pass1!' } : { value: 'Pass2!' } };
    const result = PasswordRecoveryComponent.passwordsMatch(group as any);
    expect(result).toEqual({ mismatch: true });
  });
});
