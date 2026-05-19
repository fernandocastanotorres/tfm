import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CasesApiService } from './cases-api.service';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { environment } from '../../../environments/environment';

describe('CasesApiService', () => {
  let service: CasesApiService;
  let httpMock: HttpTestingController;
  let mockFlowService: MockCitizenFlowService;

  const originalUseMock = environment.useMockCitizenFlow;

  beforeEach(() => {
    environment.useMockCitizenFlow = false;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CasesApiService, MockCitizenFlowService]
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
  });

  describe('create', () => {
    it('should POST to create a case', (done) => {
      service.create({ procedureId: 'p-1', title: 'New Case', formData: { name: 'John' } }).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.procedureId).toBe('p-1');
      req.flush({ id: 'new-case', status: 'PENDING', submittedAt: '2026-05-01T00:00:00Z', lastUpdated: '2026-05-01T00:00:00Z', title: 'New Case' });
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
      service.updateDraft('c-1', { procedureId: 'p-1', title: 'Updated', formData: {} }).subscribe({ next: () => done() });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 'c-1', status: 'PENDING', currentTask: 'Draft', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('amend', () => {
    it('should POST to request amendment', (done) => {
      service.amend('c-1', { reason: 'Need clarification', formData: { extra: 'data' } }).subscribe({ next: () => done() });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/amend`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.procedureId).toBe('amendment');
      req.flush({ id: 'c-1', status: 'PENDING', currentTask: 'Amendment', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });
});
