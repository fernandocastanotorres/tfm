import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../../application/services/profile.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { ToastService } from '../../../application/services/toast.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, string>> {
    return of({});
  }
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileSpy: jasmine.SpyObj<ProfileService>;
  let confirmSpy: jasmine.SpyObj<ConfirmDialogService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let translateService: TranslateService;

  const mockProfile = {
    fullName: 'John Doe',
    email: 'john@test.com',
    phone: '123456789',
    nationalId: '12345678A',
    address: '123 Main St'
  };

  beforeEach(() => {
    profileSpy = jasmine.createSpyObj('ProfileService', ['getProfile', 'updateProfile', 'changePassword']);
    confirmSpy = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: ProfileService, useValue: profileSpy },
        { provide: ConfirmDialogService, useValue: confirmSpy },
        { provide: ToastService, useValue: toastSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should load profile on init', () => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));

      fixture.detectChanges();

      expect(profileSpy.getProfile).toHaveBeenCalled();
      expect(component.profileForm.getRawValue()).toEqual(mockProfile);
      expect(component.isLoading).toBeFalse();
    });

    it('should disable form after loading profile', () => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));

      fixture.detectChanges();

      expect(component.profileForm.disabled).toBeTrue();
    });

    it('should show toast error when profile loading fails', () => {
      profileSpy.getProfile.and.returnValue(throwError(() => new Error('Network error')));

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
      expect(toastSpy.error).toHaveBeenCalled();
    });
  });

  describe('toggleEdit', () => {
    beforeEach(() => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));
      fixture.detectChanges();
    });

    it('should enable form when editing', () => {
      component.toggleEdit();

      expect(component.isEditing).toBeTrue();
      expect(component.profileForm.enabled).toBeTrue();
    });

    it('should disable form when not editing', () => {
      component.toggleEdit();
      component.toggleEdit();

      expect(component.isEditing).toBeFalse();
      expect(component.profileForm.disabled).toBeTrue();
    });

    it('should clear lastSavedMessage', () => {
      component.lastSavedMessage = 'Profile saved!';

      component.toggleEdit();

      expect(component.lastSavedMessage).toBe('');
    });
  });

  describe('saveProfile - success', () => {
    beforeEach(() => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));
      fixture.detectChanges();
      component.toggleEdit();
    });

    it('should show confirmation dialog', async () => {
      confirmSpy.confirm.and.resolveTo(true);
      profileSpy.updateProfile.and.returnValue(of(mockProfile));

      await component.saveProfile();

      expect(confirmSpy.confirm).toHaveBeenCalledWith(
        'Confirmar cambios',
        'Vas a actualizar tus datos personales. ¿Deseas continuar?',
        'Si, actualizar'
      );
    });

    it('should NOT save when user cancels', async () => {
      confirmSpy.confirm.and.resolveTo(false);

      await component.saveProfile();

      expect(profileSpy.updateProfile).not.toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
    });

    it('should update profile and show saved message', async () => {
      confirmSpy.confirm.and.resolveTo(true);
      profileSpy.updateProfile.and.returnValue(of(mockProfile));

      await component.saveProfile();

      expect(profileSpy.updateProfile).toHaveBeenCalled();
      expect(component.isEditing).toBeFalse();
      expect(component.profileForm.disabled).toBeTrue();
      expect(component.isSaving).toBeFalse();
      expect(component.lastSavedMessage).toBe('PROFILE.SAVED');
    });
  });

  describe('saveProfile - validation', () => {
    beforeEach(() => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));
      fixture.detectChanges();
      component.toggleEdit();
    });

    it('should NOT save when form is invalid', async () => {
      component.profileForm.controls['fullName'].setValue('');
      component.profileForm.controls['fullName'].setErrors({ required: true });

      await component.saveProfile();

      expect(confirmSpy.confirm).not.toHaveBeenCalled();
      expect(profileSpy.updateProfile).not.toHaveBeenCalled();
    });

    it('should mark form as touched when invalid', async () => {
      component.profileForm.controls['fullName'].setValue('');
      component.profileForm.controls['fullName'].setErrors({ required: true });

      await component.saveProfile();

      expect(component.profileForm.controls['fullName'].touched).toBeTrue();
    });
  });

  describe('saveProfile - error', () => {
    beforeEach(() => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));
      fixture.detectChanges();
      component.toggleEdit();
    });

    it('should show toast error when save fails', async () => {
      confirmSpy.confirm.and.resolveTo(true);
      profileSpy.updateProfile.and.returnValue(throwError(() => new Error('Server error')));

      await component.saveProfile();

      expect(component.isSaving).toBeFalse();
      expect(toastSpy.error).toHaveBeenCalled();
    });
  });

  describe('password modal', () => {
    it('should open password modal', () => {
      component.openPasswordModal();

      expect(component.showPasswordModal).toBeTrue();
      expect(component.showCurrentPassword).toBeFalse();
    });

    it('should close password modal', () => {
      component.showPasswordModal = true;
      component.closePasswordModal();

      expect(component.showPasswordModal).toBeFalse();
    });

    it('should reset password form on open', () => {
      component.passwordForm.patchValue({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' });
      component.openPasswordModal();

      expect(component.passwordForm.get('currentPassword')?.value).toBeNull();
    });
  });

  describe('password strength', () => {
    it('should return 0 for empty password', () => {
      component.passwordForm.patchValue({ newPassword: '' });
      expect(component.passwordStrength).toBe(0);
    });

    it('should return 2 for password with length and lowercase only', () => {
      component.passwordForm.patchValue({ newPassword: 'abcdefgh' });
      expect(component.passwordStrength).toBe(2);
    });

    it('should return 5 for strong password', () => {
      component.passwordForm.patchValue({ newPassword: 'Abc123!@#' });
      expect(component.passwordStrength).toBe(5);
    });
  });

  describe('password requirements', () => {
    it('should return all unmet for empty password', () => {
      component.passwordForm.patchValue({ newPassword: '' });
      const reqs = component.passwordRequirements;
      expect(reqs.every(r => !r.met)).toBeTrue();
    });

    it('should return all met for strong password', () => {
      component.passwordForm.patchValue({ newPassword: 'Abc123!@#' });
      const reqs = component.passwordRequirements;
      expect(reqs.every(r => r.met)).toBeTrue();
    });
  });

  describe('passwords match', () => {
    it('should return true when passwords match', () => {
      component.passwordForm.patchValue({ newPassword: 'Test123!', confirmPassword: 'Test123!' });
      expect(component.passwordsMatch()).toBeTrue();
    });

    it('should return false when passwords do not match', () => {
      component.passwordForm.patchValue({ newPassword: 'Test123!', confirmPassword: 'Different!' });
      expect(component.passwordsMismatch()).toBeTrue();
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      component.openPasswordModal();
    });

    it('should not change password when form is invalid', () => {
      component.changePassword();

      expect(profileSpy.changePassword).not.toHaveBeenCalled();
    });

    it('should show warning when password strength is low', () => {
      component.passwordForm.patchValue({
        currentPassword: 'Old123!',
        newPassword: 'abcdefgh',
        confirmPassword: 'abcdefgh'
      });

      component.changePassword();

      expect(toastSpy.warning).toHaveBeenCalled();
    });

    it('should show warning when passwords do not match', () => {
      component.passwordForm.patchValue({
        currentPassword: 'Old123!',
        newPassword: 'Strong1!@#',
        confirmPassword: 'Different1!@#'
      });

      component.changePassword();

      expect(toastSpy.warning).toHaveBeenCalled();
    });

    it('should call changePassword service when valid', fakeAsync(() => {
      profileSpy.changePassword.and.returnValue(of(undefined));
      component.passwordForm.patchValue({
        currentPassword: 'Old123!',
        newPassword: 'Strong1!@#',
        confirmPassword: 'Strong1!@#'
      });

      component.changePassword();
      tick(2000);

      expect(profileSpy.changePassword).toHaveBeenCalledWith('Old123!', 'Strong1!@#');
      expect(toastSpy.success).toHaveBeenCalled();
    }));

    it('should show error when current password is wrong (401)', () => {
      profileSpy.changePassword.and.returnValue(throwError(() => ({ status: 401 })));
      component.passwordForm.patchValue({
        currentPassword: 'Wrong1!@#',
        newPassword: 'Strong1!@#',
        confirmPassword: 'Strong1!@#'
      });

      component.changePassword();

      expect(toastSpy.error).toHaveBeenCalled();
    });

    it('should show error with validation errors from server', () => {
      profileSpy.changePassword.and.returnValue(throwError(() => ({
        error: { errors: [{ message: 'Password too weak' }] }
      })));
      component.passwordForm.patchValue({
        currentPassword: 'Old123!',
        newPassword: 'Strong1!@#',
        confirmPassword: 'Strong1!@#'
      });

      component.changePassword();

      expect(toastSpy.error).toHaveBeenCalled();
    });

    it('should show generic error for other error statuses', () => {
      profileSpy.changePassword.and.returnValue(throwError(() => ({ status: 500 })));
      component.passwordForm.patchValue({
        currentPassword: 'Old123!',
        newPassword: 'Strong1!@#',
        confirmPassword: 'Strong1!@#'
      });

      component.changePassword();

      expect(toastSpy.error).toHaveBeenCalledWith('Error', 'No se pudo cambiar la contraseña. Intentalo de nuevo.');
    });
  });

  describe('password strength label', () => {
    it('should return empty string for score 0', () => {
      component.passwordForm.patchValue({ newPassword: '' });
      expect(component.passwordStrengthLabel).toBe('');
    });

    it('should return Debil for score 1-2', () => {
      component.passwordForm.patchValue({ newPassword: 'abcdefgh' });
      expect(component.passwordStrengthLabel).toBe('Debil');
    });

    it('should return Media for score 3', () => {
      component.passwordForm.patchValue({ newPassword: 'Abcdefgh' });
      expect(component.passwordStrengthLabel).toBe('Media');
    });

    it('should return Fuerte for score 4', () => {
      component.passwordForm.patchValue({ newPassword: 'Abcd1234' });
      expect(component.passwordStrengthLabel).toBe('Fuerte');
    });

    it('should return Muy fuerte for score 5', () => {
      component.passwordForm.patchValue({ newPassword: 'Abc123!@#' });
      expect(component.passwordStrengthLabel).toBe('Muy fuerte');
    });
  });

  describe('password strength color', () => {
    it('should return red for score 0-2', () => {
      component.passwordForm.patchValue({ newPassword: 'abcdefgh' });
      expect(component.passwordStrengthColor).toBe('bg-red-500');
    });

    it('should return amber for score 3', () => {
      component.passwordForm.patchValue({ newPassword: 'Abcdefgh' });
      expect(component.passwordStrengthColor).toBe('bg-amber-500');
    });

    it('should return green for score 4', () => {
      component.passwordForm.patchValue({ newPassword: 'Abcd1234' });
      expect(component.passwordStrengthColor).toBe('bg-green-500');
    });

    it('should return emerald for score 5', () => {
      component.passwordForm.patchValue({ newPassword: 'Abc123!@#' });
      expect(component.passwordStrengthColor).toBe('bg-emerald-600');
    });
  });

  describe('passwordsMatch edge cases', () => {
    it('should return false when confirm password is empty', () => {
      component.passwordForm.patchValue({ newPassword: 'Test123!', confirmPassword: '' });
      expect(component.passwordsMatch()).toBeFalse();
    });

    it('passwordsMismatch should return false when confirm is empty', () => {
      component.passwordForm.patchValue({ newPassword: 'Test123!', confirmPassword: '' });
      expect(component.passwordsMismatch()).toBeFalse();
    });
  });
});
