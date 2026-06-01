import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../../application/services/profile.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { ToastService } from '../../../application/services/toast.service';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { SkeletonScreenComponent } from '../../../shared/components/skeleton-screen/skeleton-screen.component';
import { CdkTrapFocus } from '@angular/cdk/a11y';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    imports: [RouterLink, NgIf, SkeletonScreenComponent, FormsModule, ReactiveFormsModule, CdkTrapFocus, NgFor, TranslatePipe]
})
export class ProfileComponent implements OnInit {
  readonly profileForm = this.fb.group({
    fullName: [''],
    email: [''],
    phone: [''],
    nationalId: [''],
    address: ['']
  });

  passwordForm: FormGroup;
  isEditing = false;
  isLoading = true;
  isSaving = false;
  lastSavedMessage = '';

  showPasswordModal = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;
  private lastFocusedElement: HTMLElement | null = null;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly translate: TranslateService,
    private readonly confirmDialogService: ConfirmDialogService,
    private readonly toast: ToastService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.profileForm.disable();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error(this.translate.instant('COMMON.ERROR'), this.translate.instant('COMMON.ERROR_LOAD_PROFILE'));
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.lastSavedMessage = '';
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      this.translate.instant('PROFILE.CONFIRM_CHANGES_TITLE'),
      this.translate.instant('PROFILE.CONFIRM_CHANGES_TEXT'),
      this.translate.instant('PROFILE.CONFIRM_UPDATE_BUTTON')
    );
    if (!confirmed) {
      return;
    }

    this.isSaving = true;

    const { fullName, phone, nationalId, address } = this.profileForm.getRawValue();
    this.profileService.updateProfile({
      fullName: fullName ?? '',
      phone: phone ?? '',
      nationalId: nationalId ?? '',
      address: address ?? ''
    }).subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.isEditing = false;
        this.profileForm.disable();
        this.isSaving = false;
        this.lastSavedMessage = this.translate.instant('PROFILE.SAVED');
      },
      error: () => {
        this.isSaving = false;
        this.toast.error(this.translate.instant('COMMON.ERROR'), this.translate.instant('COMMON.ERROR_SAVE_PROFILE'));
      }
    });
  }

  openPasswordModal(): void {
    this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.showPasswordModal = true;
    this.passwordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.restoreFocus();
  }

  private restoreFocus(): void {
    if (!this.lastFocusedElement) {
      return;
    }
    const target = this.lastFocusedElement;
    this.lastFocusedElement = null;
    setTimeout(() => target.focus(), 0);
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.showPasswordModal) {
      this.closePasswordModal();
    }
  }

  get passwordStrength(): number {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
    return score;
  }

  get passwordStrengthLabel(): string {
    const s = this.passwordStrength;
    if (s === 0) return '';
    if (s <= 2) return this.translate.instant('PROFILE.PASSWORD_STRENGTH_WEAK');
    if (s <= 3) return this.translate.instant('PROFILE.PASSWORD_STRENGTH_MEDIUM');
    if (s <= 4) return this.translate.instant('PROFILE.PASSWORD_STRENGTH_STRONG');
    return this.translate.instant('PROFILE.PASSWORD_STRENGTH_VERY_STRONG');
  }

  get passwordStrengthColor(): string {
    const s = this.passwordStrength;
    if (s <= 2) return 'bg-red-500';
    if (s <= 3) return 'bg-amber-500';
    if (s <= 4) return 'bg-green-500';
    return 'bg-emerald-600';
  }

  get passwordRequirements(): { label: string; met: boolean }[] {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
    return [
      { label: this.translate.instant('PROFILE.PASSWORD_REQUIREMENT_LENGTH'), met: pwd.length >= 8 },
      { label: this.translate.instant('PROFILE.PASSWORD_REQUIREMENT_LOWER'), met: /[a-z]/.test(pwd) },
      { label: this.translate.instant('PROFILE.PASSWORD_REQUIREMENT_UPPER'), met: /[A-Z]/.test(pwd) },
      { label: this.translate.instant('PROFILE.PASSWORD_REQUIREMENT_NUMBER'), met: /\d/.test(pwd) },
      { label: this.translate.instant('PROFILE.PASSWORD_REQUIREMENT_SPECIAL'), met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd) }
    ];
  }

  passwordsMatch(): boolean {
    const newPwd = this.passwordForm.get('newPassword')?.value || '';
    const confirmPwd = this.passwordForm.get('confirmPassword')?.value || '';
    return confirmPwd.length > 0 && newPwd === confirmPwd;
  }

  passwordsMismatch(): boolean {
    const newPwd = this.passwordForm.get('newPassword')?.value || '';
    const confirmPwd = this.passwordForm.get('confirmPassword')?.value || '';
    return confirmPwd.length > 0 && newPwd !== confirmPwd;
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordStrength < 5) {
      this.toast.warning(this.translate.instant('PROFILE.WEAK_PASSWORD'), this.translate.instant('PROFILE.WEAK_PASSWORD_HINT'));
      return;
    }

    if (!this.passwordsMatch()) {
      this.toast.warning(this.translate.instant('PROFILE.PASSWORDS_MISMATCH'), this.translate.instant('PROFILE.PASSWORDS_MISMATCH_HINT'));
      return;
    }

    this.isChangingPassword = true;

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.profileService.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.toast.success(this.translate.instant('PROFILE.SUCCESS_PASSWORD_TITLE'), this.translate.instant('PROFILE.SUCCESS_PASSWORD_TEXT'));
        setTimeout(() => {
          this.closePasswordModal();
        }, 1500);
      },
      error: (err) => {
        this.isChangingPassword = false;
        if (err.status === 401) {
          this.toast.error(this.translate.instant('COMMON.ERROR'), this.translate.instant('COMMON.ERROR_PASSWORD_WRONG'));
        } else if (err.error?.errors) {
          this.toast.error(this.translate.instant('COMMON.ERROR'), err.error.errors.map((e: any) => e.message).join(', '));
        } else {
          this.toast.error(this.translate.instant('COMMON.ERROR'), this.translate.instant('COMMON.ERROR_PASSWORD'));
        }
      }
    });
  }
}
