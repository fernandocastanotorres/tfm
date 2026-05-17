import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProfileService } from '../../../application/services/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit {
  readonly profileForm = this.fb.group({
    fullName: [''],
    email: [''],
    phone: [''],
    nationalId: [''],
    address: ['']
  });

  isEditing = false;
  lastSavedMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly translate: TranslateService,
    private readonly confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.profileForm.disable();
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
      'Confirmar cambios',
      'Vas a actualizar tus datos personales. ¿Deseas continuar?',
      'Si, actualizar'
    );
    if (!confirmed) {
      return;
    }

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
        this.lastSavedMessage = this.translate.instant('PROFILE.SAVED');
      }
    });
  }
}
