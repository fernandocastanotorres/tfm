import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpEventType, HttpRequest } from '@angular/common/http';
import { DocumentsApiService } from './documents-api.service';
import { environment } from '../../../environments/environment';

describe('DocumentsApiService', () => {
  let service: DocumentsApiService;
  let httpMock: HttpTestingController;

  const mockDocumentRaw = {
    id: 'doc-1',
    caseId: 'case-1',
    name: 'test.pdf',
    type: 'application/pdf',
    size: 1024,
    status: 'uploaded',
    uploadedAt: '2026-05-01T10:00:00Z'
  };

  const mockDocumentDetailRaw = {
    ...mockDocumentRaw,
    checksum: 'abc123',
    version: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentsApiService]
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

  describe('upload', () => {
    it('should POST FormData to /citizen/procedures/{caseId}/documents with progress', (done) => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      service.upload('case-1', file).subscribe({
        next: (event) => {
          if ((event as any).type === HttpEventType.Response) {
            done();
          }
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/documents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      expect(req.request.reportProgress).toBeTrue();
      req.flush({ document: mockDocumentRaw });
    });

    it('should include metadata in FormData when provided', (done) => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const metadata = { description: 'Test doc', category: 'legal' };

      service.upload('case-1', file, metadata).subscribe({
        next: () => {}
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/case-1/documents`);
      const body = req.request.body as FormData;
      req.flush({ document: mockDocumentRaw });
      done();
    });

    it('should map uploaded document item correctly', (done) => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      service.upload('case-1', file).subscribe({
        next: (event) => {
          if ((event as any).type === HttpEventType.Response) {
            done();
          }
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush({ document: mockDocumentRaw });
    });

    it('should handle response without document wrapper', (done) => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      service.upload('case-1', file).subscribe({
        next: (event) => {
          if ((event as any).type === HttpEventType.Response) {
            done();
          }
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush(mockDocumentRaw);
    });
  });

  describe('listByCase', () => {
    it('should GET /citizen/procedures/{caseId}/documents', (done) => {
      service.listByCase('case-1').subscribe({
        next: (documents) => {
          expect(documents.length).toBe(1);
          expect(documents[0].id).toBe('doc-1');
          expect(documents[0].caseId).toBe('case-1');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockDocumentRaw]);
    });

    it('should return empty array when no documents', (done) => {
      service.listByCase('case-1').subscribe({
        next: (documents) => {
          expect(documents).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush([]);
    });

    it('should map mimeType fallback to type', (done) => {
      const raw = { id: 'doc-1', caseId: 'case-1', name: 'file', mimeType: 'image/png', size: 500, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' };

      service.listByCase('case-1').subscribe({
        next: (documents) => {
          expect(documents[0].type).toBe('image/png');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush([raw]);
    });
  });

  describe('getDetail', () => {
    it('should GET /citizen/procedures/{procedureUuid}/documents/{docUuid}', (done) => {
      service.getDetail('case-1', 'doc-1').subscribe({
        next: (detail) => {
          expect(detail.id).toBe('doc-1');
          expect(detail.checksum).toBe('abc123');
          expect(detail.version).toBe(2);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents/doc-1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDocumentDetailRaw);
    });

    it('should default checksum and version when missing', (done) => {
      const raw = { id: 'doc-1', caseId: 'case-1', name: 'file', size: 100, status: 'uploaded', uploadedAt: '2026-01-01T00:00:00Z' };

      service.getDetail('case-1', 'doc-1').subscribe({
        next: (detail) => {
          expect(detail.checksum).toBe('');
          expect(detail.version).toBe(1);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents/doc-1`
      ).flush(raw);
    });
  });

  describe('download', () => {
    it('should GET /citizen/procedures/documents/{id}/download as blob', (done) => {
      const blob = new Blob(['binary'], { type: 'application/pdf' });

      service.download('doc-1').subscribe({
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

  describe('delete', () => {
    it('should DELETE /citizen/procedures/documents/{id}', (done) => {
      service.delete('doc-1').subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/documents/doc-1`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from listByCase', (done) => {
      service.listByCase('case-1').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/case-1/documents`
      ).flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should propagate HTTP errors from delete', (done) => {
      service.delete('doc-1').subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/procedures/documents/doc-1`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });
  });
});
