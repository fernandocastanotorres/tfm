import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../../application/services/profile.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [ProfileService]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load profile data', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
    req.flush({ fullName: 'María López', email: 'maria@example.com', phone: '600123456', nationalId: '12345678A', address: 'Calle Mayor 1' });
    tick();

    expect(component.profileForm.value.fullName).toBe('María López');
  }));

  it('should enable form when editing', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
    req.flush({ fullName: 'María López', email: 'maria@example.com', phone: '600123456', nationalId: '12345678A', address: 'Calle Mayor 1' });
    tick();

    component.toggleEdit();
    expect(component.profileForm.enabled).toBeTrue();
  }));
});
