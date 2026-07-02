import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { StatisticsService } from './statistics.service';
import { environment } from '../../../environments/environment';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StatisticsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StatisticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch analytics report via GET without date filters', () => {
    const mockReport = { summary: { totalCases: 100, pendingCases: 20 } } as any;

    service.getAnalyticsReport().subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/analytics/report`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('should fetch analytics report with date filters', () => {
    const mockReport = { summary: { totalCases: 50, pendingCases: 5 } } as any;

    service.getAnalyticsReport('2024-01-01', '2024-12-31').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/analytics/report?from=2024-01-01&to=2024-12-31`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('should export analytics PDF via GET with blob response', () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

    service.exportAnalyticsPdf('2024-01-01', '2024-06-30').subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/analytics/export?from=2024-01-01&to=2024-06-30`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should export analytics PDF without date filters', () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

    service.exportAnalyticsPdf().subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/analytics/export`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
