import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { AuthService } from '../../../application/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('PasswordRecoveryComponent', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['forgotPassword', 'resetPassword']);
    mockAuthService.forgotPassword.and.returnValue(of(void 0));
    mockAuthService.resetPassword.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      declarations: [PasswordRecoveryComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } }
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show confirmation after requesting reset', () => {
    component.requestForm.setValue({ email: 'user@example.com' });
    component.requestReset();
    expect(component.step).toBe('done');
  });

  it('should finish when reset form is valid', () => {
    component.step = 'reset';
    (component as any).resetToken = 'valid-token';
    component.resetForm.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    component.resetPassword();
    expect(component.step).toBe('done');
  });

  it('should NOT request reset when request form is invalid', () => {
    component.requestForm.setValue({ email: 'invalid' });
    component.requestReset();
    expect(component.step).toBe('request');
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

  it('should show helper message on successful reset', () => {
    component.step = 'reset';
    (component as any).resetToken = 'valid-token';
    component.resetForm.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    component.resetPassword();
    expect(component.helperMessageKey).toBe('RECOVERY.RESET_SUCCESS');
  });
});
