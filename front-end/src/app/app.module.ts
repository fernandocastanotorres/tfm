import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { A11yModule } from '@angular/cdk/a11y';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, TitleStrategy } from '@angular/router';
import { TranslateModule, TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Auth components
import { LoginComponent } from './adapters/components/login/login.component';
import { RegisterComponent } from './adapters/components/register/register.component';
import { EmailVerificationComponent } from './adapters/components/email-verification/email-verification.component';
import { PasswordRecoveryComponent } from './adapters/components/password-recovery/password-recovery.component';

// Authenticated components
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

// Public sede components
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
import { ContactInboxComponent, InboxItemDirective } from './adapters/components/contact-inbox/contact-inbox.component';
import { DocumentVerificationComponent } from './adapters/components/document-verification/document-verification.component';
import { ErrorPageComponent } from './adapters/components/error-page/error-page.component';
import { LoadingSkeletonComponent } from './adapters/components/loading-skeleton/loading-skeleton.component';
import { NotificationCardDirective } from './adapters/components/notifications/notifications.component';
import { PaymentCardDirective } from './adapters/components/payments/payments.component';

// Interceptors
import { HttpErrorInterceptor } from './application/interceptors/http-error.interceptor';
import { JwtAuthInterceptor } from './application/interceptors/jwt-auth.interceptor';
import { CorrelationIdInterceptor } from './application/interceptors/correlation-id.interceptor';
import { AcceptLanguageInterceptor } from './application/interceptors/accept-language.interceptor';
import { AcceptHeaderInterceptor } from './application/interceptors/accept-header.interceptor';
import { I18nTitleStrategy } from './application/routing/i18n-title.strategy';

export class CustomLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`/assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient): CustomLoader {
  return new CustomLoader(http);
}

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        EmailVerificationComponent,
        PasswordRecoveryComponent,
        DashboardComponent,
        ProfileComponent,
        NotificationsComponent,
        NotificationCardDirective,
        DocumentsComponent,
        CaseDetailComponent,
        CaseSearchComponent,
        PaymentsComponent,
        PaymentCardDirective,
        AppointmentsComponent,
        MessagesComponent,
        ProceduresComponent,
        CaseWizardComponent,
        ProcedureFlowComponent,
        PublicLayoutComponent,
        PublicHomeComponent,
        InstitutionalInfoComponent,
        LegislationComponent,
        FaqComponent,
        ContactComponent,
        ServiceStatusComponent,
        OrganismsDirectoryComponent,
        TransparencyComponent,
        CalendarComponent,
        GlossaryComponent,
        AccessibilityStatementComponent,
        SitemapComponent,
        DocumentVerificationComponent,
        ErrorPageComponent,
        LoadingSkeletonComponent,
        ContactInboxComponent,
        InboxItemDirective
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        A11yModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        RouterModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })], providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AcceptHeaderInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
        { provide: TitleStrategy, useClass: I18nTitleStrategy },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
