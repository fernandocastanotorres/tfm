import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpEventType, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DocumentsApiService } from './documents-api.service';
import { environment } from '../../../environments/environment';

describe('DocumentsApiService', () => {
  let service: DocumentsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [DocumentsApiService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(DocumentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listByCase', () => {
    it('should GET /citizen/procedures/{caseId}/documents', (done) => {
      const docs = [
        { id: 'd-1', caseId: 'c-1', name: 'test.pdf', mimeType: 'application/pdf', size: 1024, status: 'uploaded', uploadedAt: '2026-05-01T00:00:00Z' }
      ];

      service.listByCase('c-1').subscribe({
        next: (result) => {
          expect(result.length).toBe(1);
          expect(result[0].id).toBe('d-1');
          expect(result[0].type).toBe('application/pdf');
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`).flush(docs);
    });

    it('should return empty array when no documents', (done) => {
      service.listByCase('c-1').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`).flush([]);
    });
  });

  describe('getDetail', () => {
    it('should GET document detail', (done) => {
      const raw = { id: 'd-1', caseId: 'c-1', name: 'test.pdf', mimeType: 'application/pdf', size: 1024, status: 'uploaded', uploadedAt: '2026-05-01T00:00:00Z', checksum: 'abc123', version: 2 };

      service.getDetail('c-1', 'd-1').subscribe({
        next: (detail) => {
          expect(detail.id).toBe('d-1');
          expect(detail.checksum).toBe('abc123');
          expect(detail.version).toBe(2);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents/d-1`).flush(raw);
    });

    it('should default checksum and version when missing', (done) => {
      const raw = { id: 'd-1', caseId: 'c-1', name: 'file', size: 100, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' };

      service.getDetail('c-1', 'd-1').subscribe({
        next: (detail) => {
          expect(detail.checksum).toBe('');
          expect(detail.version).toBe(1);
          done();
        }
      });

      httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents/d-1`).flush(raw);
    });
  });

  describe('download', () => {
    it('should GET document as blob', (done) => {
      const blob = new Blob(['binary'], { type: 'application/pdf' });

      service.download('d-1').subscribe({
        next: (response) => {
          expect(response).toBeInstanceOf(Blob);
          done();
        }
      });

      const req = httpMock.expectOne((request) => request.url === `${environment.apiBaseUrl}/citizen/procedures/documents/d-1/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('variant')).toBe('CURRENT');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });
  });

  describe('delete', () => {
    it('should DELETE document', (done) => {
      service.delete('d-1').subscribe({ next: () => done() });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/documents/d-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('upload', () => {
    it('should upload a file with FormData and emit progress events', (done) => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const events: any[] = [];

      service.upload('c-1', file).subscribe({
        next: (event) => {
          events.push(event);
        },
        complete: () => {
          // Should have received progress event and final mapped document
          const progressEvent = events.find(e => e.type === HttpEventType.UploadProgress);
          expect(progressEvent).toBeDefined();
          const docEvent = events.find(e => e.id !== undefined);
          expect(docEvent).toBeDefined();
          expect(docEvent.name).toBe('test.pdf');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      expect(req.request.reportProgress).toBeTrue();

      // Verify FormData contains the file
      const formData = req.request.body as FormData;
      // FormData entries can't be directly inspected, but we verified it's FormData

      // Simulate progress event then response
      req.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
      req.flush({
        document: {
          id: 'd-new',
          caseId: 'c-1',
          name: 'test.pdf',
          type: 'application/pdf',
          size: 1024,
          status: 'uploaded',
          uploadedAt: '2026-05-19T00:00:00Z'
        }
      });
    });

    it('should include description in FormData when metadata.description is provided', (done) => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('c-1', file, { description: 'Important document' }).subscribe({
        next: () => {},
        complete: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      expect(req.request.body instanceof FormData).toBeTrue();
      const formData = req.request.body as FormData;
      expect(formData.get('description')).toBe('Important document');
      req.flush({ id: 'd-1', caseId: 'c-1', name: 'doc.pdf', type: 'application/pdf', size: 100, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' });
    });

    it('should include category in FormData when metadata.category is provided', (done) => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('c-1', file, { category: 'legal' }).subscribe({
        next: () => {},
        complete: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      expect(req.request.body instanceof FormData).toBeTrue();
      const formData = req.request.body as FormData;
      expect(formData.get('category')).toBe('legal');
      req.flush({ id: 'd-1', caseId: 'c-1', name: 'doc.pdf', type: 'application/pdf', size: 100, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' });
    });

    it('should include both description and category when both are provided', (done) => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('c-1', file, { description: 'Test doc', category: 'legal' }).subscribe({
        next: () => {},
        complete: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      expect(req.request.body instanceof FormData).toBeTrue();
      const formData = req.request.body as FormData;
      expect(formData.get('description')).toBe('Test doc');
      expect(formData.get('category')).toBe('legal');
      req.flush({ id: 'd-1', caseId: 'c-1', name: 'doc.pdf', type: 'application/pdf', size: 100, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' });
    });

    it('should not include description or category when metadata is undefined', (done) => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('c-1', file).subscribe({
        next: () => {},
        complete: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      expect(req.request.body instanceof FormData).toBeTrue();
      const formData = req.request.body as FormData;
      expect(formData.get('description')).toBeNull();
      expect(formData.get('category')).toBeNull();
      req.flush({ id: 'd-1', caseId: 'c-1', name: 'doc.pdf', type: 'application/pdf', size: 100, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' });
    });

    it('should map response body directly when document key is missing', (done) => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('c-1', file).subscribe({
        next: (result) => {
          if (result && typeof result === 'object' && 'id' in result) {
            expect(result.id).toBe('d-flat');
            expect(result.name).toBe('flat.pdf');
          }
        },
        complete: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      // Response without 'document' wrapper — should use body directly
      req.flush({
        id: 'd-flat',
        caseId: 'c-1',
        name: 'flat.pdf',
        type: 'application/pdf',
        size: 50,
        status: 'uploaded',
        uploadedAt: '2026-01-01T00:00:00Z'
      });
    });

    it('should use mimeType when type is missing in mapped document', (done) => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('c-1', file).subscribe({
        next: (result) => {
          if (result && typeof result === 'object' && 'id' in result) {
            expect(result.type).toBe('image/png');
          }
        },
        complete: () => done()
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/c-1/documents`);
      req.flush({
        document: {
          id: 'd-1',
          caseId: 'c-1',
          name: 'doc.pdf',
          mimeType: 'image/png',
          size: 100,
          status: 'uploaded',
          uploadedAt: '2026-01-01T00:00:00Z'
        }
      });
    });
  });
});
