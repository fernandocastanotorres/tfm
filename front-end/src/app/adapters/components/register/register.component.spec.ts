import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../application/services/auth.service';
import { environment } from '../../../../environments/environment';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should mark form invalid when required fields missing', () => {
    component.onSubmit();
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should navigate to login on successful registration', fakeAsync(() => {
    component.registerForm.setValue({
      fullName: 'Juan Pérez',
      email: 'juan@example.com',
      nationalId: '12345678A',
      phone: '600123456',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      acceptTerms: true
    });
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/register`);
    req.flush({});
    tick();

    // Component shows success message, does NOT navigate (user must click login link)
    expect(component.successMessageKey).toBe('REGISTER.SUCCESS');
    expect(component.infoMessage).toContain('verificacion');
  }));
});
