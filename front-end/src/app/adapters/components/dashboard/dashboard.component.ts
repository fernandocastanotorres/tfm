import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DashboardService, CaseItem, NotificationItem, QuickAccessItem } from '../../../application/services/dashboard.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit {
  cases: CaseItem[] = [];
  notifications: NotificationItem[] = [];
  quickAccess: QuickAccessItem[] = [];
  selectedCase: CaseItem | null = null;

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all']
  });

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cases = this.dashboardService.getCases();
    this.notifications = this.dashboardService.getNotifications();
    this.quickAccess = this.dashboardService.getQuickAccess();
    this.selectedCase = this.cases[0] ?? null;
  }

  get summaryStats(): { labelKey: string; value: number }[] {
    return [
      { labelKey: 'DASHBOARD.STAT_TOTAL', value: this.cases.length },
      { labelKey: 'DASHBOARD.STAT_REVIEW', value: this.cases.filter((item) => item.status === 'En revisión').length },
      { labelKey: 'DASHBOARD.STAT_PENDING', value: this.cases.filter((item) => item.status === 'Pendiente').length },
      { labelKey: 'DASHBOARD.STAT_APPROVED', value: this.cases.filter((item) => item.status === 'Aprobado').length }
    ];
  }

  get filteredCases(): CaseItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';

    return this.cases.filter((caseItem) => {
      const matchesSearch =
        caseItem.title.toLowerCase().includes(search) ||
        caseItem.id.toLowerCase().includes(search) ||
        caseItem.category.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || caseItem.status === status;
      return matchesSearch && matchesStatus;
    });
  }

  selectCase(caseItem: CaseItem): void {
    this.selectedCase = caseItem;
  }

  clearFilters(): void {
    this.filterForm.setValue({ search: '', status: 'all' });
  }

  statusClass(status: CaseItem['status']): string {
    switch (status) {
      case 'Aprobado':
        return 'bg-green-100 text-green-700';
      case 'Pendiente':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }
}
