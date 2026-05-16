import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProceduresService } from './procedures.service';

describe('ProceduresService', () => {
  let service: ProceduresService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProceduresService],
    });
    service = TestBed.inject(ProceduresService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch all procedures', () => {
    const mockData = [{ id: 1, name: 'Procedure 1' }];
    service.getAll().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/v1/procedures');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle error on getAll', () => {
    service.getAll().subscribe(
      () => fail('Expected to throw error'),
      (error) => expect(error.status).toBe(500)
    );

    httpMock.expectOne('/api/v1/procedures').flush(null, { status: 500, statusText: 'Server Error' });
  });

  // Additional tests for getById, create, update, delete would follow here.
});