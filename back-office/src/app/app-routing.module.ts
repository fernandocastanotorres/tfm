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
import { PublicContentManagementComponent } from './adapters/components/public-content-management/public-content-management.component';

import { authGuard, tramitadorGuard, adminGuard } from './application/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: BackofficeLayoutComponent,
    canActivate: [tramitadorGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Panel Principal' },
      { path: 'cases', component: CaseListComponent, title: 'Expedientes' },
      { path: 'tasks', component: TasksComponent, title: 'Tareas Pendientes' },
      { path: 'cases/:id', component: CaseDetailComponent, title: 'Detalle del Expediente' },
      { path: 'cases/:id/task/:taskId', component: TaskResolutionComponent, title: 'Resolver Tarea' },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: 'users', component: UserManagementComponent, title: 'Gestion de Usuarios' },
          { path: 'procedures', component: ProcedureManagementComponent, title: 'Gestion de Procedimientos' },
          { path: 'public-content', component: PublicContentManagementComponent, title: 'Contenido Publico' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
