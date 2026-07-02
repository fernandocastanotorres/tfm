import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PublicContentManagementService } from './public-content-management.service';
import { environment } from '../../../environments/environment';

describe('PublicContentManagementService', () => {
  let service: PublicContentManagementService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}/admin/public-content`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicContentManagementService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PublicContentManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const flushList = (url: string, method: string, mock: any[], callback: () => void) => {
    callback();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    req.flush(mock);
  };

  const flushSingle = (url: string, method: string, body: any, mock: any, callback: () => void) => {
    callback();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    if (body !== undefined) {
      expect(req.request.body).toEqual(body);
    }
    req.flush(mock);
  };

  describe('Legislation', () => {
    it('should list legislation via GET', () => {
      service.listLegislation().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/legislation`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create legislation via POST', () => {
      const request = { title: 'Law 1', content: '...' } as any;
      service.createLegislation(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/legislation`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush({ id: '1' } as any);
    });

    it('should update legislation via PUT', () => {
      const request = { title: 'Updated' } as any;
      service.updateLegislation('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/legislation/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list legislation translations via GET', () => {
      service.listLegislationTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/legislation/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete legislation via DELETE', () => {
      service.deleteLegislation('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/legislation/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('FAQ Categories', () => {
    it('should list FAQ categories via GET', () => {
      service.listFaqCategories().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/faq/categories`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create FAQ category via POST', () => {
      const request = { title: 'General' } as any;
      service.createFaqCategory(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/faq/categories`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '1' } as any);
    });

    it('should update FAQ category via PUT', () => {
      const request = { title: 'Updated' } as any;
      service.updateFaqCategory('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/faq/categories/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list FAQ category translations via GET', () => {
      service.listFaqCategoryTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/faq/categories/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete FAQ category via DELETE', () => {
      service.deleteFaqCategory('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/faq/categories/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('FAQ Entries', () => {
    it('should list FAQ entries via GET', () => {
      service.listFaqEntries().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/faq`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create FAQ entry via POST', () => {
      const request = { question: 'Q?', answer: 'A.' } as any;
      service.createFaqEntry(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/faq`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '1' } as any);
    });

    it('should update FAQ entry via PUT', () => {
      const request = { question: 'Updated' } as any;
      service.updateFaqEntry('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/faq/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list FAQ entry translations via GET', () => {
      service.listFaqTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/faq/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete FAQ entry via DELETE', () => {
      service.deleteFaqEntry('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/faq/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Calendar', () => {
    it('should list calendar entries via GET', () => {
      service.listCalendarEntries().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/calendar`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create calendar entry via POST', () => {
      const request = { title: 'Event', date: '2024-06-01' } as any;
      service.createCalendarEntry(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/calendar`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '1' } as any);
    });

    it('should update calendar entry via PUT', () => {
      const request = { title: 'Updated' } as any;
      service.updateCalendarEntry('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/calendar/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list calendar translations via GET', () => {
      service.listCalendarTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/calendar/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete calendar entry via DELETE', () => {
      service.deleteCalendarEntry('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/calendar/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Institutional', () => {
    it('should list institutional entries via GET', () => {
      service.listInstitutional().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/institutional`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create institutional entry via POST', () => {
      const request = { title: 'About' } as any;
      service.createInstitutional(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/institutional`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '1' } as any);
    });

    it('should update institutional entry via PUT', () => {
      const request = { title: 'Updated' } as any;
      service.updateInstitutional('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/institutional/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list institutional translations via GET', () => {
      service.listInstitutionalTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/institutional/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete institutional entry via DELETE', () => {
      service.deleteInstitutional('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/institutional/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Organisms', () => {
    it('should list organisms via GET', () => {
      service.listOrganisms().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/organisms`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should list organism categories via GET', () => {
      service.listOrganismCategories().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/organism-categories`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create organism via POST', () => {
      const request = { name: 'Org 1' } as any;
      service.createOrganism(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/organisms`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '1' } as any);
    });

    it('should update organism via PUT', () => {
      const request = { name: 'Updated' } as any;
      service.updateOrganism('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/organisms/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list organism translations via GET', () => {
      service.listOrganismTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/organisms/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete organism via DELETE', () => {
      service.deleteOrganism('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/organisms/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Resources', () => {
    it('should list resources via GET', () => {
      service.listResources().subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/resources`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should create resource via POST', () => {
      const request = { title: 'Resource 1' } as any;
      service.createResource(request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/resources`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: '1' } as any);
    });

    it('should update resource via PUT', () => {
      const request = { title: 'Updated' } as any;
      service.updateResource('1', request).subscribe((r) => expect(r).toEqual({ id: '1' } as any));
      const req = httpMock.expectOne(`${baseUrl}/resources/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '1' } as any);
    });

    it('should list resource translations via GET', () => {
      service.listResourceTranslations('1').subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/resources/1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should delete resource via DELETE', () => {
      service.deleteResource('1').subscribe((r) => expect(r).toBeNull());
      const req = httpMock.expectOne(`${baseUrl}/resources/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Theme', () => {
    it('should get theme palette via GET', () => {
      service.getThemePalette().subscribe((r) => expect(r).toEqual({ colors: {} } as any));
      const req = httpMock.expectOne(`${baseUrl}/theme`);
      expect(req.request.method).toBe('GET');
      req.flush({ colors: {} } as any);
    });

    it('should save theme palette via PUT', () => {
      const request = { colors: { primary: '#000' } } as any;
      service.saveThemePalette(request).subscribe((r) => expect(r).toEqual({ colors: {} } as any));
      const req = httpMock.expectOne(`${baseUrl}/theme`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush({ colors: {} } as any);
    });
  });
});
