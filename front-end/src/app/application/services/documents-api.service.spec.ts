import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpEventType } from '@angular/common/http';
import { DocumentsApiService } from './documents-api.service';
import { environment } from '../../../environments/environment';

describe('DocumentsApiService', () => {
  let service: DocumentsApiService;
  let httpMock: HttpTestingController;

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

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/procedures/documents/d-1/download`);
      expect(req.request.method).toBe('GET');
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
});
