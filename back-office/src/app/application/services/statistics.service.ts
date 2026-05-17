import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardReportSummary {
  totalCases: number;
  pendingCases: number;
  inProgressCases: number;
  resolvedCases: number;
  overdueCases: number;
  slaComplianceRate: number;
  averageResolutionHours: number;
}

export interface DistributionItem {
  key: string;
  label: string;
  count: number;
}

export interface DailyTrendPoint {
  day: string;
  createdCases: number;
  resolvedCases: number;
}

export interface MonthlyTrendPoint {
  month: string;
  createdCases: number;
  resolvedCases: number;
  avgResolutionHours: number;
}

export interface ProcedureTypeMetric {
  procedureType: string;
  totalResolved: number;
  avgResolutionHours: number;
  medianResolutionHours: number;
  slaComplianceRate: number;
}

export interface UnitSlaBreakdown {
  unit: string;
  totalCases: number;
  resolvedWithinSla: number;
  totalResolved: number;
  slaComplianceRate: number;
}

export interface AnalyticsReport {
  summary: DashboardReportSummary;
  byStatus: DistributionItem[];
  byProcedureType: DistributionItem[];
  byAssignedUnit: DistributionItem[];
  dailyTrend: DailyTrendPoint[];
  monthlyTrend: MonthlyTrendPoint[];
  procedureTypeMetrics: ProcedureTypeMetric[];
  unitSlaBreakdown: UnitSlaBreakdown[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  getAnalyticsReport(from?: string, to?: string): Observable<AnalyticsReport> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<AnalyticsReport>(`${this.baseUrl}/analytics/report`, { params });
  }

  exportAnalyticsPdf(from?: string, to?: string): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get(`${this.baseUrl}/analytics/export`, { params, responseType: 'blob' });
  }
}
