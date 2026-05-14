import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should mark form invalid when required fields missing', () => {
    component.onSubmit();
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should navigate to login on successful registration', (done) => {
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
    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    }, 650);
  });
});
