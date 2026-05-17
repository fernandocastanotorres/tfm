import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessageKey = '';
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get returnUrl(): string {
    const candidate = this.route.snapshot.queryParamMap.get('returnUrl');
    return candidate && candidate.startsWith('/') ? candidate : '/';
  }

  onSubmit(): void {
    this.errorMessageKey = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error?.status === 401) {
          this.errorMessageKey = 'LOGIN.ERROR_INVALID';
        } else if (error?.error?.message) {
          this.errorMessageKey = error.error.message;
        } else {
          this.errorMessageKey = 'LOGIN.ERROR_GENERIC';
        }
      }
    });
  }
}
