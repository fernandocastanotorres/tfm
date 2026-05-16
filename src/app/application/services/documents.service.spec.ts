import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentsService],
    });
    service = TestBed.inject(DocumentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch all documents', () => {
    const mockData = [{ id: 1, name: 'Document 1' }];
    service.getAll().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/v1/documents');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle error on getAll', () => {
    service.getAll().subscribe(
      () => fail('Expected to throw error'),
      (error) => expect(error.status).toBe(500)
    );

    httpMock.expectOne('/api/v1/documents').flush(null, { status: 500, statusText: 'Server Error' });
  });

  // Additional tests for getById, create, update, delete would follow here.
});