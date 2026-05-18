import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransparencyService } from './transparency.service';
import { environment } from '../../../environments/environment';

describe('TransparencyService', () => {
  let service: TransparencyService;
  let httpMock: HttpTestingController;

  const mockMetricsRaw = {
    totalProcedures: 150,
    resolvedProcedures: 120,
    pendingProcedures: 30,
    avgResolutionDays: 12,
    slaComplianceRate: 85,
    digitalProceduresPct: 75
  };

  const mockReportRaw = {
    id: 'report-1',
    title: 'Annual Report 2025',
    year: 2025,
    description: 'Annual transparency report',
    fileName: 'report-2025.pdf',
    fileSize: 1024000,
    createdAt: '2025-12-31T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransparencyService]
    });
    service = TestBed.inject(TransparencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMetrics', () => {
    it('should GET /citizen/public-content/transparency/metrics', (done) => {
      service.getMetrics().subscribe({
        next: (metrics) => {
          expect(metrics.length).toBe(6);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetricsRaw);
    });

    it('should map metrics correctly', (done) => {
      service.getMetrics().subscribe({
        next: (metrics) => {
          const totalProcedures = metrics.find(m => m.id === 'total-procedures');
          const resolved = metrics.find(m => m.id === 'resolved');
          const pending = metrics.find(m => m.id === 'pending');
          const avgDays = metrics.find(m => m.id === 'avg-days');
          const sla = metrics.find(m => m.id === 'sla-compliance');
          const digital = metrics.find(m => m.id === 'digital-procedures');

          expect(totalProcedures!.value).toBe(150);
          expect(resolved!.value).toBe(120);
          expect(pending!.value).toBe(30);
          expect(avgDays!.value).toBe(12);
          expect(sla!.value).toBe(85);
          expect(digital!.value).toBe(75);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush(mockMetricsRaw);
    });

    it('should set correct trend for avg-days when below 15', (done) => {
      service.getMetrics().subscribe({
        next: (metrics) => {
          const avgDays = metrics.find(m => m.id === 'avg-days');
          expect(avgDays!.trend).toBe('down');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush(mockMetricsRaw);
    });

    it('should set correct trend for avg-days when 15 or above', (done) => {
      const metrics = { ...mockMetricsRaw, avgResolutionDays: 20 };

      service.getMetrics().subscribe({
        next: (result) => {
          const avgDays = result.find(m => m.id === 'avg-days');
          expect(avgDays!.trend).toBe('up');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush(metrics);
    });

    it('should set correct trend for sla-compliance when >= 80', (done) => {
      service.getMetrics().subscribe({
        next: (metrics) => {
          const sla = metrics.find(m => m.id === 'sla-compliance');
          expect(sla!.trend).toBe('up');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush(mockMetricsRaw);
    });

    it('should set correct trend for sla-compliance when < 80', (done) => {
      const metrics = { ...mockMetricsRaw, slaComplianceRate: 70 };

      service.getMetrics().subscribe({
        next: (result) => {
          const sla = result.find(m => m.id === 'sla-compliance');
          expect(sla!.trend).toBe('down');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush(metrics);
    });

    it('should round avgResolutionDays', (done) => {
      const metrics = { ...mockMetricsRaw, avgResolutionDays: 12.7 };

      service.getMetrics().subscribe({
        next: (result) => {
          const avgDays = result.find(m => m.id === 'avg-days');
          expect(avgDays!.value).toBe(13);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush(metrics);
    });
  });

  describe('getReports', () => {
    it('should GET /citizen/public-content/transparency/reports', (done) => {
      service.getReports().subscribe({
        next: (reports) => {
          expect(reports.length).toBe(1);
          expect(reports[0].id).toBe('report-1');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/citizen/public-content/transparency/reports`);
      expect(req.request.method).toBe('GET');
      req.flush([mockReportRaw]);
    });

    it('should map report fields correctly', (done) => {
      service.getReports().subscribe({
        next: (reports) => {
          const report = reports[0];
          expect(report.title).toBe('Annual Report 2025');
          expect(report.year).toBe(2025);
          expect(report.description).toBe('Annual transparency report');
          expect(report.fileName).toBe('report-2025.pdf');
          expect(report.fileSize).toBe(1024000);
          expect(report.downloadUrl).toContain('report-1/download');
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/reports`
      ).flush([mockReportRaw]);
    });

    it('should return empty array when no reports', (done) => {
      service.getReports().subscribe({
        next: (reports) => {
          expect(reports).toEqual([]);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/reports`
      ).flush([]);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors from getMetrics', (done) => {
      service.getMetrics().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/metrics`
      ).flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should propagate HTTP errors from getReports', (done) => {
      service.getReports().subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      httpMock.expectOne(
        `${environment.apiBaseUrl}/citizen/public-content/transparency/reports`
      ).flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
