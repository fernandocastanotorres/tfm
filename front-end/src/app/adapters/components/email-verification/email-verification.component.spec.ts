import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EmailVerificationComponent } from './email-verification.component';
import { AuthService } from '../../../application/services/auth.service';

describe('EmailVerificationComponent', () => {
  let component: EmailVerificationComponent;
  let fixture: ComponentFixture<EmailVerificationComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  function setupComponent(token: string | null, verifyResult?: 'success' | 'error'): void {
    authSpy = jasmine.createSpyObj('AuthService', ['verifyEmailToken']);

    if (verifyResult === 'success') {
      authSpy.verifyEmailToken.and.returnValue(of(undefined));
    } else if (verifyResult === 'error') {
      authSpy.verifyEmailToken.and.returnValue(throwError(() => new Error('Invalid token')));
    }

    TestBed.configureTestingModule({
      declarations: [EmailVerificationComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => token } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(EmailVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('No Token', () => {
    it('should set isLoading=false and success=false when no token', () => {
      setupComponent(null);

      expect(component.isLoading).toBeFalse();
      expect(component.success).toBeFalse();
    });

    it('should not call verifyEmailToken when no token', () => {
      setupComponent(null);

      expect(authSpy.verifyEmailToken).not.toHaveBeenCalled();
    });
  });

  describe('Successful Verification', () => {
    it('should set success=true and isLoading=false on successful verification', () => {
      setupComponent('valid-token', 'success');

      expect(component.success).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });

    it('should call verifyEmailToken with correct token', () => {
      setupComponent('valid-token', 'success');

      expect(authSpy.verifyEmailToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('Failed Verification', () => {
    it('should set success=false and isLoading=false on verification error', () => {
      setupComponent('invalid-token', 'error');

      expect(component.success).toBeFalse();
      expect(component.isLoading).toBeFalse();
    });

    it('should call verifyEmailToken even when it fails', () => {
      setupComponent('invalid-token', 'error');

      expect(authSpy.verifyEmailToken).toHaveBeenCalledWith('invalid-token');
    });
  });
});
