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
import { InstitutionalInfoComponent } from './adapters/components/institutional-info/institutional-info.component';
import { LegislationComponent } from './adapters/components/legislation/legislation.component';
import { FaqComponent } from './adapters/components/faq/faq.component';
import { ContactComponent } from './adapters/components/contact/contact.component';
import { ServiceStatusComponent } from './adapters/components/service-status/service-status.component';
import { OrganismsDirectoryComponent } from './adapters/components/organisms-directory/organisms-directory.component';
import { TransparencyComponent } from './adapters/components/transparency/transparency.component';
import { CalendarComponent } from './adapters/components/calendar/calendar.component';
import { GlossaryComponent } from './adapters/components/glossary/glossary.component';
import { AccessibilityStatementComponent } from './adapters/components/accessibility-statement/accessibility-statement.component';
import { SitemapComponent } from './adapters/components/sitemap/sitemap.component';
import { ContactInboxComponent } from './adapters/components/contact-inbox/contact-inbox.component';
import { DocumentVerificationComponent } from './adapters/components/document-verification/document-verification.component';
import { authGuard } from './application/guards/auth.guard';

const routes: Routes = [
  // Public routes with shared header/footer (no auth required)
  {
    path: 'sede',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: PublicHomeComponent, title: 'Sede Electronica' },
      { path: 'institucional', component: InstitutionalInfoComponent, title: 'Informacion Institucional' },
      { path: 'normativa', component: LegislationComponent, title: 'Normativa y Legislacion' },
      { path: 'faq', component: FaqComponent, title: 'Preguntas Frecuentes' },
      { path: 'contacto', component: ContactComponent, title: 'Contacto y Atencion al Ciudadano' },
      { path: 'estado', component: ServiceStatusComponent, title: 'Estado del Servicio' },
      { path: 'organismo', component: OrganismsDirectoryComponent, title: 'Directorio de Organismos' },
      { path: 'transparencia', component: TransparencyComponent, title: 'Transparencia y Estadisticas' },
      { path: 'calendario', component: CalendarComponent, title: 'Calendario de Plazos' },
      { path: 'glosario', component: GlossaryComponent, title: 'Glosario de Terminos' },
      { path: 'accesibilidad', component: AccessibilityStatementComponent, title: 'Declaracion de Accesibilidad' },
      { path: 'mapa', component: SitemapComponent, title: 'Mapa Web' },
      { path: 'validar-documento', component: DocumentVerificationComponent, title: 'Validar documento' },
      { path: 'procedimientos', component: ProceduresComponent, title: 'Procedimientos' },
      { path: 'procedimientos/:procedureId/flujo', component: ProcedureFlowComponent, title: 'Flujo del Procedimiento' },
      { path: 'citas', component: AppointmentsComponent, title: 'Citas' },
      { path: 'expedientes/nuevo', canActivate: [authGuard], component: CaseWizardComponent, title: 'Nuevo expediente' },
      { path: 'expedientes/nuevo/:procedureId', canActivate: [authGuard], component: CaseWizardComponent, title: 'Nuevo expediente' },
      { path: 'expedientes/buscar', canActivate: [authGuard], component: CaseSearchComponent, title: 'Buscar expedientes' },
      { path: 'expedientes/:id/detalle', canActivate: [authGuard], component: CaseDetailComponent, title: 'Detalle del Expediente' },
      { path: 'expedientes/detalle', canActivate: [authGuard], component: CaseDetailComponent, title: 'Detalle del Expediente' },
      { path: 'mensajes', canActivate: [authGuard], component: MessagesComponent, title: 'Mensajeria segura' },
      { path: 'perfil', canActivate: [authGuard], component: ProfileComponent, title: 'Datos personales' },
      { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent, title: 'Panel principal' },
      { path: 'notificaciones', canActivate: [authGuard], component: NotificationsComponent, title: 'Notificaciones' },
      { path: 'documentos', canActivate: [authGuard], component: DocumentsComponent, title: 'Documentos' },
      { path: 'pagos', canActivate: [authGuard], component: PaymentsComponent, title: 'Pagos y tasas' },
      // Auth pages inside public layout so they share header/footer
      { path: 'login', component: LoginComponent, title: 'Iniciar sesion' },
      { path: 'registro', component: RegisterComponent, title: 'Crear cuenta' },
      { path: 'verificar-email', component: EmailVerificationComponent, title: 'Verificacion de cuenta' },
      { path: 'recuperacion', component: PasswordRecoveryComponent, title: 'Recuperar contrasena' }
    ]
  },
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
    redirectTo: 'sede'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
