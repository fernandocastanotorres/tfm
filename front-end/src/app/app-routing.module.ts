import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './adapters/components/login/login.component';
import { RegisterComponent } from './adapters/components/register/register.component';
import { PasswordRecoveryComponent } from './adapters/components/password-recovery/password-recovery.component';
import { DashboardComponent } from './adapters/components/dashboard/dashboard.component';
import { ProfileComponent } from './adapters/components/profile/profile.component';
import { NotificationsComponent } from './adapters/components/notifications/notifications.component';
import { DocumentsComponent } from './adapters/components/documents/documents.component';
import { CaseDetailComponent } from './adapters/components/case-detail/case-detail.component';
import { PaymentsComponent } from './adapters/components/payments/payments.component';
import { AppointmentsComponent } from './adapters/components/appointments/appointments.component';
import { MessagesComponent } from './adapters/components/messages/messages.component';
import { ProceduresComponent } from './adapters/components/procedures/procedures.component';
import { CaseWizardComponent } from './adapters/components/case-wizard/case-wizard.component';
import { ProcedureFlowComponent } from './adapters/components/procedure-flow/procedure-flow.component';
import { authGuard } from './application/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar sesión'
  },
  {
    path: 'registro',
    component: RegisterComponent,
    title: 'Crear cuenta'
  },
  {
    path: 'recuperacion',
    component: PasswordRecoveryComponent,
    title: 'Recuperar contraseña'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent,
    title: 'Panel principal'
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    component: ProfileComponent,
    title: 'Mi perfil'
  },
  {
    path: 'notificaciones',
    canActivate: [authGuard],
    component: NotificationsComponent,
    title: 'Notificaciones'
  },
  {
    path: 'documentos',
    canActivate: [authGuard],
    component: DocumentsComponent,
    title: 'Documentos'
  },
  {
    path: 'expedientes/detalle',
    canActivate: [authGuard],
    component: CaseDetailComponent,
    title: 'Detalle del expediente'
  },
  {
    path: 'pagos',
    canActivate: [authGuard],
    component: PaymentsComponent,
    title: 'Pagos y tasas'
  },
  {
    path: 'citas',
    canActivate: [authGuard],
    component: AppointmentsComponent,
    title: 'Citas'
  },
  {
    path: 'mensajes',
    canActivate: [authGuard],
    component: MessagesComponent,
    title: 'Mensajería segura'
  },
  {
    path: 'procedimientos',
    canActivate: [authGuard],
    component: ProceduresComponent,
    title: 'Procedimientos'
  },
  {
    path: 'procedimientos/:procedureId/flujo',
    canActivate: [authGuard],
    component: ProcedureFlowComponent,
    title: 'Flujo del procedimiento'
  },
  {
    path: 'expedientes/nuevo',
    canActivate: [authGuard],
    component: CaseWizardComponent,
    title: 'Nuevo expediente'
  },
  {
    path: 'expedientes/nuevo/:procedureId',
    canActivate: [authGuard],
    component: CaseWizardComponent,
    title: 'Nuevo expediente'
  },
  {
    path: '',
    canActivate: [authGuard],
    component: DashboardComponent,
    title: 'Inicio seguro'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
