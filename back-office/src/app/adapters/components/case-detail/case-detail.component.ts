import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { CaseDetail } from '../../../application/models/backoffice.models';

@Component({
  selector: 'bo-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.css']
})
export class CaseDetailComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  caseDetail: CaseDetail | null = null;
  isLoading = true;
  activeTab: 'timeline' | 'documents' | 'data' | 'actions' = 'timeline';
  showStatusModal = false;
  newStatus = '';
  tabs: ('timeline' | 'documents' | 'data' | 'actions')[] = ['timeline', 'documents', 'data', 'actions'];

  statusOptions = [
    { value: 'IN_PROGRESS', label: 'En Tramitacion' },
    { value: 'PENDING_AMENDMENT', label: 'Pendiente Subsanacion' },
    { value: 'RESOLVED', label: 'Resuelto' },
    { value: 'REJECTED', label: 'Rechazado' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCase(id);
    }
  }

  loadCase(id: string): void {
    this.isLoading = true;
    this.adminCasesService.getDetail(id).subscribe({
      next: (detail) => {
        this.caseDetail = detail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openStatusModal(): void {
    this.newStatus = this.caseDetail?.status || '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  updateStatus(): void {
    if (!this.caseDetail || !this.newStatus) return;

    this.adminCasesService.updateStatus(this.caseDetail.id, this.newStatus).subscribe({
      next: () => {
        this.loadCase(this.caseDetail!.id);
        this.showStatusModal = false;
      },
      error: () => {
        // Error handled by interceptor
      }
    });
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

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      timeline: 'Historial',
      documents: 'Documentos',
      data: 'Datos',
      actions: 'Acciones'
    };
    return labels[tab] || tab;
  }
}
