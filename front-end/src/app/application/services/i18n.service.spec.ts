import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { I18nService, SupportedLocale } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let translateService: TranslateService;

  const mockTranslateService = {
    addLangs: jasmine.createSpy('addLangs'),
    use: jasmine.createSpy('use'),
    getBrowserCultureLang: jasmine.createSpy('getBrowserCultureLang').and.returnValue('es-ES'),
    onLangChange: {
      subscribe: jasmine.createSpy('subscribe').and.callFake((cb: any) => {
        // Store callback for triggering later
        (mockTranslateService as any)._langChangeCallback = cb;
      })
    }
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        I18nService,
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });
    service = TestBed.inject(I18nService);
    translateService = TestBed.inject(TranslateService);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLocales', () => {
    it('should return supported locales', () => {
      const locales = service.getLocales();
      expect(locales).toContain('es-ES');
      expect(locales).toContain('ca-ES');
      expect(locales).toContain('eu-ES');
      expect(locales).toContain('gl-ES');
      expect(locales).toContain('va-ES');
      expect(locales.length).toBe(5);
    });
  });

  describe('getCurrentLocale', () => {
    it('should return default locale es-ES', () => {
      const locale = service.getCurrentLocale();
      expect(locale).toBe('es-ES');
    });
  });

  describe('getCurrentLocale$', () => {
    it('should return an Observable', () => {
      const obs$ = service.getCurrentLocale$();
      expect(obs$).toBeDefined();
    });

    it('should emit current locale value', (done) => {
      service.getCurrentLocale$().subscribe({
        next: (locale) => {
          expect(locale).toBe('es-ES');
          done();
        }
      });
    });
  });

  describe('setLocale', () => {
    it('should store locale in localStorage', () => {
      service.setLocale('ca-ES');
      expect(localStorage.getItem('tfg.locale')).toBe('ca-ES');
    });

    it('should call translate.use with the locale', () => {
      service.setLocale('eu-ES');
      expect(translateService.use).toHaveBeenCalledWith('eu-ES');
    });

    it('should update current locale', () => {
      service.setLocale('gl-ES');
      expect(service.getCurrentLocale()).toBe('gl-ES');
    });
  });

  describe('init', () => {
    it('should use stored locale when available', () => {
      localStorage.setItem('tfg.locale', 'ca-ES');
      service.init();
      expect(translateService.use).toHaveBeenCalledWith('ca-ES');
    });

    it('should use browser language when no stored locale', () => {
      (translateService.getBrowserCultureLang as jasmine.Spy).and.returnValue('eu-ES');
      service.init();
      expect(translateService.use).toHaveBeenCalledWith('eu-ES');
    });

    it('should default to es-ES when no stored locale and browser lang not supported', () => {
      (translateService.getBrowserCultureLang as jasmine.Spy).and.returnValue('fr-FR');
      service.init();
      expect(translateService.use).toHaveBeenCalledWith('es-ES');
    });

    it('should default to es-ES when no stored locale and no browser lang', () => {
      (translateService.getBrowserCultureLang as jasmine.Spy).and.returnValue(null);
      service.init();
      expect(translateService.use).toHaveBeenCalledWith('es-ES');
    });

    it('should prefer stored locale over browser language', () => {
      localStorage.setItem('tfg.locale', 'va-ES');
      (translateService.getBrowserCultureLang as jasmine.Spy).and.returnValue('ca-ES');
      service.init();
      expect(translateService.use).toHaveBeenCalledWith('va-ES');
    });

    it('should ignore stored locale if not in supported list', () => {
      localStorage.setItem('tfg.locale', 'fr-FR' as any);
      service.init();
      expect(translateService.use).toHaveBeenCalledWith('es-ES');
    });

    it('should subscribe to lang changes and update current locale', () => {
      service.init();
      expect(mockTranslateService.onLangChange.subscribe).toHaveBeenCalled();
    });
  });
});
