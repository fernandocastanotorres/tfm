import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DocumentsService, DocumentItem } from '../../../application/services/documents.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: []
})
export class DocumentsComponent implements OnInit {
  documents: DocumentItem[] = [];
  filter: 'all' | 'pending' | 'validated' = 'all';
  selectedDocument: DocumentItem | null = null;
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    caseId: ['all'],
    sort: ['updated'],
    pageSize: [10]
  });

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.documents = this.documentsService.getDocuments();
    this.selectedDocument = this.documents[0] ?? null;
    this.updatePaginationState();
  }

  get filteredDocuments(): DocumentItem[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const type = this.filterForm.value.type ?? 'all';
    const caseId = this.filterForm.value.caseId ?? 'all';
    const sort = this.filterForm.value.sort ?? 'updated';

    let items = this.documents.filter((doc) => {
      const matchesSearch =
        doc.nameKey.toLowerCase().includes(search) ||
        doc.caseId.toLowerCase().includes(search) ||
        doc.caseTitleKey.toLowerCase().includes(search) ||
        doc.unitKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || doc.statusKey === status;
      const matchesType = type === 'all' || doc.typeKey === type;
      const matchesCase = caseId === 'all' || doc.caseId === caseId;
      return matchesSearch && matchesStatus && matchesType && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'name') {
        return a.nameKey.localeCompare(b.nameKey);
      }
      if (sort === 'status') {
        return a.statusKey.localeCompare(b.statusKey);
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return items;
  }

  get pagedDocuments(): DocumentItem[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredDocuments.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; labelKey: string }[] {
    const uniqueCases = new Map<string, string>();
    this.documents.forEach((doc) => {
      if (!uniqueCases.has(doc.caseId)) {
        uniqueCases.set(doc.caseId, doc.caseTitleKey);
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, labelKey]) => ({ id, labelKey }));
  }

  get typeOptions(): string[] {
    return Array.from(new Set(this.documents.map((doc) => doc.typeKey)));
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
}
