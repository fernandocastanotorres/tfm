import { TestBed } from '@angular/core/testing';
import { GuidedTourService } from './guided-tour.service';

describe('GuidedTourService', () => {
  let service: GuidedTourService;
  let createdElements: HTMLElement[] = [];
  let mockStart: jasmine.Spy;
  let mockSetOptions: jasmine.Spy;
  let mockIntroJs: jasmine.Spy;

  beforeEach(() => {
    mockStart = jasmine.createSpy('start');
    mockSetOptions = jasmine.createSpy('setOptions').and.returnValue({ start: mockStart });
    mockIntroJs = jasmine.createSpy('introJs').and.returnValue({ setOptions: mockSetOptions });

    // Register global introJs mock
    (window as any).introJs = mockIntroJs;

    TestBed.configureTestingModule({});
    service = TestBed.inject(GuidedTourService);
  });

  afterEach(() => {
    createdElements.forEach((el) => el.remove());
    createdElements = [];
  });

  function createElement(selector: string, parent: HTMLElement = document.body): HTMLElement {
    let el: HTMLElement;
    if (selector.startsWith('#')) {
      el = document.createElement('div');
      el.id = selector.substring(1);
    } else if (selector.startsWith('[')) {
      el = document.createElement('div');
      const match = selector.match(/\[data-tour="([^"]+)"\]/);
      if (match) {
        el.setAttribute('data-tour', match[1]);
      }
    } else if (selector.includes('\\')) {
      el = document.createElement('div');
      el.className = selector.replace(/\\/g, '');
    } else if (selector.startsWith('.')) {
      el = document.createElement('div');
      el.className = selector.substring(1).replace(/\./g, ' ');
    } else {
      el = document.createElement(selector.split('.')[0]);
      if (selector.includes('.')) {
        el.className = selector.split('.').slice(1).join(' ');
      }
    }
    parent.appendChild(el);
    createdElements.push(el);
    return el;
  }

  function createBaseElements() {
    createElement('[data-tour="citizen-nav"]');
    createElement('[data-tour="citizen-locale"]');
    createElement('[data-tour="citizen-login"]');
    createElement('[data-tour="citizen-help"]');
  }

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('startCitizenTour - No Steps', () => {
    it('should return early when no DOM elements found for steps', () => {
      service.startCitizenTour('/sede');
      expect(mockIntroJs).not.toHaveBeenCalled();
    });

    it('should return early for unknown route with no matching elements', () => {
      service.startCitizenTour('/sede/unknown-route');
      expect(mockIntroJs).not.toHaveBeenCalled();
    });
  });

  describe('startCitizenTour - With Steps', () => {
    it('should not throw when elements exist and tour is started', () => {
      createBaseElements();
      createElement('main.public-main');

      // Should not throw even though introJs is not fully mocked
      expect(() => service.startCitizenTour('/sede/unknown')).not.toThrow();
    });

    it('should include base steps when DOM elements exist', () => {
      createBaseElements();
      createElement('#home-title');
      createElement('.public-home__quick-grid');
      createElement('.public-home__procedures-grid');
      createElement('.public-home__events-list');

      const steps = (service as any).resolvePageSteps('/sede');
      expect(steps.length).toBe(4);
    });
  });

  describe('resolvePageSteps - Home Route', () => {
    it('should return home-specific steps for "/sede"', () => {
      const steps = (service as any).resolvePageSteps('/sede');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#home-title');
      expect(steps[1].element).toBe('.public-home__quick-grid');
    });

    it('should return home-specific steps for "/sede/"', () => {
      const steps = (service as any).resolvePageSteps('/sede/');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#home-title');
    });
  });

  describe('resolvePageSteps - Procedures Routes', () => {
    it('should return procedure-flow steps for "/sede/procedimientos/xxx/flujo"', () => {
      const steps = (service as any).resolvePageSteps('/sede/procedimientos/abc-123/flujo');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#procedure-flow-title');
      expect(steps[1].element).toBe('.card.p-6');
    });

    it('should return procedures list steps for "/sede/procedimientos"', () => {
      const steps = (service as any).resolvePageSteps('/sede/procedimientos');
      expect(steps.length).toBe(3);
      expect(steps[0].element).toBe('#procedures-title');
    });

    it('should return procedures list steps for "/sede/procedimientos/xxx"', () => {
      const steps = (service as any).resolvePageSteps('/sede/procedimientos/abc-123');
      expect(steps.length).toBe(3);
      expect(steps[0].element).toBe('#procedures-title');
    });
  });

  describe('resolvePageSteps - Other Routes', () => {
    it('should return faq steps for "/sede/faq"', () => {
      const steps = (service as any).resolvePageSteps('/sede/faq');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#faq-title');
      expect(steps[1].element).toBe('#faq-search');
    });

    it('should return contact steps for "/sede/contacto"', () => {
      const steps = (service as any).resolvePageSteps('/sede/contacto');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#contact-title');
      expect(steps[3].element).toBe('.contact__form');
    });

    it('should return institutional steps for "/sede/institucional"', () => {
      const steps = (service as any).resolvePageSteps('/sede/institucional');
      expect(steps.length).toBe(2);
      expect(steps[0].element).toBe('#institutional-title');
    });

    it('should return legislation steps for "/sede/normativa"', () => {
      const steps = (service as any).resolvePageSteps('/sede/normativa');
      expect(steps.length).toBe(3);
      expect(steps[0].element).toBe('#legislation-title');
      expect(steps[1].element).toBe('#legislation-type-filter');
    });

    it('should return status steps for "/sede/estado"', () => {
      const steps = (service as any).resolvePageSteps('/sede/estado');
      expect(steps.length).toBe(3);
      expect(steps[0].element).toBe('#status-title');
    });
  });

  describe('resolvePageSteps - More Routes', () => {
    it('should return organisms steps for "/sede/organismo"', () => {
      const steps = (service as any).resolvePageSteps('/sede/organismo');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#organisms-title');
      expect(steps[1].element).toBe('#organism-search');
    });

    it('should return transparency steps for "/sede/transparencia"', () => {
      const steps = (service as any).resolvePageSteps('/sede/transparencia');
      expect(steps.length).toBe(3);
      expect(steps[0].element).toBe('#transparency-title');
    });

    it('should return calendar steps for "/sede/calendario"', () => {
      const steps = (service as any).resolvePageSteps('/sede/calendario');
      expect(steps.length).toBe(3);
      expect(steps[0].element).toBe('#calendar-title');
      expect(steps[1].element).toBe('#calendar-type-filter');
    });

    it('should return glossary steps for "/sede/glosario"', () => {
      const steps = (service as any).resolvePageSteps('/sede/glosario');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#glossary-title');
    });

    it('should return accessibility steps for "/sede/accesibilidad"', () => {
      const steps = (service as any).resolvePageSteps('/sede/accesibilidad');
      expect(steps.length).toBe(2);
      expect(steps[0].element).toBe('#accessibility-title');
    });
  });

  describe('resolvePageSteps - Remaining Routes', () => {
    it('should return sitemap steps for "/sede/mapa"', () => {
      const steps = (service as any).resolvePageSteps('/sede/mapa');
      expect(steps.length).toBe(2);
      expect(steps[0].element).toBe('#sitemap-title');
    });

    it('should return appointments steps for "/sede/citas"', () => {
      const steps = (service as any).resolvePageSteps('/sede/citas');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#appointments-title');
      expect(steps[1].element).toBe('#appointments-search');
    });

    it('should return default main content steps for unknown route "/sede/unknown"', () => {
      const steps = (service as any).resolvePageSteps('/sede/unknown');
      expect(steps.length).toBe(1);
      expect(steps[0].element).toBe('main.public-main');
    });
  });

  describe('resolvePageSteps - Query Params', () => {
    it('should strip query params before matching route', () => {
      const steps = (service as any).resolvePageSteps('/sede/faq?category=general');
      expect(steps.length).toBe(4);
      expect(steps[0].element).toBe('#faq-title');
    });
  });
});
