import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './adapters/components/login/login.component';
import { BackofficeLayoutComponent } from './adapters/components/backoffice-layout/backoffice-layout.component';
import { DashboardComponent } from './adapters/components/dashboard/dashboard.component';
import { CaseListComponent } from './adapters/components/case-list/case-list.component';
import { CaseDetailComponent } from './adapters/components/case-detail/case-detail.component';
import { TasksComponent } from './adapters/components/tasks/tasks.component';
import { TaskResolutionComponent } from './adapters/components/task-resolution/task-resolution.component';
import { UserManagementComponent } from './adapters/components/user-management/user-management.component';
import { ProcedureManagementComponent } from './adapters/components/procedure-management/procedure-management.component';
import { ContactInboxComponent } from './adapters/components/contact-inbox/contact-inbox.component';
import { ElectronicNotificationsComponent } from './adapters/components/electronic-notifications/electronic-notifications.component';
import { ErrorPageComponent } from './adapters/components/error-page/error-page.component';

import { authGuard, tramitadorGuard, adminGuard } from './application/guards/auth.guard';
import { pendingChangesGuard } from './application/guards/pending-changes.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'BO.LOGIN.TITLE' },
  { path: 'error/403', component: ErrorPageComponent, data: { variant: '403' }, title: 'BO.COMMON.ERROR_ACCESS_DENIED' },
  { path: 'error/404', component: ErrorPageComponent, data: { variant: '404' }, title: 'Pagina no encontrada' },
  { path: 'error/500', component: ErrorPageComponent, data: { variant: '500' }, title: 'BO.COMMON.ERROR_INTERNAL' },
  {
    path: '',
    component: BackofficeLayoutComponent,
    canActivate: [tramitadorGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'BO.NAV.DASHBOARD' },
      { path: 'statistics', loadComponent: () => import('./adapters/components/statistics-dashboard/statistics-dashboard.component').then(m => m.StatisticsDashboardComponent), title: 'BO.NAV.STATISTICS' },
      { path: 'cases', component: CaseListComponent, title: 'BO.NAV.CASES' },
      { path: 'tasks', component: TasksComponent, title: 'BO.NAV.TASKS' },
      { path: 'contact-inbox', component: ContactInboxComponent, title: 'BO.NAV.CONTACT_INBOX' },
      { path: 'cases/:id', component: CaseDetailComponent, title: 'BO.CASES.VIEW_DETAIL' },
      { path: 'cases/:id/task/:taskId', component: TaskResolutionComponent, title: 'BO.TASKS.RESOLVE' },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: 'users', component: UserManagementComponent, canDeactivate: [pendingChangesGuard], title: 'BO.NAV.USERS' },
          { path: 'procedures', component: ProcedureManagementComponent, canDeactivate: [pendingChangesGuard], title: 'BO.NAV.PROCEDURES' },
          { path: 'notifications', component: ElectronicNotificationsComponent, title: 'Notificaciones electronicas' },
          { path: 'public-content', loadComponent: () => import('./adapters/components/public-content-management/public-content-management.component').then(m => m.PublicContentManagementComponent), title: 'BO.NAV.PUBLIC_CONTENT' },
          { path: 'transparency', loadComponent: () => import('./adapters/components/transparency-management/transparency-management.component').then(m => m.TransparencyManagementComponent), title: 'BO.NAV.TRANSPARENCY' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'error/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
