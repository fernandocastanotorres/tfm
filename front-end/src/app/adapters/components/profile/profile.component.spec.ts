import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../../application/services/profile.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [ProfileService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load profile data', () => {
    expect(component.profileForm.value.fullName).toBe('María López');
  });

  it('should enable form when editing', () => {
    component.toggleEdit();
    expect(component.profileForm.enabled).toBeTrue();
  });
});
