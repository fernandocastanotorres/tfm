import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { CaseItem, PagedResponse } from '../../../application/models/backoffice.models';

@Component({
    selector: 'bo-case-list',
    templateUrl: './case-list.component.html',
    styleUrls: ['./case-list.component.css'],
    standalone: false
})
export class CaseListComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);
  private readonly router = inject(Router);

  Math = Math;

  cases: CaseItem[] = [];
  isLoading = true;
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  statusFilter = '';
  searchTerm = '';

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'SUBMITTED', label: 'Presentado' },
    { value: 'IN_PROGRESS', label: 'En Tramitacion' },
    { value: 'PENDING_AMENDMENT', label: 'Pendiente Subsanacion' },
    { value: 'RESOLVED', label: 'Resuelto' },
    { value: 'REJECTED', label: 'Rechazado' }
  ];

  get filteredCases(): CaseItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.cases;
    return this.cases.filter(caseItem =>
      caseItem.title.toLowerCase().includes(term) ||
      caseItem.citizenName.toLowerCase().includes(term) ||
      caseItem.procedureType.toLowerCase().includes(term) ||
      caseItem.id.toLowerCase().includes(term)
    );
  }

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.isLoading = true;
    this.adminCasesService.list(this.currentPage, this.pageSize, undefined, this.statusFilter || undefined).subscribe({
      next: (response: PagedResponse<CaseItem>) => {
        this.cases = response.items;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.cases = [];
        this.isLoading = false;
      }
    });
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 0;
    this.loadCases();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCases();
  }

  viewCase(id: string): void {
    this.router.navigate(['/cases', id]);
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option?.label || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      PENDING_AMENDMENT: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
