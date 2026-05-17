import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TransparencyMetric, TransparencyReport } from '../models/sede.models';
import { environment } from '../../../environments/environment';

interface ApiMetrics {
  totalProcedures: number;
  resolvedProcedures: number;
  pendingProcedures: number;
  avgResolutionDays: number;
  slaComplianceRate: number;
  digitalProceduresPct: number;
}

interface ApiReport {
  id: string;
  title: string;
  year: number;
  description: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransparencyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/public-content/transparency`;

  getMetrics(): Observable<TransparencyMetric[]> {
    return this.http.get<ApiMetrics>(`${this.baseUrl}/metrics`).pipe(
      map((m) => [
        { id: 'total-procedures', labelKey: 'TRANSPARENCY.METRIC_TOTAL_PROCEDURES', value: m.totalProcedures, unit: '', trend: 'up' as const },
        { id: 'resolved', labelKey: 'TRANSPARENCY.METRIC_RESOLVED', value: m.resolvedProcedures, unit: '', trend: 'up' as const },
        { id: 'pending', labelKey: 'TRANSPARENCY.METRIC_PENDING', value: m.pendingProcedures, unit: '', trend: 'down' as const },
        { id: 'avg-days', labelKey: 'TRANSPARENCY.METRIC_AVG_DAYS', value: Math.round(m.avgResolutionDays), unit: 'days', trend: m.avgResolutionDays < 15 ? 'down' as const : 'up' as const },
        { id: 'sla-compliance', labelKey: 'TRANSPARENCY.METRIC_SLA_COMPLIANCE', value: Math.round(m.slaComplianceRate), unit: '%', trend: m.slaComplianceRate >= 80 ? 'up' as const : 'down' as const },
        { id: 'digital-procedures', labelKey: 'TRANSPARENCY.METRIC_DIGITAL', value: Math.round(m.digitalProceduresPct), unit: '%', trend: 'up' as const }
      ])
    );
  }

  getReports(): Observable<TransparencyReport[]> {
    return this.http.get<ApiReport[]>(`${this.baseUrl}/reports`).pipe(
      map((items) => items.map((item) => ({
        id: item.id,
        titleKey: '',
        title: item.title,
        year: item.year,
        descriptionKey: '',
        description: item.description,
        downloadUrl: `${this.baseUrl}/reports/${item.id}/download`,
        fileName: item.fileName,
        fileSize: item.fileSize
      } as TransparencyReport)))
    );
  }
}
