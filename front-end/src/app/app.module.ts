import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    PasswordRecoveryComponent,
    DashboardComponent,
    ProfileComponent,
    NotificationsComponent,
    DocumentsComponent,
    CaseDetailComponent,
    PaymentsComponent,
    AppointmentsComponent,
    MessagesComponent,
    ProceduresComponent,
    CaseWizardComponent,
    ProcedureFlowComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
