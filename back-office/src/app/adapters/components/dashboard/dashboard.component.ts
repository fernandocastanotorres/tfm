import { Component, inject, OnInit } from '@angular/core';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import {
  DashboardStats,
  PendingTask,
  CaseItem,
  DashboardReport,
  DashboardDistributionItem,
  DashboardDailyTrendPoint
} from '../../../application/models/backoffice.models';

@Component({
    selector: 'bo-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);

  stats: DashboardStats | null = null;
  report: DashboardReport | null = null;
  pendingTasks: PendingTask[] = [];
  recentCases: CaseItem[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.adminCasesService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: () => {
        this.stats = this.getDefaultStats();
        this.isLoading = false;
      }
    });

    this.adminCasesService.getPendingTasks().subscribe({
      next: (tasks) => {
        this.pendingTasks = tasks.slice(0, 5);
      },
      error: () => {
        this.pendingTasks = [];
      }
    });

    this.adminCasesService.getDashboardReport().subscribe({
      next: (report) => {
        this.report = report;
      },
      error: () => {
        this.report = this.getDefaultReport();
      }
    });
  }

  private getDefaultStats(): DashboardStats {
    return {
      totalCases: 0,
      pendingCases: 0,
      casesInProgress: 0,
      completedToday: 0,
      overdueCases: 0,
      avgResolutionTime: '0h'
    };
  }

  get statusDistribution(): DashboardDistributionItem[] {
    return this.report?.byStatus ?? [];
  }

  get procedureDistribution(): DashboardDistributionItem[] {
    return (this.report?.byProcedureType ?? []).slice(0, 5);
  }

  get unitDistribution(): DashboardDistributionItem[] {
    return (this.report?.byAssignedUnit ?? []).slice(0, 5);
  }

  get dailyTrend(): DashboardDailyTrendPoint[] {
    return (this.report?.dailyTrend ?? []).slice(-7);
  }

  private getDefaultReport(): DashboardReport {
    return {
      summary: {
        totalCases: 0,
        pendingCases: 0,
        inProgressCases: 0,
        resolvedCases: 0,
        overdueCases: 0,
        slaComplianceRate: 0,
        averageResolutionHours: 0
      },
      byStatus: [],
      byProcedureType: [],
      byAssignedUnit: [],
      dailyTrend: []
    };
  }
}
