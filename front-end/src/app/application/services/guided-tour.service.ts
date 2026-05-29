import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface TourStepDefinition {
  element: string;
  intro: string;
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
}

@Injectable({
  providedIn: 'root'
})
export class GuidedTourService {
  constructor(private readonly translate: TranslateService) {}

  private t(key: string): string {
    return this.translate.instant(`TOUR.${key}`);
  }

  startCitizenTour(currentRoute: string): void {
    const baseSteps: TourStepDefinition[] = [
      {
        element: '[data-tour="citizen-nav"]',
        intro: this.t('BASE_NAV')
      },
      {
        element: '[data-tour="citizen-locale"]',
        intro: this.t('BASE_LOCALE')
      },
      {
        element: '[data-tour="citizen-login"]',
        intro: this.t('BASE_LOGIN')
      },
      {
        element: '[data-tour="citizen-help"]',
        intro: this.t('BASE_HELP')
      }
    ];

    const pageSteps = this.resolvePageSteps(currentRoute);
    const steps = [...baseSteps, ...pageSteps].filter((step) => !!document.querySelector(step.element));

    if (steps.length === 0) {
      return;
    }

    this.ensureIntroCssLoaded();
    void import('intro.js').then(({ default: introJs }) => {
      introJs().setOptions({
        steps,
        showProgress: true,
        tooltipClass: 'tfg-tour-tooltip',
        highlightClass: 'tfg-tour-highlight',
        nextLabel: this.t('NEXT'),
        prevLabel: this.t('PREV'),
        doneLabel: this.t('DONE'),
        skipLabel: '✕'
      }).start();
    });
  }

  private ensureIntroCssLoaded(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const href = '/assets/vendor/introjs/introjs.min.css';
    if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  private resolvePageSteps(currentRoute: string): TourStepDefinition[] {
    const route = currentRoute.split('?')[0];

    const routeMap: Array<{ match: (r: string) => boolean; steps: TourStepDefinition[] }> = [
      {
        match: (r) => r === '/sede' || r === '/sede/',
        steps: [
          { element: '#home-title', intro: this.t('HOME_TITLE') },
          { element: '.public-home__quick-grid', intro: this.t('HOME_QUICK') },
          { element: '.public-home__procedures-grid', intro: this.t('HOME_PROCEDURES') },
          { element: '.public-home__events-list', intro: this.t('HOME_EVENTS') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/procedimientos') && r.endsWith('/flujo'),
        steps: [
          { element: '#procedure-flow-title', intro: this.t('FLOW_TITLE') },
          { element: '.card.p-6', intro: this.t('FLOW_CARD') },
          { element: 'a.btn-primary', intro: this.t('FLOW_START') },
          { element: 'aside.card', intro: this.t('FLOW_SIDEBAR') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/procedimientos'),
        steps: [
          { element: '#procedures-title', intro: this.t('CATALOG_TITLE') },
          { element: '.md\\:grid-cols-2', intro: this.t('CATALOG_GRID') },
          { element: 'button.btn-primary', intro: this.t('CATALOG_START') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/faq'),
        steps: [
          { element: '#faq-title', intro: this.t('FAQ_TITLE') },
          { element: '#faq-search', intro: this.t('FAQ_SEARCH') },
          { element: '#faq-category', intro: this.t('FAQ_CATEGORY') },
          { element: '.faq__list', intro: this.t('FAQ_LIST') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/contacto'),
        steps: [
          { element: '#contact-title', intro: this.t('CONTACT_TITLE') },
          { element: '.contact__channels-grid', intro: this.t('CONTACT_CHANNELS') },
          { element: '.contact__offices-grid', intro: this.t('CONTACT_OFFICES') },
          { element: '.contact__form', intro: this.t('CONTACT_FORM') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/institucional'),
        steps: [
          { element: '#institutional-title', intro: this.t('INSTITUTIONAL_TITLE') },
          { element: '.institutional__grid', intro: this.t('INSTITUTIONAL_GRID') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/normativa'),
        steps: [
          { element: '#legislation-title', intro: this.t('LEGISLATION_TITLE') },
          { element: '#legislation-type-filter', intro: this.t('LEGISLATION_FILTER') },
          { element: '.legislation__list', intro: this.t('LEGISLATION_LIST') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/estado'),
        steps: [
          { element: '#status-title', intro: this.t('STATUS_TITLE') },
          { element: '.service-status__summary', intro: this.t('STATUS_SUMMARY') },
          { element: '.service-status__list', intro: this.t('STATUS_LIST') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/organismo'),
        steps: [
          { element: '#organisms-title', intro: this.t('ORGANISMS_TITLE') },
          { element: '#organism-search', intro: this.t('ORGANISMS_SEARCH') },
          { element: '#organism-category', intro: this.t('ORGANISMS_FILTER') },
          { element: '.organisms__grid', intro: this.t('ORGANISMS_GRID') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/transparencia'),
        steps: [
          { element: '#transparency-title', intro: this.t('TRANSPARENCY_TITLE') },
          { element: '.transparency__metrics-grid', intro: this.t('TRANSPARENCY_METRICS') },
          { element: '.transparency__reports-list', intro: this.t('TRANSPARENCY_REPORTS') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/calendario'),
        steps: [
          { element: '#calendar-title', intro: this.t('CALENDAR_TITLE') },
          { element: '#calendar-type-filter', intro: this.t('CALENDAR_FILTER') },
          { element: '.calendar__list', intro: this.t('CALENDAR_LIST') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/glosario'),
        steps: [
          { element: '#glossary-title', intro: this.t('GLOSSARY_TITLE') },
          { element: '#glossary-search', intro: this.t('GLOSSARY_SEARCH') },
          { element: '.glossary__letters', intro: this.t('GLOSSARY_LETTERS') },
          { element: '.glossary__list', intro: this.t('GLOSSARY_LIST') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/accesibilidad'),
        steps: [
          { element: '#accessibility-title', intro: this.t('ACCESSIBILITY_TITLE') },
          { element: '.accessibility__content', intro: this.t('ACCESSIBILITY_CONTENT') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/mapa'),
        steps: [
          { element: '#sitemap-title', intro: this.t('SITEMAP_TITLE') },
          { element: '.sitemap__grid', intro: this.t('SITEMAP_GRID') }
        ]
      },
      {
        match: (r) => r.startsWith('/sede/citas'),
        steps: [
          { element: '#appointments-title', intro: this.t('APPOINTMENTS_TITLE') },
          { element: '#appointments-search', intro: this.t('APPOINTMENTS_SEARCH') },
          { element: '.mt-8.grid.gap-4', intro: this.t('APPOINTMENTS_LIST') },
          { element: '#slot-title', intro: this.t('APPOINTMENTS_SLOT') }
        ]
      }
    ];

    const matched = routeMap.find((entry) => entry.match(route));
    return matched?.steps ?? [
      { element: 'main.public-main', intro: this.t('DEFAULT') }
    ];
  }
}
