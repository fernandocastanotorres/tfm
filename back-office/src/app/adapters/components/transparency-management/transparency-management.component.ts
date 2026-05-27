import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import { TransparencyManagementService, TransparencyReport, CreateReportRequest } from '../../../application/services/transparency-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
    selector: 'bo-transparency-management',
    templateUrl: './transparency-management.component.html',
    styleUrls: ['./transparency-management.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule, A11yModule]
})
export class TransparencyManagementComponent implements OnInit {
  private readonly service = inject(TransparencyManagementService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  reports: TransparencyReport[] = [];
  isLoading = true;
  isSaving = false;
  isUploading = false;

  selectedReport: TransparencyReport | null = null;
  showForm = false;
  formMode: 'create' | 'edit' = 'create';

  formTitle = '';
  formYear = new Date().getFullYear();
  formDescription = '';
  formSortOrder = 0;
  formPublished = true;
  formFile: File | null = null;
  formError = '';
  private lastFocusedElement: HTMLElement | null = null;

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.service.listReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  openCreateForm(): void {
    this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.formMode = 'create';
    this.selectedReport = null;
    this.formTitle = '';
    this.formYear = new Date().getFullYear();
    this.formDescription = '';
    this.formSortOrder = 0;
    this.formPublished = true;
    this.formFile = null;
    this.formError = '';
    this.showForm = true;
  }

  openEditForm(report: TransparencyReport): void {
    this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.formMode = 'edit';
    this.selectedReport = report;
    this.formTitle = report.title;
    this.formYear = report.year;
    this.formDescription = report.description || '';
    this.formSortOrder = report.sortOrder;
    this.formPublished = report.published;
    this.formFile = null;
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedReport = null;
    this.formFile = null;
    this.formError = '';
    this.restoreFocus();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.formError = 'Solo se permiten archivos PDF.';
        input.value = '';
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        this.formError = 'El archivo no puede superar 50MB.';
        input.value = '';
        return;
      }
      this.formFile = file;
      this.formError = '';
    }
  }

  async saveReport(): Promise<void> {
    if (!this.formTitle.trim()) {
      this.formError = 'El título es obligatorio.';
      return;
    }
    if (this.formMode === 'create' && !this.formFile) {
      this.formError = 'Debes seleccionar un archivo PDF.';
      return;
    }

    this.formError = '';
    this.isSaving = true;

    try {
      if (this.formMode === 'create' && this.formFile) {
        const request: CreateReportRequest = {
          file: this.formFile,
          title: this.formTitle.trim(),
          year: this.formYear,
          description: this.formDescription.trim() || undefined,
          sortOrder: this.formSortOrder,
          published: this.formPublished
        };
        await this.service.createReport(request).toPromise();
      } else if (this.selectedReport) {
        await this.service.updateReport(this.selectedReport.id, {
          title: this.formTitle.trim(),
          year: this.formYear,
          description: this.formDescription.trim() || undefined,
          sortOrder: this.formSortOrder,
          published: this.formPublished
        }).toPromise();

        if (this.formFile) {
          await this.service.replaceFile(this.selectedReport.id, this.formFile).toPromise();
        }
      }
      this.closeForm();
      this.loadReports();
    } catch (err: any) {
      this.formError = err?.error?.message || 'Error al guardar el informe.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteReport(report: TransparencyReport): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      'Eliminar informe',
      `¿Estás seguro de que deseas eliminar "${report.title}"? Esta acción no se puede deshacer.`,
      'Eliminar'
    );
    if (!confirmed) return;

    this.service.deleteReport(report.id).subscribe({
      next: () => {
        if (this.selectedReport?.id === report.id) this.closeForm();
        this.loadReports();
      }
    });
  }

  downloadReport(report: TransparencyReport): void {
    this.service.downloadReport(report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.fileName || 'informe.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private restoreFocus(): void {
    if (!this.lastFocusedElement) {
      return;
    }
    const target = this.lastFocusedElement;
    this.lastFocusedElement = null;
    setTimeout(() => target.focus(), 0);
  }
}
