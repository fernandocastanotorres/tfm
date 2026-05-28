import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './adapters/components/login/login.component';
import { RegisterComponent } from './adapters/components/register/register.component';
import { EmailVerificationComponent } from './adapters/components/email-verification/email-verification.component';
import { PasswordRecoveryComponent } from './adapters/components/password-recovery/password-recovery.component';
import { DashboardComponent } from './adapters/components/dashboard/dashboard.component';
import { ProfileComponent } from './adapters/components/profile/profile.component';
import { NotificationsComponent } from './adapters/components/notifications/notifications.component';
import { DocumentsComponent } from './adapters/components/documents/documents.component';
import { CaseDetailComponent } from './adapters/components/case-detail/case-detail.component';
import { CaseSearchComponent } from './adapters/components/case-search/case-search.component';
import { PaymentsComponent } from './adapters/components/payments/payments.component';
import { AppointmentsComponent } from './adapters/components/appointments/appointments.component';
import { MessagesComponent } from './adapters/components/messages/messages.component';
import { ProceduresComponent } from './adapters/components/procedures/procedures.component';
import { CaseWizardComponent } from './adapters/components/case-wizard/case-wizard.component';
import { ProcedureFlowComponent } from './adapters/components/procedure-flow/procedure-flow.component';
import { PublicLayoutComponent } from './adapters/components/public-layout/public-layout.component';
import { PublicHomeComponent } from './adapters/components/public-home/public-home.component';
import { ErrorPageComponent } from './adapters/components/error-page/error-page.component';
import { authGuard } from './application/guards/auth.guard';
import { pendingChangesGuard } from './application/guards/pending-changes.guard';

const routes: Routes = [
  // Public routes with shared header/footer (no auth required)
  {
    path: 'sede',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: PublicHomeComponent, title: 'PUBLIC.NAV_HOME' },
      { path: '', loadChildren: () => import('./adapters/modules/public-info.module').then(m => m.PublicInfoModule) },
      { path: 'procedimientos', component: ProceduresComponent, title: 'PROCEDURES.TITLE' },
      { path: 'procedimientos/:procedureId/flujo', component: ProcedureFlowComponent, title: 'PROCEDURE_FLOW.TITLE' },
      { path: 'citas', component: AppointmentsComponent, title: 'APPOINTMENTS.TITLE' },
      { path: 'expedientes/nuevo', canActivate: [authGuard], canDeactivate: [pendingChangesGuard], component: CaseWizardComponent, title: 'CASE_WIZARD.TITLE' },
      { path: 'expedientes/nuevo/:procedureId', canActivate: [authGuard], canDeactivate: [pendingChangesGuard], component: CaseWizardComponent, title: 'CASE_WIZARD.TITLE' },
      { path: 'expedientes/buscar', canActivate: [authGuard], component: CaseSearchComponent, title: 'CASE_SEARCH.TITLE' },
      { path: 'expedientes/:id/detalle', canActivate: [authGuard], component: CaseDetailComponent, title: 'CASE_DETAIL.TITLE' },
      { path: 'expedientes/detalle', canActivate: [authGuard], component: CaseDetailComponent, title: 'CASE_DETAIL.TITLE' },
      { path: 'mensajes', canActivate: [authGuard], component: MessagesComponent, title: 'MESSAGES.TITLE' },
      { path: 'perfil', canActivate: [authGuard], component: ProfileComponent, title: 'PROFILE.TITLE' },
      { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent, title: 'DASHBOARD.TITLE' },
      { path: 'notificaciones', canActivate: [authGuard], component: NotificationsComponent, title: 'NOTIFICATIONS.TITLE' },
      { path: 'documentos', canActivate: [authGuard], component: DocumentsComponent, title: 'DOCUMENTS.TITLE' },
      { path: 'pagos', canActivate: [authGuard], component: PaymentsComponent, title: 'PAYMENTS.TITLE' },
      // Auth pages inside public layout so they share header/footer
      { path: 'login', component: LoginComponent, title: 'LOGIN.TITLE' },
      { path: 'registro', component: RegisterComponent, title: 'REGISTER.TITLE' },
      { path: 'verificar-email', component: EmailVerificationComponent, title: 'EMAIL_VERIFICATION.TITLE' },
      { path: 'recuperacion', component: PasswordRecoveryComponent, title: 'PASSWORD_RECOVERY.TITLE' }
    ]
  },
  { path: 'sede/error/403', component: ErrorPageComponent, data: { variant: '403' }, title: 'PUBLIC.ERROR_403_TITLE' },
  { path: 'sede/error/404', component: ErrorPageComponent, data: { variant: '404' }, title: 'PUBLIC.ERROR_404_TITLE' },
  { path: 'sede/error/500', component: ErrorPageComponent, data: { variant: '500' }, title: 'PUBLIC.ERROR_500_TITLE' },
  // Legacy redirects for auth routes
  { path: 'login', redirectTo: 'sede/login', pathMatch: 'full' },
  { path: 'registro', redirectTo: 'sede/registro', pathMatch: 'full' },
  { path: 'recuperacion', redirectTo: 'sede/recuperacion', pathMatch: 'full' },
  { path: 'expedientes/nuevo', redirectTo: 'sede/expedientes/nuevo', pathMatch: 'full' },
  { path: 'expedientes/nuevo/:procedureId', redirectTo: 'sede/expedientes/nuevo/:procedureId' },
  { path: 'expedientes/:id/detalle', redirectTo: 'sede/expedientes/:id/detalle' },
  { path: 'expedientes/detalle', redirectTo: 'sede/expedientes/detalle', pathMatch: 'full' },
  { path: 'mensajes', redirectTo: 'sede/mensajes', pathMatch: 'full' },
   { path: 'perfil', redirectTo: 'sede/perfil', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'sede/dashboard', pathMatch: 'full' },
  { path: 'notificaciones', redirectTo: 'sede/notificaciones', pathMatch: 'full' },
  { path: 'documentos', redirectTo: 'sede/documentos', pathMatch: 'full' },
  { path: 'pagos', redirectTo: 'sede/pagos', pathMatch: 'full' },
  {
    path: '',
    redirectTo: 'sede',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'sede/error/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
