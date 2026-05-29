import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { TransparencyComponent } from './transparency.component';
import { TransparencyService } from '../../../application/services/transparency.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TransparencyComponent', () => {
  let component: TransparencyComponent;
  let fixture: ComponentFixture<TransparencyComponent>;
  let transparencyService: jasmine.SpyObj<TransparencyService>;

  const mockMetrics = [
    { id: '1', labelKey: 'TRANSPARENCY.METRIC_PROCEDURES', value: 1250, unit: 'count', trend: 'up' as const },
    { id: '2', labelKey: 'TRANSPARENCY.METRIC_RESPONSE_TIME', value: 5.2, unit: 'days', trend: 'down' as const }
  ];

  const mockReports = [
    { id: '1', titleKey: 'TRANSPARENCY.REPORT_ANNUAL_2025', title: 'Annual Report 2025', year: 2025, descriptionKey: 'TRANSPARENCY.REPORT_ANNUAL_2025_DESC', description: 'Annual transparency report', downloadUrl: 'https://example.com/report-2025' },
    { id: '2', titleKey: 'TRANSPARENCY.REPORT_Q4_2025', title: 'Quarterly Report Q4', year: 2025, descriptionKey: 'TRANSPARENCY.REPORT_Q4_2025_DESC', description: 'Q4 transparency report', downloadUrl: 'https://example.com/q4-2025' }
  ];

  beforeEach(async () => {
    transparencyService = jasmine.createSpyObj('TransparencyService', ['getMetrics', 'getReports']);
    transparencyService.getMetrics.and.returnValue(of(mockMetrics));
    transparencyService.getReports.and.returnValue(of(mockReports));

    await TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [TranslateModule.forRoot(), TransparencyComponent],
    providers: [
        { provide: TransparencyService, useValue: transparencyService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([])
    ]
}).compileComponents();

    fixture = TestBed.createComponent(TransparencyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load metrics and reports on init', () => {
    fixture.detectChanges();
    expect(transparencyService.getMetrics).toHaveBeenCalled();
    expect(transparencyService.getReports).toHaveBeenCalled();
    expect(component.metrics.length).toBe(2);
    expect(component.reports.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty metrics', () => {
    transparencyService.getMetrics.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.metrics.length).toBe(0);
  });

  it('should handle empty reports', () => {
    transparencyService.getReports.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.reports.length).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to false on reports error', () => {
    transparencyService.getReports.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
  });

  it('should return up arrow for up trend', () => {
    expect(component.getTrendIcon('up')).toBe('↑');
  });

  it('should return down arrow for down trend', () => {
    expect(component.getTrendIcon('down')).toBe('↓');
  });

  it('should return right arrow for stable trend', () => {
    expect(component.getTrendIcon('stable')).toBe('→');
  });

  it('should return right arrow for undefined trend', () => {
    expect(component.getTrendIcon()).toBe('→');
  });

  it('should return TREND_UP label for up trend', () => {
    expect(component.getTrendLabel('up')).toBe('TRANSPARENCY.TREND_UP');
  });

  it('should return TREND_DOWN label for down trend', () => {
    expect(component.getTrendLabel('down')).toBe('TRANSPARENCY.TREND_DOWN');
  });

  it('should return TREND_STABLE label for stable trend', () => {
    expect(component.getTrendLabel('stable')).toBe('TRANSPARENCY.TREND_STABLE');
  });

  it('should return TREND_STABLE label for undefined trend', () => {
    expect(component.getTrendLabel()).toBe('TRANSPARENCY.TREND_STABLE');
  });
});
