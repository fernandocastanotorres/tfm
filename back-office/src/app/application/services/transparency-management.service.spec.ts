import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TransparencyManagementService } from './transparency-management.service';
import { environment } from '../../../environments/environment';

describe('TransparencyManagementService', () => {
  let service: TransparencyManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransparencyManagementService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TransparencyManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const mockReport = {
    id: '1', title: 'Report 2024', year: 2024, description: 'Annual', filePath: '/reports/2024.pdf',
    fileName: '2024.pdf', fileSize: 1024, mimeType: 'application/pdf', published: true,
    sortOrder: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01'
  };

  const baseUrl = `${environment.apiBaseUrl}/admin/transparency/reports`;

  it('should list reports via GET', () => {
    service.listReports().subscribe((reports) => {
      expect(reports).toEqual([mockReport]);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockReport]);
  });

  it('should create report via POST with FormData', () => {
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
    const request = { file, title: 'New Report', year: 2024, published: true };

    service.createReport(request).subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockReport);
  });

  it('should update report via PUT', () => {
    const update = { title: 'Updated', published: false };

    service.updateReport('1', update).subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(update);
    req.flush(mockReport);
  });

  it('should replace file via POST with FormData', () => {
    const file = new File(['new-content'], 'updated.pdf', { type: 'application/pdf' });

    service.replaceFile('1', file).subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/file`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockReport);
  });

  it('should delete report via DELETE', () => {
    service.deleteReport('1').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should download report via GET with blob response', () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

    service.downloadReport('1').subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${baseUrl}/1/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
