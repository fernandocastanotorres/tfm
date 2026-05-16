import { Component, inject, OnInit } from '@angular/core';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { DashboardStats, PendingTask, CaseItem } from '../../../application/models/backoffice.models';

@Component({
  selector: 'bo-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);

  stats: DashboardStats | null = null;
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
}
