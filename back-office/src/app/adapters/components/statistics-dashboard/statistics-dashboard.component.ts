import { Component, OnInit, inject } from '@angular/core';
import { StatisticsService, AnalyticsReport, MonthlyTrendPoint, ProcedureTypeMetric, UnitSlaBreakdown } from '../../../application/services/statistics.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'bo-statistics-dashboard',
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.css']
})
export class StatisticsDashboardComponent implements OnInit {
  private readonly service = inject(StatisticsService);

  isLoading = true;
  report: AnalyticsReport | null = null;
  dateFrom: string = '';
  dateTo: string = '';

  // Chart configurations
  dailyTrendChartConfig: ChartConfiguration<'line'> = {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  };

  monthlyTrendChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  };

  statusDistributionChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
    options: { responsive: true, plugins: { legend: { position: 'right' } } }
  };

  procedureTypeChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, indexAxis: 'y' as const, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }
  };

  slaComplianceChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, max: 100 } } }
  };

  unitSlaChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, indexAxis: 'y' as const, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true, max: 100 } } }
  };

  resolutionTimeChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, indexAxis: 'y' as const, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }
  };

  ngOnInit(): void {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = threeMonthsAgo.toISOString().split('T')[0];
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.service.getAnalyticsReport(this.dateFrom || undefined, this.dateTo || undefined).subscribe({
      next: (report) => {
        this.report = report;
        this.updateCharts(report);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onDateChange(): void {
    this.loadData();
  }

  exportPdf(): void {
    this.service.exportAnalyticsPdf(this.dateFrom || undefined, this.dateTo || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe-estadisticas-${this.dateFrom || 'inicio'}-${this.dateTo || 'fin'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  private updateCharts(report: AnalyticsReport): void {
    this.updateDailyTrendChart(report.dailyTrend);
    this.updateMonthlyTrendChart(report.monthlyTrend);
    this.updateStatusDistributionChart(report.byStatus);
    this.updateProcedureTypeChart(report.procedureTypeMetrics);
    this.updateSlaComplianceChart(report.procedureTypeMetrics);
    this.updateUnitSlaChart(report.unitSlaBreakdown);
    this.updateResolutionTimeChart(report.procedureTypeMetrics);
  }

  private updateDailyTrendChart(trend: { day: string; createdCases: number; resolvedCases: number }[]): void {
    this.dailyTrendChartConfig = {
      ...this.dailyTrendChartConfig,
      data: {
        labels: trend.map(t => t.day),
        datasets: [
          { label: 'Creados', data: trend.map(t => t.createdCases), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3 },
          { label: 'Resueltos', data: trend.map(t => t.resolvedCases), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 }
        ]
      }
    };
  }

  private updateMonthlyTrendChart(trend: MonthlyTrendPoint[]): void {
    this.monthlyTrendChartConfig = {
      ...this.monthlyTrendChartConfig,
      data: {
        labels: trend.map(t => t.month),
        datasets: [
          { label: 'Creados', data: trend.map(t => t.createdCases), backgroundColor: '#3b82f6' },
          { label: 'Resueltos', data: trend.map(t => t.resolvedCases), backgroundColor: '#10b981' }
        ]
      }
    };
  }

  private updateStatusDistributionChart(items: { key: string; label: string; count: number }[]): void {
    const colors = ['#6b7280', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899'];
    this.statusDistributionChartConfig = {
      ...this.statusDistributionChartConfig,
      data: {
        labels: items.map(i => i.label),
        datasets: [{ data: items.map(i => i.count), backgroundColor: colors.slice(0, items.length) }]
      }
    };
  }

  private updateProcedureTypeChart(metrics: ProcedureTypeMetric[]): void {
    this.procedureTypeChartConfig = {
      ...this.procedureTypeChartConfig,
      data: {
        labels: metrics.map(m => m.procedureType),
        datasets: [
          { label: 'Resueltos', data: metrics.map(m => m.totalResolved), backgroundColor: '#3b82f6' }
        ]
      }
    };
  }

  private updateSlaComplianceChart(metrics: ProcedureTypeMetric[]): void {
    this.slaComplianceChartConfig = {
      ...this.slaComplianceChartConfig,
      data: {
        labels: metrics.map(m => m.procedureType),
        datasets: [
          { label: 'Cumplimiento SLA (%)', data: metrics.map(m => m.slaComplianceRate), backgroundColor: metrics.map(m => m.slaComplianceRate >= 80 ? '#10b981' : m.slaComplianceRate >= 50 ? '#f59e0b' : '#ef4444') }
        ]
      }
    };
  }

  private updateUnitSlaChart(breakdown: UnitSlaBreakdown[]): void {
    this.unitSlaChartConfig = {
      ...this.unitSlaChartConfig,
      data: {
        labels: breakdown.map(u => u.unit),
        datasets: [
          { label: 'Cumplimiento SLA (%)', data: breakdown.map(u => u.slaComplianceRate), backgroundColor: breakdown.map(u => u.slaComplianceRate >= 80 ? '#10b981' : u.slaComplianceRate >= 50 ? '#f59e0b' : '#ef4444') }
        ]
      }
    };
  }

  private updateResolutionTimeChart(metrics: ProcedureTypeMetric[]): void {
    this.resolutionTimeChartConfig = {
      ...this.resolutionTimeChartConfig,
      data: {
        labels: metrics.map(m => m.procedureType),
        datasets: [
          { label: 'Media (horas)', data: metrics.map(m => m.avgResolutionHours), backgroundColor: '#8b5cf6' },
          { label: 'Mediana (horas)', data: metrics.map(m => m.medianResolutionHours), backgroundColor: '#ec4899' }
        ]
      }
    };
  }
}
