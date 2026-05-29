import { Routes } from '@angular/router';
import { InstitutionalInfoComponent } from '../components/institutional-info/institutional-info.component';
import { LegislationComponent } from '../components/legislation/legislation.component';
import { FaqComponent } from '../components/faq/faq.component';
import { ContactComponent } from '../components/contact/contact.component';
import { ServiceStatusComponent } from '../components/service-status/service-status.component';
import { OrganismsDirectoryComponent } from '../components/organisms-directory/organisms-directory.component';
import { TransparencyComponent } from '../components/transparency/transparency.component';
import { CalendarComponent } from '../components/calendar/calendar.component';
import { GlossaryComponent } from '../components/glossary/glossary.component';
import { AccessibilityStatementComponent } from '../components/accessibility-statement/accessibility-statement.component';
import { SitemapComponent } from '../components/sitemap/sitemap.component';
import { DocumentVerificationComponent } from '../components/document-verification/document-verification.component';
import { SiteSearchComponent } from '../components/site-search/site-search.component';

export const PUBLIC_INFO_ROUTES: Routes = [
  { path: 'institucional', component: InstitutionalInfoComponent, title: 'PUBLIC.NAV_INSTITUTIONAL' },
  { path: 'normativa', component: LegislationComponent, title: 'PUBLIC.NAV_LEGISLATION' },
  { path: 'faq', component: FaqComponent, title: 'PUBLIC.NAV_FAQ' },
  { path: 'contacto', component: ContactComponent, title: 'PUBLIC.NAV_CONTACT' },
  { path: 'estado', component: ServiceStatusComponent, title: 'PUBLIC.NAV_STATUS' },
  { path: 'organismo', component: OrganismsDirectoryComponent, title: 'PUBLIC.NAV_ORGANISMS' },
  { path: 'transparencia', component: TransparencyComponent, title: 'PUBLIC.NAV_TRANSPARENCY' },
  { path: 'calendario', component: CalendarComponent, title: 'PUBLIC.NAV_CALENDAR' },
  { path: 'glosario', component: GlossaryComponent, title: 'PUBLIC.NAV_GLOSSARY' },
  { path: 'accesibilidad', component: AccessibilityStatementComponent, title: 'PUBLIC.NAV_ACCESSIBILITY' },
  { path: 'mapa', component: SitemapComponent, title: 'PUBLIC.NAV_SITEMAP' },
  { path: 'validar-documento', component: DocumentVerificationComponent, title: 'PUBLIC.VALIDATE_DOCUMENT' },
  { path: 'busqueda', component: SiteSearchComponent, title: 'Buscador de sede' },
];
