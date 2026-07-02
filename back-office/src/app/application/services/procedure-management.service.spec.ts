import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ProcedureManagementService } from './procedure-management.service';
import { environment } from '../../../environments/environment';

describe('ProcedureManagementService', () => {
  let service: ProcedureManagementService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}/admin/procedure-types`;
  const catalogUrl = `${environment.apiBaseUrl}/admin/catalog`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProcedureManagementService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProcedureManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('CRUD', () => {
    it('should list procedures via GET', () => {
      const mockProcedures = [{ id: 'p1', name: 'Licencia', status: 'ACTIVE' }] as any[];

      service.list().subscribe((procedures) => {
        expect(procedures).toEqual(mockProcedures);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProcedures);
    });

    it('should create procedure via POST', () => {
      const request = { name: 'NewProc', category: 'Cat1', unit: 'Unit1' } as any;
      const mockResponse = { id: 'p2', name: 'NewProc', status: 'ACTIVE' } as any;

      service.create(request).subscribe((proc) => {
        expect(proc).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should update procedure via PUT', () => {
      const request = { name: 'Updated' } as any;
      const mockResponse = { id: 'p1', name: 'Updated', status: 'ACTIVE' } as any;

      service.update('p1', request).subscribe((proc) => {
        expect(proc).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should toggle status via PATCH', () => {
      const mockResponse = { id: 'p1', name: 'Licencia', status: 'INACTIVE' } as any;

      service.toggleStatus('p1', 'INACTIVE').subscribe((proc) => {
        expect(proc.status).toBe('INACTIVE');
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'INACTIVE' });
      req.flush(mockResponse);
    });

    it('should list categories via GET', () => {
      const mockCategories = ['Cat1', 'Cat2'];

      service.listCategories().subscribe((cats) => {
        expect(cats).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(`${catalogUrl}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });

    it('should list units via GET', () => {
      const mockUnits = ['Unit1', 'Unit2'];

      service.listUnits().subscribe((units) => {
        expect(units).toEqual(mockUnits);
      });

      const req = httpMock.expectOne(`${catalogUrl}/units`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUnits);
    });
  });

  describe('Translations', () => {
    it('should list translations via GET', () => {
      const mockTranslations = [{ locale: 'en', name: 'License' }] as any[];

      service.listTranslations('p1').subscribe((t) => {
        expect(t).toEqual(mockTranslations);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/translations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTranslations);
    });

    it('should upsert translation via PUT', () => {
      const request = { locale: 'en', name: 'License' } as any;
      const mockResponse = { locale: 'en', name: 'License' } as any;

      service.upsertTranslation('p1', request).subscribe((t) => {
        expect(t).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/translations`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('Field i18n', () => {
    it('should list field translations via GET', () => {
      const mockGroups = [{ fieldId: 'f1', translations: [] }] as any[];

      service.listFieldTranslations('p1').subscribe((groups) => {
        expect(groups).toEqual(mockGroups);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/field-i18n`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGroups);
    });

    it('should upsert field translation via PUT', () => {
      const request = { fieldId: 'f1', locale: 'en', label: 'Name' } as any;
      const mockResponse = { fieldId: 'f1', locale: 'en', label: 'Name' } as any;

      service.upsertFieldTranslation('p1', request).subscribe((entry) => {
        expect(entry).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/field-i18n`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should delete field translation via DELETE', () => {
      service.deleteFieldTranslation('p1', 'f1', 'en').subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/field-i18n/f1/en`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Task i18n', () => {
    it('should list task translations via GET', () => {
      const mockTasks = [{ taskOrderIndex: 0, locale: 'en', title: 'Review' }] as any[];

      service.listTaskTranslations('p1').subscribe((tasks) => {
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/task-i18n`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });

    it('should upsert task translation via PUT', () => {
      const request = { locale: 'en', title: 'Review' } as any;
      const mockResponse = { taskOrderIndex: 0, locale: 'en', title: 'Review' } as any;

      service.upsertTaskTranslation('p1', 0, request).subscribe((t) => {
        expect(t).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/task-i18n/0`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should delete task translation via DELETE', () => {
      service.deleteTaskTranslation('p1', 0, 'en').subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/p1/task-i18n/0/en`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
