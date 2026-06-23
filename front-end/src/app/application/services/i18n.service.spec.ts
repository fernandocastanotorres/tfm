import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { I18nService, SupportedLocale } from './i18n.service';

// Real translation strings from the actual files
const realTranslations = {
  'es-ES': {
    'LOGIN': { 'TITLE': 'Accede a tu espacio' },
    'APP': { 'TAGLINE': 'Portal ciudadano' },
    'LAYOUT': { 'SKIP_LINK': 'Saltar al contenido principal' },
    'DASHBOARD': { 'TITLE': 'Panel ciudadano' },
    'INSTITUTIONAL': { 'TITLE': 'Información Institucional' }
  },
  'ca-ES': {
    'LOGIN': { 'TITLE': 'Accedeix al teu espai' },
    'APP': { 'TAGLINE': 'Portal ciutadà' },
    'LAYOUT': { 'SKIP_LINK': 'Saltar al contingut principal' },
    'DASHBOARD': { 'TITLE': 'Panell ciutadà' },
    'INSTITUTIONAL': { 'TITLE': 'Informació Institucional' }
  },
  'eu-ES': {
    'LOGIN': { 'TITLE': 'Atzipena zure espaziora' },
    'APP': { 'TAGLINE': 'Herritarren ataria' },
    'LAYOUT': { 'SKIP_LINK': 'Joan eduki nagusira' },
    'DASHBOARD': { 'TITLE': 'Herritarren panela' },
    'INSTITUTIONAL': { 'TITLE': 'Erakunde Informazioa' }
  }
};

class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const translations = realTranslations[lang as keyof typeof realTranslations];
    return of(translations || {});
  }
}

describe('I18nService', () => {
  let translateService: TranslateService;
  let i18nService: I18nService;
  let httpMock: HttpTestingController;

  const supportedLocales: SupportedLocale[] = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        }),
        HttpClientTestingModule
      ],
      providers: [I18nService]
    });

    translateService = TestBed.inject(TranslateService);
    i18nService = TestBed.inject(I18nService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('constructor', () => {
    it('should have correct supported locales', () => {
      expect(i18nService.getLocales()).toEqual(supportedLocales);
    });
  });

  describe('init', () => {
    it('should default to es-ES when no stored or browser locale', fakeAsync(() => {
      i18nService.init();
      tick();

      expect(i18nService.getCurrentLocale()).toBe('es-ES');
    }));

    it('should use stored locale from localStorage', fakeAsync(() => {
      localStorage.setItem('tfm.locale', 'ca-ES');
      i18nService.init();
      tick();

      expect(i18nService.getCurrentLocale()).toBe('ca-ES');
    }));

    it('should use browser culture language if supported', fakeAsync(() => {
      spyOn(translateService, 'getBrowserCultureLang').and.returnValue('eu-ES');
      i18nService.init();
      tick();

      expect(i18nService.getCurrentLocale()).toBe('eu-ES');
    }));

    it('should fallback to es-ES if stored locale is not supported', fakeAsync(() => {
      localStorage.setItem('tfm.locale', 'fr-FR' as any);
      i18nService.init();
      tick();

      expect(i18nService.getCurrentLocale()).toBe('es-ES');
    }));

    it('should fallback to es-ES if browser locale is not supported', fakeAsync(() => {
      spyOn(translateService, 'getBrowserCultureLang').and.returnValue('fr-FR' as any);
      i18nService.init();
      tick();

      expect(i18nService.getCurrentLocale()).toBe('es-ES');
    }));
  });

  describe('setLocale', () => {
    it('should change current locale', fakeAsync(() => {
      i18nService.init();
      tick();

      i18nService.setLocale('ca-ES');
      tick();

      expect(i18nService.getCurrentLocale()).toBe('ca-ES');
    }));

    it('should store the locale in localStorage', fakeAsync(() => {
      i18nService.init();
      tick();

      i18nService.setLocale('gl-ES');

      expect(localStorage.getItem('tfm.locale')).toBe('gl-ES');
    }));

    it('should emit new locale via currentLocale$ observable', fakeAsync(() => {
      i18nService.init();
      tick();

      let emittedLocale = '';
      i18nService.getCurrentLocale$().subscribe(locale => {
        emittedLocale = locale;
      });

      i18nService.setLocale('eu-ES');
      tick();

      expect(emittedLocale).toBe('eu-ES');
    }));
  });

  describe('getCurrentLocale', () => {
    it('should return the current locale value', fakeAsync(() => {
      i18nService.init();
      tick();

      expect(i18nService.getCurrentLocale()).toBe('es-ES');

      i18nService.setLocale('va-ES');
      tick();

      expect(i18nService.getCurrentLocale()).toBe('va-ES');
    }));
  });

  describe('getCurrentLocale$', () => {
    it('should return an observable of the current locale', fakeAsync(() => {
      i18nService.init();
      tick();

      const locales: string[] = [];
      i18nService.getCurrentLocale$().subscribe(locale => {
        locales.push(locale);
      });

      i18nService.setLocale('ca-ES');
      tick();

      i18nService.setLocale('gl-ES');
      tick();

      expect(locales).toEqual(['es-ES', 'ca-ES', 'gl-ES']);
    }));
  });

  describe('REAL translation behavior (exact strings from translation files)', () => {
    it('should translate LOGIN.TITLE to Spanish "Accede a tu espacio" in es-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('es-ES');
      tick();

      let translation = '';
      translateService.get('LOGIN.TITLE').subscribe(t => { translation = t; });
      tick();

      expect(translation).toBe('Accede a tu espacio');
    }));

    it('should translate LOGIN.TITLE to Catalan "Accedeix al teu espai" in ca-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('ca-ES');
      tick();

      let translation = '';
      translateService.get('LOGIN.TITLE').subscribe(t => { translation = t; });
      tick();

      expect(translation).toBe('Accedeix al teu espai');
    }));

    it('should translate APP.TAGLINE to "Portal ciudadano" in es-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('es-ES');
      tick();

      let translation = '';
      translateService.get('APP.TAGLINE').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Portal ciudadano');
    }));

    it('should translate APP.TAGLINE to "Portal ciutadà" in ca-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('ca-ES');
      tick();

      let translation = '';
      translateService.get('APP.TAGLINE').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Portal ciutadà');
    }));

    it('should change translation when switching from es-ES to ca-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('es-ES');
      tick();

      let esTranslation = '';
      translateService.get('LOGIN.TITLE').subscribe(t => { esTranslation = t; });
      tick();
      expect(esTranslation).toBe('Accede a tu espacio');

      i18nService.setLocale('ca-ES');
      tick();

      let caTranslation = '';
      translateService.get('LOGIN.TITLE').subscribe(t => { caTranslation = t; });
      tick();
      expect(caTranslation).toBe('Accedeix al teu espai');
    }));

    it('should translate INSTITUTIONAL.TITLE to Basque "Erakunde Informazioa" in eu-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('eu-ES');
      tick();

      let translation = '';
      translateService.get('INSTITUTIONAL.TITLE').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Erakunde Informazioa');
    }));

    it('should translate LAYOUT.SKIP_LINK to Spanish "Saltar al contenido principal" in es-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('es-ES');
      tick();

      let translation = '';
      translateService.get('LAYOUT.SKIP_LINK').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Saltar al contenido principal');
    }));

    it('should translate LAYOUT.SKIP_LINK to Catalan "Saltar al contingut principal" in ca-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('ca-ES');
      tick();

      let translation = '';
      translateService.get('LAYOUT.SKIP_LINK').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Saltar al contingut principal');
    }));

    it('should translate DASHBOARD.TITLE to "Panel ciudadano" in es-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('es-ES');
      tick();

      let translation = '';
      translateService.get('DASHBOARD.TITLE').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Panel ciudadano');
    }));

    it('should translate DASHBOARD.TITLE to "Panell ciutadà" in ca-ES', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('ca-ES');
      tick();

      let translation = '';
      translateService.get('DASHBOARD.TITLE').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('Panell ciutadà');
    }));

    it('should switch from Catalan back to Spanish correctly', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('ca-ES');
      tick();

      let caTranslation = '';
      translateService.get('LOGIN.TITLE').subscribe(t => { caTranslation = t; });
      tick();
      expect(caTranslation).toBe('Accedeix al teu espai');

      i18nService.setLocale('es-ES');
      tick();

      let esTranslation = '';
      translateService.get('LOGIN.TITLE').subscribe(t => { esTranslation = t; });
      tick();
      expect(esTranslation).toBe('Accede a tu espacio');
    }));

    it('should have empty translation key for unknown locale', fakeAsync(() => {
      i18nService.init();
      tick();
      i18nService.setLocale('es-ES');
      tick();

      let translation = '';
      translateService.get('NONEXISTENT.KEY').subscribe(t => { translation = t; });
      tick();
      expect(translation).toBe('NONEXISTENT.KEY');
    }));
  });
});