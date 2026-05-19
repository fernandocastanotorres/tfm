import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../../application/services/profile.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

// Fake loader that returns the key as the translation
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
  let translateService: TranslateService;

  const mockProfile = {
    fullName: 'John Doe',
    email: 'john@test.com',
    phone: '123456789',
    nationalId: '12345678A',
    address: '123 Main St'
  };

  beforeEach(() => {
    profileSpy = jasmine.createSpyObj('ProfileService', ['getProfile', 'updateProfile']);
    confirmSpy = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

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
        { provide: ConfirmDialogService, useValue: confirmSpy }
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
      expect(component.errorMessage).toBe('');
    });

    it('should disable form after loading profile', () => {
      profileSpy.getProfile.and.returnValue(of(mockProfile));

      fixture.detectChanges();

      expect(component.profileForm.disabled).toBeTrue();
    });

    it('should show error when profile loading fails', () => {
      profileSpy.getProfile.and.returnValue(throwError(() => new Error('Network error')));

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('No se pudieron cargar los datos del perfil.');
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

    it('should clear errorMessage', () => {
      component.errorMessage = 'Some error';

      component.toggleEdit();

      expect(component.errorMessage).toBe('');
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
      expect(component.errorMessage).toBe('');
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

    it('should show error when save fails', async () => {
      confirmSpy.confirm.and.resolveTo(true);
      profileSpy.updateProfile.and.returnValue(throwError(() => new Error('Server error')));

      await component.saveProfile();

      expect(component.isSaving).toBeFalse();
      expect(component.errorMessage).toBe('No se pudieron guardar los cambios del perfil.');
    });
  });
});
