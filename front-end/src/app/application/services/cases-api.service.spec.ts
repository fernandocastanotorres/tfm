import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CasesApiService } from './cases-api.service';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import { environment } from '../../../environments/environment';

describe('CasesApiService', () => {
  let service: CasesApiService;
  let httpMock: HttpTestingController;

  const mockCaseRaw = {
    id: 'case-1',
    category: 'Urbanismo',
    status: 'PENDING',
    submittedAt: '2026-05-01T10:00:00Z',
    lastUpdated: '2026-05-14T10:00:00Z',
    title: 'Test Case',
    description: 'Test description',
    assignedUnit: 'Unit A'
  };

  const mockCaseDetailRaw = {
    id: 'case-1',
    category: 'Urbanismo',
    status: 'REVIEW',
    submittedAt: '2026-05-01T10:00:00Z',
    lastUpdated: '2026-05-14T10:00:00Z',
    title: 'Test Case',
    description: 'Test description',
    currentTask: 'Review',
    assignedUnit: 'Unit A',
    timeline: [
      { id: 'tl-1', title: 'Submitted', date: '2026-05-01T10:00:00Z', description: 'Case submitted' }
    ],
    attachments: [
      { id: 'att-1', name: 'doc.pdf', type: 'application/pdf', size: 1024, uploadedAt: '2026-05-01T10:00:00Z' }
    ],
    procedureTypeId: 'proc-1',
    formData: { field: 'value' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CasesApiService, MockCitizenFlowService]
    });
    service = TestBed.inject(CasesApiService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list', () => {
    it('should GET /citizen/procedures with default pagination', (done) => {
      const mockResponse = {
        items: [mockCaseRaw],
        page: 0,
        size: 10,
        totalItems: 1,
        totalPages: 1
      };

      service.list().subscribe({
        next: (response) => {
          expect(response.items.length).toBe(1);
          expect(response.items[0].id).toBe('case-1');
          expect(response.items[0].procedureType).toBe('Urbanismo');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET with custom pagination and sort', (done) => {
      const mockResponse = {
        items: [],
        page: 2,
        size: 5,
        totalItems: 0,
        totalPages: 1
      };

      service.list(2, 5, 'createdAt,desc').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures?page=2&size=5&sort=createdAt,desc`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should map case items correctly', (done) => {
      const raw = {
        id: 'c-1',
        status: 'PENDING',
        submittedAt: '2026-01-01T00:00:00Z',
        lastUpdated: '2026-01-02T00:00:00Z',
        title: 'My Case'
      };
      const mockResponse = { items: [raw], page: 0, size: 10, totalItems: 1, totalPages: 1 };

      service.list().subscribe({
        next: (response) => {
          const item = response.items[0];
          expect(item.id).toBe('c-1');
          expect(item.procedureType).toBe('Procedimiento');
          expect(item.status).toBe('PENDING');
          expect(item.createdAt).toBe('2026-01-01T00:00:00Z');
          expect(item.title).toBe('My Case');
          expect(item.description).toBe('');
          expect(item.assignedUnit).toBe('');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
      req.flush(mockResponse);
    });
  });

  describe('getDetail', () => {
    it('should GET /citizen/procedures/{id} and merge documents', (done) => {
      service.getDetail('case-1').subscribe({
        next: (detail) => {
          expect(detail.id).toBe('case-1');
          expect(detail.title).toBe('Test Case');
          expect(detail.timeline.length).toBe(1);
          done();
        }
      });

      const req1 = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/case-1`
      );
      expect(req1.request.method).toBe('GET');
      req1.flush(mockCaseDetailRaw);

      const req2 = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      );
      expect(req2.request.method).toBe('GET');
      req2.flush([]);
    });

    it('should use attachments from documents endpoint when available', (done) => {
      const docs = [
        { id: 'd-1', name: 'new.pdf', mimeType: 'application/pdf', size: 2048, uploadedAt: '2026-05-15T00:00:00Z' }
      ];

      service.getDetail('case-1').subscribe({
        next: (detail) => {
          expect(detail.attachments.length).toBe(1);
          expect(detail.attachments[0].id).toBe('d-1');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/case-1`
      ).flush(mockCaseDetailRaw);

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush(docs);
    });

    it('should create fallback timeline when none provided', (done) => {
      const raw = {
        id: 'c-2',
        status: 'PENDING',
        submittedAt: '2026-03-01T00:00:00Z',
        lastUpdated: '2026-03-02T00:00:00Z',
        title: 'No Timeline Case'
      };

      service.getDetail('c-2').subscribe({
        next: (detail) => {
          expect(detail.timeline.length).toBe(1);
          expect(detail.timeline[0].title).toContain('Expediente enviado');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/c-2`
      ).flush(raw);

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/c-2/documents`
      ).flush([]);
    });
  });

  describe('listDocuments', () => {
    it('should GET /citizen/procedures/{caseId}/documents', (done) => {
      const docs = [
        { id: 'doc-1', name: 'file.pdf', mimeType: 'application/pdf', size: 500, uploadedAt: '2026-05-01T00:00:00Z' }
      ];

      service.listDocuments('case-1').subscribe({
        next: (result) => {
          expect(result.length).toBe(1);
          expect(result[0].id).toBe('doc-1');
          expect(result[0].type).toBe('application/pdf');
          done();
        }
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      );
      expect(req.request.method).toBe('GET');
      req.flush(docs);
    });

    it('should handle empty document list', (done) => {
      service.listDocuments('case-1').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      );
      req.flush([]);
    });

    it('should default mimeType to application/octet-stream when missing', (done) => {
      const docs = [{ id: 'doc-1', name: 'file', size: 100 }];

      service.listDocuments('case-1').subscribe({
        next: (result) => {
          expect(result[0].type).toBe('application/octet-stream');
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush(docs);
    });
  });

  describe('uploadDocument', () => {
    it('should POST FormData to /citizen/procedures/{caseId}/documents', (done) => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      service.uploadDocument('case-1', file).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/documents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(null);
    });
  });

  describe('downloadDocument', () => {
    it('should GET /citizen/procedures/documents/{id}/download as blob', (done) => {
      const blob = new Blob(['binary content'], { type: 'application/pdf' });

      service.downloadDocument('doc-1').subscribe({
        next: (response) => {
          expect(response).toBeInstanceOf(Blob);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/documents/doc-1/download`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });
  });

  describe('downloadReceipt', () => {
    it('should GET /citizen/procedures/{caseId}/receipt as blob', (done) => {
      const blob = new Blob(['receipt'], { type: 'application/pdf' });

      service.downloadReceipt('case-1').subscribe({
        next: (response) => {
          expect(response).toBeInstanceOf(Blob);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/receipt`
      );
      expect(req.request.method).toBe('GET');
      req.flush(blob);
    });
  });

  describe('getStatus', () => {
    it('should GET /citizen/procedures/{id}/status', (done) => {
      const raw = {
        id: 'case-1',
        status: 'REVIEW',
        currentTask: 'Reviewing',
        lastUpdated: '2026-05-14T00:00:00Z'
      };

      service.getStatus('case-1').subscribe({
        next: (status) => {
          expect(status.id).toBe('case-1');
          expect(status.status).toBe('REVIEW');
          expect(status.currentTask).toBe('Reviewing');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/status`);
      expect(req.request.method).toBe('GET');
      req.flush(raw);
    });

    it('should default currentTask to empty string when missing', (done) => {
      service.getStatus('case-1').subscribe({
        next: (status) => {
          expect(status.currentTask).toBe('');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/status`
      ).flush({ id: 'case-1', status: 'PENDING' });
    });
  });

  describe('create', () => {
    it('should POST to /citizen/procedures with transformed request', (done) => {
      const request = {
        procedureId: 'proc-1',
        title: 'New Case',
        formData: { name: 'John' }
      };

      service.create(request).subscribe({
        next: (result) => {
          expect(result.id).toBe('new-case');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.procedureId).toBe('proc-1');
      expect(req.request.body.formData).toEqual({ name: 'John' });
      expect(req.request.body.documentIds).toEqual([]);
      req.flush({ id: 'new-case', status: 'PENDING', submittedAt: '2026-05-01T00:00:00Z', lastUpdated: '2026-05-01T00:00:00Z', title: 'New Case' });
    });
  });

  describe('submit', () => {
    it('should POST to /citizen/procedures/{id}/submit', (done) => {
      service.submit('case-1').subscribe({
        next: (status) => {
          expect(status.status).toBe('REVIEW');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/submit`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ id: 'case-1', status: 'REVIEW', currentTask: 'Review', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('updateDraft', () => {
    it('should PUT to /citizen/procedures/{id} with transformed request', (done) => {
      const request = {
        procedureId: 'proc-1',
        title: 'Updated Case',
        formData: { field: 'updated' }
      };

      service.updateDraft('case-1', request).subscribe({
        next: (status) => {
          expect(status.status).toBe('PENDING');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.procedureId).toBe('proc-1');
      expect(req.request.body.formData).toEqual({ field: 'updated' });
      req.flush({ id: 'case-1', status: 'PENDING', currentTask: 'Draft', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('amend', () => {
    it('should POST to /citizen/procedures/{id}/amend', (done) => {
      const request = { reason: 'Need clarification', formData: { extra: 'data' } };

      service.amend('case-1', request).subscribe({
        next: (status) => {
          expect(status.status).toBe('PENDING');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/amend`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.procedureId).toBe('amendment');
      expect(req.request.body.formData).toEqual({ extra: 'data' });
      req.flush({ id: 'case-1', status: 'PENDING', currentTask: 'Amendment', lastUpdated: '2026-05-14T00:00:00Z' });
    });

    it('should default formData to empty object when not provided', (done) => {
      service.amend('case-1', { reason: 'Clarification' }).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/amend`);
      expect(req.request.body.formData).toEqual({});
      req.flush({ id: 'case-1', status: 'PENDING', currentTask: '', lastUpdated: '2026-05-14T00:00:00Z' });
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from list', (done) => {
      service.list().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures?page=0&size=10`);
      req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should propagate HTTP errors from getDetail', (done) => {
      service.getDetail('nonexistent').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      httpMock.expectOne(
        (req) => req.url === `${environment.apiBaseUrl}/citizen/procedures/nonexistent`
      ).flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/nonexistent/documents`
      ).flush([]);
    });
  });
});
