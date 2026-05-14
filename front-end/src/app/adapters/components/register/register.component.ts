import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  readonly registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    nationalId: ['', [Validators.required, Validators.pattern('^[0-9]{8}[A-Za-z]$|^[XYZ][0-9]{7}[A-Za-z]$')]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$')]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, { validators: [RegisterComponent.passwordsMatch] });

  isSubmitting = false;
  successMessageKey = '';

  constructor(private readonly fb: FormBuilder, private readonly router: Router) {}

  onSubmit(): void {
    this.successMessageKey = '';
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessageKey = 'REGISTER.SUCCESS';
      this.router.navigate(['/login']);
    }, 600);
  }

  static passwordsMatch(group: { get: (key: string) => any }): null | { mismatch: true } {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { mismatch: true } : null;
  }
}
