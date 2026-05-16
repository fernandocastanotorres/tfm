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
});
