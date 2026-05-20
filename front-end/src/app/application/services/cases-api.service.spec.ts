import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CasesApiService } from './cases-api.service';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { environment } from '../../../environments/environment';
import { CreateCaseRequest, AmendCaseRequest } from '../models/case.models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CasesApiService', () => {
  let service: CasesApiService;
  let httpMock: HttpTestingController;
  let mockFlowService: MockCitizenFlowService;

  const originalUseMock = environment.useMockCitizenFlow;

  beforeEach(() => {
    environment.useMockCitizenFlow = false;
    TestBed.configureTestingModule({
    imports: [],
    providers: [CasesApiService, MockCitizenFlowService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(CasesApiService);
    httpMock = TestBed.inject(HttpTestingController);
    mockFlowService = TestBed.inject(MockCitizenFlowService);
  });

  afterEach(() => {
    environment.useMockCitizenFlow = originalUseMock;
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list', () => {
    it('should GET /citizen/procedures with default pagination', (done) => {
      const mockResponse = {
        items: [{ id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Test' }],
        page: 0, size: 10, totalItems: 1, totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          expect(response.items.length).toBe(1);
          expect(response.items[0].id).toBe('c-1');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET with custom pagination', (done) => {
      service.list(2, 5, 'createdAt,desc').subscribe({ next: () => done() });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures?page=2&size=5&sort=createdAt,desc`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ items: [], page: 2, size: 5, totalItems: 0, totalPages: 1 });
    });

    it('should map case items correctly', (done) => {
      const mockResponse = {
        items: [{ id: 'c-1', category: 'Urbanismo', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'My Case' }],
        page: 0, size: 10, totalItems: 1, totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          const item = response.items[0];
          expect(item.procedureType).toBe('Urbanismo');
          expect(item.status).toBe('PENDING');
          expect(item.title).toBe('My Case');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`)
        .flush(mockResponse);
    });

    it('should fallback to procedureType when category is missing', (done) => {
      const mockResponse = {
        items: [{ id: 'c-1', procedureType: 'Licencias', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Test' }],
        page: 0, size: 10, totalItems: 1, totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          expect(response.items[0].procedureType).toBe('Licencias');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`).flush(mockResponse);
    });

    it('should fallback to default procedureType when both category and procedureType missing', (done) => {
      const mockResponse = {
        items: [{ id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Test' }],
        page: 0, size: 10, totalItems: 1, totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          expect(response.items[0].procedureType).toBe('Procedimiento');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`).flush(mockResponse);
    });

    it('should default description to empty string when missing', (done) => {
      const mockResponse = {
        items: [{ id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Test' }],
        page: 0, size: 10, totalItems: 1, totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          expect(response.items[0].description).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`).flush(mockResponse);
    });

    it('should default assignedUnit to empty string when missing', (done) => {
      const mockResponse = {
        items: [{ id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Test' }],
        page: 0, size: 10, totalItems: 1, totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          expect(response.items[0].assignedUnit).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`).flush(mockResponse);
    });
  });

  describe('getDetail', () => {
    it('should GET case detail and documents', (done) => {
      const detailRaw = {
        id: 'c-1', category: 'Urbanismo', status: 'IN_REVIEW', submittedAt: '2026-01-01T00:00:00Z',
        lastUpdated: '2026-01-02T00:00:00Z', title: 'Case 1', currentTask: 'Review',
        timeline: [{ id: 't-1', title: 'Submitted', date: '2026-01-01T00:00:00Z', description: 'Done' }],
        attachments: [], procedureTypeId: 'p-1', formData: {}
      };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.id).toBe('c-1');
          expect(detail.title).toBe('Case 1');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1'))
        .flush(detailRaw);
      httpMock.expectOne((req) => req.url.includes('/documents'))
        .flush([]);
    });

    it('should create fallback timeline when none provided', (done) => {
      const raw = { id: 'c-2', status: 'PENDING', submittedAt: '2026-03-01T00:00:00Z', lastUpdated: '2026-03-02T00:00:00Z', title: 'No Timeline' };

      service.getDetail('c-2').subscribe({
        next: (detail) => {
          expect(detail.timeline.length).toBe(1);
          expect(detail.timeline[0].title).toContain('Expediente enviado');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-2')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should create empty fallback timeline when no submittedAt and no lastUpdated', (done) => {
      const raw = { id: 'c-3', status: 'DRAFT', title: 'Draft Case' };

      service.getDetail('c-3').subscribe({
        next: (detail) => {
          expect(detail.timeline).toEqual([]);
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-3')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should create fallback timeline using lastUpdated when no submittedAt', (done) => {
      const raw = { id: 'c-3', status: 'DRAFT', lastUpdated: '2026-03-02T00:00:00Z', title: 'Draft Case' };

      service.getDetail('c-3').subscribe({
        next: (detail) => {
          expect(detail.timeline.length).toBe(1);
          expect(detail.timeline[0].title).toContain('Expediente enviado');
          expect(detail.timeline[0].date).toBe('2026-03-02T00:00:00Z');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-3')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should use documents from API when documents list is non-empty', (done) => {
      const detailRaw = {
        id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z',
        lastUpdated: '2026-01-02T00:00:00Z', title: 'Case', attachments: [{ id: 'old' }]
      };
      const docs = [{ id: 'd-new', name: 'new.pdf', mimeType: 'application/pdf', size: 100, uploadedAt: '2026-05-01T00:00:00Z' }];

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.attachments.length).toBe(1);
          expect(detail.attachments[0].id).toBe('d-new');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(detailRaw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush(docs);
    });

    it('should keep detail attachments when documents list is empty', (done) => {
      const detailRaw = {
        id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z',
        lastUpdated: '2026-01-02T00:00:00Z', title: 'Case',
        attachments: [{ id: 'existing', name: 'existing.pdf', type: 'application/pdf', size: 200 }]
      };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.attachments.length).toBe(1);
          expect(detail.attachments[0].id).toBe('existing');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(detailRaw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should default currentTask to empty string when missing', (done) => {
      const raw = { id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Case' };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.currentTask).toBe('');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should default assignedUnit to empty string when missing', (done) => {
      const raw = { id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Case' };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.assignedUnit).toBe('');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should default procedureTypeId to empty string when missing', (done) => {
      const raw = { id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Case' };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.procedureTypeId).toBe('');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should default formData to null when missing', (done) => {
      const raw = { id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z', lastUpdated: '2026-01-02T00:00:00Z', title: 'Case' };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.formData).toBeNull();
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(raw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });

    it('should map attachment type from type field when mimeType missing', (done) => {
      const detailRaw = {
        id: 'c-1', status: 'PENDING', submittedAt: '2026-01-01T00:00:00Z',
        lastUpdated: '2026-01-02T00:00:00Z', title: 'Case',
        attachments: [{ id: 'a-1', name: 'file.pdf', type: 'application/pdf', size: 100 }]
      };

      service.getDetail('c-1').subscribe({
        next: (detail) => {
          expect(detail.attachments[0].type).toBe('application/pdf');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/citizen/procedures/c-1')).flush(detailRaw);
      httpMock.expectOne((req) => req.url.includes('/documents')).flush([]);
    });
  });

  describe('listDocuments', () => {
    it('should GET documents for a case', (done) => {
      const docs = [{ id: 'd-1', name: 'file.pdf', mimeType: 'application/pdf', size: 500, uploadedAt: '2026-05-01T00:00:00Z' }];

      service.listDocuments('c-1').subscribe({
        next: (result) => {
          expect(result.length).toBe(1);
          expect(result[0].type).toBe('application/pdf');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/c-1/documents')).flush(docs);
    });

    it('should default mimeType when missing', (done) => {
      service.listDocuments('c-1').subscribe({
        next: (result) => {
          expect(result[0].type).toBe('application/octet-stream');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/c-1/documents')).flush([{ id: 'd-1', name: 'file' }]);
    });

    it('should default size to 0 when missing', (done) => {
      service.listDocuments('c-1').subscribe({
        next: (result) => {
          expect(result[0].size).toBe(0);
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/c-1/documents')).flush([{ id: 'd-1', name: 'file' }]);
    });

    it('should default uploadedAt to current date when missing', (done) => {
      const before = new Date().toISOString();
      service.listDocuments('c-1').subscribe({
        next: (result) => {
          expect(result[0].uploadedAt).toBeDefined();
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/c-1/documents')).flush([{ id: 'd-1', name: 'file' }]);
    });

    it('should fallback to createdAt when uploadedAt missing', (done) => {
      service.listDocuments('c-1').subscribe({
        next: (result) => {
          expect(result[0].uploadedAt).toBe('2026-01-01T00:00:00Z');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/c-1/documents'))
        .flush([{ id: 'd-1', name: 'file', createdAt: '2026-01-01T00:00:00Z' }]);
    });

    it('should use type field when mimeType is missing', (done) => {
      service.listDocuments('c-1').subscribe({
        next: (result) => {
          expect(result[0].type).toBe('image/png');
          done();
        }
      });

      httpMock.expectOne((req) => req.url.includes('/c-1/documents'))
        .flush([{ id: 'd-1', name: 'file', type: 'image/png' }]);
    });
  });

  describe('getStatus', () => {
    it('should GET case status', (done) => {
      service.getStatus('c-1').subscribe({
        next: (status) => {
          expect(status.id).toBe('c-1');
          expect(status.status).toBe('IN_REVIEW');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/status`)
        .flush({ id: 'c-1', status: 'IN_REVIEW', currentTask: 'Review', lastUpdated: '2026-05-14T00:00:00Z' });
    });

    it('should default currentTask to empty string when missing', (done) => {
      service.getStatus('c-1').subscribe({
        next: (status) => {
          expect(status.currentTask).toBe('');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/status`)
        .flush({ id: 'c-1', status: 'PENDING' });
    });

    it('should fallback to statusUpdatedAt when lastUpdated missing', (done) => {
      service.getStatus('c-1').subscribe({
        next: (status) => {
          expect(status.lastUpdated).toBe('2026-05-15T00:00:00Z');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/status`)
        .flush({ id: 'c-1', status: 'PENDING', statusUpdatedAt: '2026-05-15T00:00:00Z' });
    });
  });

  describe('create', () => {
    it('should POST to create a case', (done) => {
      const req: CreateCaseRequest = { procedureId: 'p-1', title: 'New Case', formData: { name: 'John' } };
      service.create(req).subscribe({
        next: () => done()
      });

      const httpReq = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures`);
      expect(httpReq.request.method).toBe('POST');
      expect(httpReq.request.body.procedureId).toBe('p-1');
      httpReq.flush({ id: 'new-case', status: 'PENDING', submittedAt: '2026-05-01T00:00:00Z', lastUpdated: '2026-05-01T00:00:00Z', title: 'New Case' });
    });
  });

  describe('submit', () => {
    it('should POST to submit a case', (done) => {
      service.submit('c-1').subscribe({ next: () => done() });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/submit`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: 'c-1', status: 'IN_REVIEW', currentTask: 'Review', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('updateDraft', () => {
    it('should PUT to update a draft', (done) => {
      const req: CreateCaseRequest = { procedureId: 'p-1', title: 'Updated', formData: {} };
      service.updateDraft('c-1', req).subscribe({ next: () => done() });

      const httpReq = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1`);
      expect(httpReq.request.method).toBe('PUT');
      httpReq.flush({ id: 'c-1', status: 'PENDING', currentTask: 'Draft', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('amend', () => {
    it('should POST to request amendment', (done) => {
      const req: AmendCaseRequest = { reason: 'Need clarification', formData: { extra: 'data' } };
      service.amend('c-1', req).subscribe({ next: () => done() });

      const httpReq = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/amend`);
      expect(httpReq.request.method).toBe('POST');
      expect(httpReq.request.body.procedureId).toBe('amendment');
      httpReq.flush({ id: 'c-1', status: 'PENDING', currentTask: 'Amendment', lastUpdated: '2026-05-14T00:00:00Z' });
    });

    it('should default formData to empty object when not provided', (done) => {
      const req: AmendCaseRequest = { reason: 'clarification' };
      service.amend('c-1', req).subscribe({ next: () => done() });

      const httpReq = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/amend`);
      expect(httpReq.request.body.formData).toEqual({});
      httpReq.flush({ id: 'c-1', status: 'PENDING', currentTask: 'Amendment', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('mock flow delegation', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should delegate list to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      let result: any;
      service.list().subscribe(r => { result = r; });
      tick(180);
      expect(result).toBeDefined();
      expect(result.items).toEqual([]);
    }));

    it('should delegate getDetail to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      const req: CreateCaseRequest = { procedureId: 'proc-lic-obra-menor', title: 'Mock Detail', formData: {} };
      let created: any;
      mockFlowService.createCase(req).subscribe(c => { created = c; });
      tick(180);

      let result: any;
      service.getDetail(created.id).subscribe(r => { result = r; });
      tick(180);
      expect(result.title).toBe('Mock Detail');
    }));

    it('should delegate getStatus to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      const req: CreateCaseRequest = { procedureId: 'proc-lic-obra-menor', title: 'Mock Status', formData: {} };
      let created: any;
      mockFlowService.createCase(req).subscribe(c => { created = c; });
      tick(180);

      let result: any;
      service.getStatus(created.id).subscribe(r => { result = r; });
      tick(180);
      expect(result.status).toBe('PENDING');
    }));

    it('should delegate create to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      const req: CreateCaseRequest = { procedureId: 'proc-lic-obra-menor', title: 'Mock Create', formData: {} };
      let result: any;
      service.create(req).subscribe(r => { result = r; });
      tick(180);
      expect(result.title).toBe('Mock Create');
    }));

    it('should delegate submit to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      const req: CreateCaseRequest = { procedureId: 'proc-lic-obra-menor', title: 'Mock Submit', formData: {} };
      let created: any;
      mockFlowService.createCase(req).subscribe(c => { created = c; });
      tick(180);

      let result: any;
      service.submit(created.id).subscribe(r => { result = r; });
      tick(180);
      expect(result.status).toBe('REVIEW');
    }));

    it('should delegate amend to mock service when useMockCitizenFlow is true', fakeAsync(() => {
      environment.useMockCitizenFlow = true;
      const req: CreateCaseRequest = { procedureId: 'proc-lic-obra-menor', title: 'Mock Amend', formData: {} };
      let created: any;
      mockFlowService.createCase(req).subscribe(c => { created = c; });
      tick(180);
      mockFlowService.submitCase(created.id).subscribe();
      tick(180);

      const amendReq: AmendCaseRequest = { reason: 'test' };
      let result: any;
      service.amend(created.id, amendReq).subscribe(r => { result = r; });
      tick(180);
      expect(result.status).toBe('PENDING');
    }));
  });
});
