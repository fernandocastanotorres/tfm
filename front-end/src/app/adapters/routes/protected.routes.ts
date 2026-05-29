import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { DocumentsComponent } from '../components/documents/documents.component';
import { CaseDetailComponent } from '../components/case-detail/case-detail.component';
import { CaseSearchComponent } from '../components/case-search/case-search.component';
import { PaymentsComponent } from '../components/payments/payments.component';
import { MessagesComponent } from '../components/messages/messages.component';
import { CaseWizardComponent } from '../components/case-wizard/case-wizard.component';
import { CitizenFolderComponent } from '../components/citizen-folder/citizen-folder.component';
import { authGuard } from '../../application/guards/auth.guard';
import { pendingChangesGuard } from '../../application/guards/pending-changes.guard';

export const PROTECTED_ROUTES: Routes = [
  { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent, title: 'DASHBOARD.TITLE' },
  { path: 'perfil', canActivate: [authGuard], component: ProfileComponent, title: 'PROFILE.TITLE' },
  { path: 'notificaciones', canActivate: [authGuard], component: NotificationsComponent, title: 'NOTIFICATIONS.TITLE' },
  { path: 'documentos', canActivate: [authGuard], component: DocumentsComponent, title: 'DOCUMENTS.TITLE' },
  { path: 'expedientes/buscar', canActivate: [authGuard], component: CaseSearchComponent, title: 'CASE_SEARCH.TITLE' },
  { path: 'expedientes/:id/detalle', canActivate: [authGuard], component: CaseDetailComponent, title: 'CASE_DETAIL.TITLE' },
  { path: 'expedientes/detalle', canActivate: [authGuard], component: CaseDetailComponent, title: 'CASE_DETAIL.TITLE' },
  { path: 'mensajes', canActivate: [authGuard], component: MessagesComponent, title: 'MESSAGES.TITLE' },
  { path: 'carpeta', canActivate: [authGuard], component: CitizenFolderComponent, title: 'Carpeta ciudadana' },
  { path: 'pagos', canActivate: [authGuard], component: PaymentsComponent, title: 'PAYMENTS.TITLE' },
  { path: 'expedientes/nuevo', canActivate: [authGuard], canDeactivate: [pendingChangesGuard], component: CaseWizardComponent, title: 'CASE_WIZARD.TITLE' },
  { path: 'expedientes/nuevo/:procedureId', canActivate: [authGuard], canDeactivate: [pendingChangesGuard], component: CaseWizardComponent, title: 'CASE_WIZARD.TITLE' },
];
