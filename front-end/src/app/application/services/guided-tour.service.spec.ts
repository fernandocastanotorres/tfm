import { TestBed } from '@angular/core/testing';
import { GuidedTourService } from './guided-tour.service';

describe('GuidedTourService', () => {
  let service: GuidedTourService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuidedTourService]
    });
    service = TestBed.inject(GuidedTourService);

    // Mock introJs
    (window as any).introJs = jasmine.createSpy('introJs').and.returnValue({
      setOptions: jasmine.createSpy('setOptions').and.callFake(function (options: any) {
        return {
          start: jasmine.createSpy('start')
        };
      })
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    // Clean up any tour elements
    document.querySelectorAll('[data-tour]').forEach(el => el.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startCitizenTour', () => {
    it('should not start tour when no elements exist', () => {
      service.startCitizenTour('/sede');
      expect((window as any).introJs).not.toHaveBeenCalled();
    });

    it('should start tour when matching elements exist', () => {
      // Create mock elements that the tour looks for
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      service.startCitizenTour('/sede');
      expect((window as any).introJs).toHaveBeenCalled();
    });

    it('should include home page steps for /sede route', () => {
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      const homeTitle = document.createElement('h1');
      homeTitle.id = 'home-title';
      document.body.appendChild(homeTitle);

      service.startCitizenTour('/sede');

      const introJsSpy = (window as any).introJs;
      expect(introJsSpy).toHaveBeenCalled();
    });

    it('should strip query params from route', () => {
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      service.startCitizenTour('/sede?tab=procedures');

      const introJsSpy = (window as any).introJs;
      expect(introJsSpy).toHaveBeenCalled();
    });

    it('should handle /sede/ route (with trailing slash)', () => {
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      service.startCitizenTour('/sede/');

      const introJsSpy = (window as any).introJs;
      expect(introJsSpy).toHaveBeenCalled();
    });

    it('should handle procedures route', () => {
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      const proceduresTitle = document.createElement('h1');
      proceduresTitle.id = 'procedures-title';
      document.body.appendChild(proceduresTitle);

      service.startCitizenTour('/sede/procedimientos');

      const introJsSpy = (window as any).introJs;
      expect(introJsSpy).toHaveBeenCalled();
    });

    it('should handle FAQ route', () => {
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      const faqTitle = document.createElement('h1');
      faqTitle.id = 'faq-title';
      document.body.appendChild(faqTitle);

      service.startCitizenTour('/sede/faq');

      const introJsSpy = (window as any).introJs;
      expect(introJsSpy).toHaveBeenCalled();
    });

    it('should handle unknown routes with fallback step', () => {
      const navEl = document.createElement('div');
      navEl.setAttribute('data-tour', 'citizen-nav');
      document.body.appendChild(navEl);

      const localeEl = document.createElement('div');
      localeEl.setAttribute('data-tour', 'citizen-locale');
      document.body.appendChild(localeEl);

      const loginEl = document.createElement('div');
      loginEl.setAttribute('data-tour', 'citizen-login');
      document.body.appendChild(loginEl);

      const helpEl = document.createElement('div');
      helpEl.setAttribute('data-tour', 'citizen-help');
      document.body.appendChild(helpEl);

      const mainEl = document.createElement('main');
      mainEl.className = 'public-main';
      document.body.appendChild(mainEl);

      service.startCitizenTour('/sede/unknown-route');

      const introJsSpy = (window as any).introJs;
      expect(introJsSpy).toHaveBeenCalled();
    });
  });
});
