import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DocumentsApiService, UploadMetadata } from '../../../application/services/documents-api.service';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { DocumentItem } from '../../../application/models/document.models';
import { CaseItem } from '../../../application/models/case.models';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: []
})
export class DocumentsComponent implements OnInit, OnDestroy {
  documents: DocumentItem[] = [];
  cases: CaseItem[] = [];
  selectedCaseId: string | null = null;
  selectedDocument: DocumentItem | null = null;
  filter: 'all' | 'pending' | 'validated' = 'all';
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };

  // Upload state
  isUploading = false;
  uploadProgress = 0;
  uploadError: string | null = null;

  // Loading state
  isLoading = true;
  error: string | null = null;

  private subscriptions = new Subscription();

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    sort: ['updated'],
    pageSize: [10]
  });

  constructor(
    private readonly documentsApiService: DocumentsApiService,
    private readonly casesApiService: CasesApiService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    // Load user's cases first
    this.subscriptions.add(
      this.casesApiService.list(0, 100).subscribe({
        next: (response) => {
          this.cases = response.items ?? [];
          // Determine which case to show
          const routeCaseId = this.route.snapshot.paramMap.get('caseId');
          if (routeCaseId) {
            this.selectedCaseId = routeCaseId;
          } else if (this.cases.length > 0) {
            this.selectedCaseId = this.cases[0].id;
          }
          if (this.selectedCaseId) {
            this.loadDocuments(this.selectedCaseId);
          } else {
            this.isLoading = false;
          }
        },
        error: () => {
          this.error = 'Failed to load cases';
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadDocuments(caseId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.documentsApiService.listByCase(caseId).subscribe({
        next: (docs) => {
          this.documents = docs;
          this.selectedDocument = this.documents[0] ?? null;
          this.isLoading = false;
          this.updatePaginationState();
        },
        error: () => {
          this.error = 'Failed to load documents';
          this.documents = [];
          this.isLoading = false;
        }
      })
    );
  }

  onCaseChange(caseId: string): void {
    this.selectedCaseId = caseId;
    this.selectedDocument = null;
    this.loadDocuments(caseId);
  }

  get filteredDocuments(): DocumentItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const type = this.filterForm.value.type ?? 'all';
    const sort = this.filterForm.value.sort ?? 'updated';

    let items = this.documents.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.name.toLowerCase().includes(search) ||
        doc.caseId.toLowerCase().includes(search) ||
        doc.type.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || doc.status === status;
      const matchesType = type === 'all' || doc.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });

    items = items.sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sort === 'status') {
        return a.status.localeCompare(b.status);
      }
      return b.uploadedAt.localeCompare(a.uploadedAt);
    });

    return items;
  }

  get pagedDocuments(): DocumentItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredDocuments.slice(start, start + this.paginationState.pageSize);
  }

  get typeOptions(): string[] {
    return Array.from(new Set(this.documents.map((doc) => doc.type)));
  }

  selectDocument(document: DocumentItem): void {
    this.selectedDocument = document;
  }

  setFilter(filter: 'all' | 'pending' | 'validated'): void {
    this.filter = filter;
    this.filterForm.patchValue({ status: filter });
    this.paginationState = updatePageSize(this.filterForm, this.paginationState.pageSize, this.paginationState);
    this.updatePaginationState();
  }

  changePage(page: number): void {
    this.paginationState = changePage(page, this.paginationState);
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.updatePaginationState();
  }

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredDocuments.length, this.filterForm);
  }

  // Upload handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedCaseId) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;

    const metadata: UploadMetadata = {
      description: this.filterForm.value.search ?? undefined
    };

    this.subscriptions.add(
      this.documentsApiService.upload(this.selectedCaseId, file, metadata).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((event.loaded / event.total) * 100);
          }
        },
        complete: () => {
          this.isUploading = false;
          this.uploadProgress = 0;
          // Reload documents to show the new one
          if (this.selectedCaseId) {
            this.loadDocuments(this.selectedCaseId);
          }
          // Reset file input
          if (input) {
            input.value = '';
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadProgress = 0;
          this.uploadError = err?.error?.message ?? 'Upload failed';
        }
      })
    );
  }

  // Delete handling
  async deleteDocument(docId: string): Promise<void> {
    if (!docId) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Eliminar documento',
      'Esta accion eliminara el documento de forma permanente.',
      'Si, eliminar'
    );
    if (!confirmed) {
      return;
    }

    this.subscriptions.add(
      this.documentsApiService.delete(docId).subscribe({
        next: () => {
          // Remove from local list
          this.documents = this.documents.filter((d) => d.id !== docId);
          if (this.selectedDocument?.id === docId) {
            this.selectedDocument = this.documents[0] ?? null;
          }
          this.updatePaginationState();
        },
        error: () => {
          this.error = 'Failed to delete document';
        }
      })
    );
  }

  // Download handling
  downloadDocument(docId: string, fileName: string): void {
    this.subscriptions.add(
      this.documentsApiService.download(docId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.error = 'Failed to download document';
        }
      })
    );
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
