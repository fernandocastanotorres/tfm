import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService, QuickAccessItem } from '../../../application/services/dashboard.service';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { CaseItem } from '../../../application/models/case.models';
import { DashboardNotificationItem } from '../../../application/models/notification.models';
import { ToastService } from '../../../application/services/toast.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';

import { trackByIndex } from '../../../application/utils/track-by.utils';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, DatePipe } from '@angular/common';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [NgFor, FormsModule, ReactiveFormsModule, NgIf, LoadingSkeletonComponent, NgClass, RouterLink, NgSwitch, NgSwitchCase, NgSwitchDefault, DatePipe, TranslatePipe]
})
export class DashboardComponent implements OnInit {
  cases: CaseItem[] = [];
  notifications: DashboardNotificationItem[] = [];
  quickAccess: QuickAccessItem[] = [];
  selectedCase: CaseItem | null = null;
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };
  isLoading = true;

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    pageSize: [10]
  });

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly casesApiService: CasesApiService,
    private readonly fb: FormBuilder,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getNotifications().subscribe({
      next: (items) => {
        this.notifications = items;
      },
      error: (err) => {
        this.notifications = [];
        this.toast.error('Error al cargar', err?.error?.message ?? 'No se pudieron cargar las notificaciones.');
      }
    });

    this.quickAccess = this.dashboardService.getQuickAccess();

    // Load cases from backend API
    this.loadCases();
  }

  private loadCases(): void {
    this.isLoading = true;

    const page = this.paginationState.currentPage - 1; // API is 0-indexed
    const size = this.paginationState.pageSize;

    this.casesApiService.list(page, size).subscribe({
      next: (response) => {
        this.cases = response.items;
        this.paginationState.totalPages = response.totalPages;
        this.isLoading = false;

        if (this.cases.length > 0 && !this.selectedCase) {
          this.selectedCase = this.cases[0];
        }
      },
      error: (err) => {
        this.toast.error('Error al cargar', err?.error?.message ?? 'No se han podido cargar los expedientes.');
        this.isLoading = false;
      }
    });
  }

  get summaryStats(): { labelKey: string; value: number }[] {
    return [
      { labelKey: 'DASHBOARD.STAT_TOTAL', value: this.cases.length },
      { labelKey: 'CASE_STATUS.REVIEW', value: this.cases.filter((item) => this.toCaseStatusKey(item.status) === 'REVIEW' || this.toCaseStatusKey(item.status) === 'UNDER_REVIEW' || this.toCaseStatusKey(item.status) === 'IN_REVIEW').length },
      { labelKey: 'CASE_STATUS.PENDING', value: this.cases.filter((item) => this.toCaseStatusKey(item.status) === 'PENDING').length },
      { labelKey: 'CASE_STATUS.APPROVED', value: this.cases.filter((item) => this.toCaseStatusKey(item.status) === 'APPROVED' || this.toCaseStatusKey(item.status) === 'COMPLETED').length }
    ];
  }

  get filteredCases(): CaseItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';

    return this.cases.filter((caseItem) => {
      const matchesSearch =
        caseItem.title.toLowerCase().includes(search) ||
        caseItem.id.toLowerCase().includes(search) ||
        caseItem.procedureType.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || this.toCaseStatusKey(caseItem.status) === this.toCaseStatusKey(status);
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
    this.paginationState.currentPage = 1;
    this.loadCases();
  }

  statusClass(status: string): string {
    switch (this.toCaseStatusKey(status)) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
      case 'WAITING':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  toCaseStatusKey(status: string): string {
    return (status ?? '').trim().replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.paginationState.totalPages) {
      return;
    }
    this.paginationState = changePage(page, this.paginationState);
    this.loadCases();
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.paginationState.currentPage = 1;
    this.loadCases();
  }
}
