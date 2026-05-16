import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TransparencyMetric, TransparencyReport } from '../models/sede.models';

@Injectable({
  providedIn: 'root'
})
export class TransparencyService {
  private readonly metrics: TransparencyMetric[] = [
    { id: 'total-procedures', labelKey: 'TRANSPARENCY.METRIC_TOTAL_PROCEDURES', value: 12458, unit: '', trend: 'up' },
    { id: 'resolved', labelKey: 'TRANSPARENCY.METRIC_RESOLVED', value: 11230, unit: '', trend: 'up' },
    { id: 'pending', labelKey: 'TRANSPARENCY.METRIC_PENDING', value: 892, unit: '', trend: 'down' },
    { id: 'avg-days', labelKey: 'TRANSPARENCY.METRIC_AVG_DAYS', value: 14, unit: 'days', trend: 'down' },
    { id: 'satisfaction', labelKey: 'TRANSPARENCY.METRIC_SATISFACTION', value: 87, unit: '%', trend: 'up' },
    { id: 'digital-procedures', labelKey: 'TRANSPARENCY.METRIC_DIGITAL', value: 94, unit: '%', trend: 'up' }
  ];

  private readonly reports: TransparencyReport[] = [
    {
      id: 'annual-2025',
      titleKey: 'TRANSPARENCY.REPORT_ANNUAL_2025',
      year: 2025,
      descriptionKey: 'TRANSPARENCY.REPORT_ANNUAL_DESC',
      downloadUrl: '#'
    },
    {
      id: 'annual-2024',
      titleKey: 'TRANSPARENCY.REPORT_ANNUAL_2024',
      year: 2024,
      descriptionKey: 'TRANSPARENCY.REPORT_ANNUAL_DESC',
      downloadUrl: '#'
    },
    {
      id: 'quarterly-q1-2026',
      titleKey: 'TRANSPARENCY.REPORT_QUARTERLY_Q1_2026',
      year: 2026,
      descriptionKey: 'TRANSPARENCY.REPORT_QUARTERLY_DESC',
      downloadUrl: '#'
    }
  ];

  getMetrics(): Observable<TransparencyMetric[]> {
    return of(this.metrics).pipe(delay(300));
  }

  getReports(): Observable<TransparencyReport[]> {
    return of(this.reports).pipe(delay(300));
  }
}
