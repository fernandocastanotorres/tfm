import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DashboardService, CaseItem, NotificationItem, QuickAccessItem } from '../../../application/services/dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';

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
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    pageSize: [10]
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
    this.updatePaginationState();
  }

  get summaryStats(): { labelKey: string; value: number }[] {
    return [
      { labelKey: 'DASHBOARD.STAT_TOTAL', value: this.cases.length },
      { labelKey: 'CASE_STATUS.REVIEW', value: this.cases.filter((item) => item.statusKey === 'CASE_STATUS.REVIEW').length },
      { labelKey: 'CASE_STATUS.PENDING', value: this.cases.filter((item) => item.statusKey === 'CASE_STATUS.PENDING').length },
      { labelKey: 'CASE_STATUS.APPROVED', value: this.cases.filter((item) => item.statusKey === 'CASE_STATUS.APPROVED').length }
    ];
  }

  get filteredCases(): CaseItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';

    return this.cases.filter((caseItem) => {
      const matchesSearch =
        caseItem.titleKey.toLowerCase().includes(search) ||
        caseItem.id.toLowerCase().includes(search) ||
        caseItem.categoryKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || caseItem.statusKey === status;
      return matchesSearch && matchesStatus;
    });
  }

  get pagedCases(): CaseItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredCases.slice(start, start + this.paginationState.pageSize);
  }

  selectCase(caseItem: CaseItem): void {
    this.selectedCase = caseItem;
  }

  clearFilters(): void {
    this.filterForm.setValue({ search: '', status: 'all', pageSize: 10 });
    this.paginationState = updatePageSize(this.filterForm, this.paginationState.pageSize, this.paginationState);
    this.updatePaginationState();
  }

  statusClass(statusKey: CaseItem['statusKey']): string {
    switch (statusKey) {
      case 'CASE_STATUS.APPROVED':
        return 'bg-green-100 text-green-700';
      case 'CASE_STATUS.PENDING':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  changePage(page: number): void {
    this.paginationState = changePage(page, this.paginationState);
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.updatePaginationState();
  }

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredCases.length, this.filterForm);
  }
}
