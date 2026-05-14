import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProfileService } from '../../../application/services/profile.service';
import { TranslateService } from '@ngx-translate/core';

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
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.profileForm.patchValue(this.profileService.getProfile());
    this.profileForm.disable();
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

  saveProfile(): void {
    this.isEditing = false;
    this.profileForm.disable();
    this.lastSavedMessage = this.translate.instant('PROFILE.SAVED');
  }
}
