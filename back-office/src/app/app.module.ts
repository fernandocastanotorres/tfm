import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LoginComponent } from './adapters/components/login/login.component';
import { BackofficeLayoutComponent } from './adapters/components/backoffice-layout/backoffice-layout.component';
import { DashboardComponent } from './adapters/components/dashboard/dashboard.component';
import { CaseListComponent } from './adapters/components/case-list/case-list.component';
import { CaseDetailComponent } from './adapters/components/case-detail/case-detail.component';
import { TasksComponent } from './adapters/components/tasks/tasks.component';
import { TaskResolutionComponent } from './adapters/components/task-resolution/task-resolution.component';
import { UserManagementComponent } from './adapters/components/user-management/user-management.component';
import { ProcedureManagementComponent } from './adapters/components/procedure-management/procedure-management.component';

import { AuthService } from './application/services/auth.service';
import { MockAuthService } from './application/services/mock-auth.service';
import { AdminCasesService } from './application/services/admin-cases.service';
import { MockAdminCasesService } from './application/services/mock-admin-cases.service';
import { UserManagementService } from './application/services/user-management.service';
import { MockUserManagementService } from './application/services/mock-user-management.service';
import { ProcedureManagementService } from './application/services/procedure-management.service';
import { MockProcedureManagementService } from './application/services/mock-procedure-management.service';

import { HttpErrorInterceptor } from './application/interceptors/http-error.interceptor';
import { JwtAuthInterceptor } from './application/interceptors/jwt-auth.interceptor';
import { CorrelationIdInterceptor } from './application/interceptors/correlation-id.interceptor';
import { AcceptLanguageInterceptor } from './application/interceptors/accept-language.interceptor';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BackofficeLayoutComponent,
    DashboardComponent,
    CaseListComponent,
    CaseDetailComponent,
    TasksComponent,
    TaskResolutionComponent,
    UserManagementComponent,
    ProcedureManagementComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'es-ES'
    })
  ],
  providers: [
    { provide: AuthService, useClass: environment.useMocks ? MockAuthService : AuthService },
    { provide: AdminCasesService, useClass: environment.useMocks ? MockAdminCasesService : AdminCasesService },
    { provide: UserManagementService, useClass: environment.useMocks ? MockUserManagementService : UserManagementService },
    { provide: ProcedureManagementService, useClass: environment.useMocks ? MockProcedureManagementService : ProcedureManagementService },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
