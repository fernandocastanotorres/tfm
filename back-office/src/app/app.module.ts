import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgChartsModule } from 'ng2-charts';

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
import { PublicContentManagementComponent } from './adapters/components/public-content-management/public-content-management.component';
import { TransparencyManagementComponent } from './adapters/components/transparency-management/transparency-management.component';
import { StatisticsDashboardComponent } from './adapters/components/statistics-dashboard/statistics-dashboard.component';
import { ContactInboxComponent } from './adapters/components/contact-inbox/contact-inbox.component';
import { FieldI18nManagementComponent } from './adapters/components/field-i18n-management/field-i18n-management.component';

import { AuthService } from './application/services/auth.service';
import { AdminCasesService } from './application/services/admin-cases.service';
import { UserManagementService } from './application/services/user-management.service';
import { ProcedureManagementService } from './application/services/procedure-management.service';

import { HttpErrorInterceptor } from './application/interceptors/http-error.interceptor';
import { JwtAuthInterceptor } from './application/interceptors/jwt-auth.interceptor';
import { CorrelationIdInterceptor } from './application/interceptors/correlation-id.interceptor';
import { AcceptLanguageInterceptor } from './application/interceptors/accept-language.interceptor';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        BackofficeLayoutComponent,
        DashboardComponent,
        CaseListComponent,
        CaseDetailComponent,
        TasksComponent,
        TaskResolutionComponent,
        UserManagementComponent,
        ProcedureManagementComponent,
        PublicContentManagementComponent,
        TransparencyManagementComponent,
        StatisticsDashboardComponent,
        ContactInboxComponent,
        FieldI18nManagementComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        RouterModule,
        NgChartsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            defaultLanguage: 'es-ES'
        })], providers: [
        { provide: AuthService, useClass: AuthService },
        { provide: AdminCasesService, useClass: AdminCasesService },
        { provide: UserManagementService, useClass: UserManagementService },
        { provide: ProcedureManagementService, useClass: ProcedureManagementService },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
