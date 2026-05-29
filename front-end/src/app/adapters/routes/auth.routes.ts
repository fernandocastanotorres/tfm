import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { EmailVerificationComponent } from '../components/email-verification/email-verification.component';
import { PasswordRecoveryComponent } from '../components/password-recovery/password-recovery.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent, title: 'LOGIN.TITLE' },
  { path: 'registro', component: RegisterComponent, title: 'REGISTER.TITLE' },
  { path: 'verificar-email', component: EmailVerificationComponent, title: 'EMAIL_VERIFICATION.TITLE' },
  { path: 'recuperacion', component: PasswordRecoveryComponent, title: 'PASSWORD_RECOVERY.TITLE' }
];
