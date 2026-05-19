import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { DocumentsComponent } from './documents.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { DocumentsApiService, UploadMetadata } from '../../../application/services/documents-api.service';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { DocumentItem } from '../../../application/models/document.models';
import { CaseItem, PagedResponse } from '../../../application/models/case.models';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  let documentsSpy: jasmine.SpyObj<DocumentsApiService>;
  let casesSpy: jasmine.SpyObj<CasesApiService>;
  let confirmSpy: jasmine.SpyObj<ConfirmDialogService>;

  const mockCases: CaseItem[] = [
    { id: 'case-1', title: 'Test Case', status: 'PENDING', procedureType: 'License', createdAt: '2024-01-01', lastUpdated: '2024-01-01', description: '', assignedUnit: '' },
    { id: 'case-2', title: 'Another Case', status: 'COMPLETED', procedureType: 'Permit', createdAt: '2024-02-01', lastUpdated: '2024-02-01', description: '', assignedUnit: '' }
  ];

  const mockDocs: DocumentItem[] = [
    { id: 'doc-1', name: 'test.pdf', caseId: 'case-1', type: 'application', status: 'pending', uploadedAt: '2024-01-15T10:00:00Z', size: 1024 },
    { id: 'doc-2', name: 'report.docx', caseId: 'case-1', type: 'document', status: 'validated', uploadedAt: '2024-01-16T10:00:00Z', size: 2048 },
    { id: 'doc-3', name: 'image.png', caseId: 'case-1', type: 'application', status: 'pending', uploadedAt: '2024-01-17T10:00:00Z', size: 512 }
  ];

  function setupComponent(routeCaseId: string | null = null): void {
    documentsSpy = jasmine.createSpyObj('DocumentsApiService', ['listByCase', 'upload', 'download', 'delete']);
    casesSpy = jasmine.createSpyObj('CasesApiService', ['list']);
    confirmSpy = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

    const mockCasesResponse: PagedResponse<CaseItem> = {
      items: mockCases,
      page: 0,
      size: 100,
      totalItems: mockCases.length,
      totalPages: 1
    };

    casesSpy.list.and.returnValue(of(mockCasesResponse));
    documentsSpy.listByCase.and.returnValue(of(mockDocs));

    TestBed.configureTestingModule({
      declarations: [DocumentsComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: DocumentsApiService, useValue: documentsSpy },
        { provide: CasesApiService, useValue: casesSpy },
        { provide: ConfirmDialogService, useValue: confirmSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => routeCaseId } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => { TestBed.resetTestingModule(); });

  // ==================== INITIALIZATION ====================

  describe('Initialization', () => {
    it('should create component', () => {
      setupComponent();
      expect(component).toBeTruthy();
    });

    it('should load cases on init and select first case', () => {
      setupComponent();
      expect(casesSpy.list).toHaveBeenCalledWith(0, 100);
      expect(component.selectedCaseId).toBe('case-1');
      expect(component.cases.length).toBe(2);
    });

    it('should load documents for selected case after cases load', () => {
      setupComponent();
      expect(documentsSpy.listByCase).toHaveBeenCalledWith('case-1');
      expect(component.documents.length).toBe(3);
      expect(component.isLoading).toBeFalse();
    });

    it('should use route caseId when provided', () => {
      setupComponent('case-2');
      expect(component.selectedCaseId).toBe('case-2');
      expect(documentsSpy.listByCase).toHaveBeenCalledWith('case-2');
    });

    it('should handle case loading error', () => {
      documentsSpy = jasmine.createSpyObj('DocumentsApiService', ['listByCase', 'upload', 'download', 'delete']);
      casesSpy = jasmine.createSpyObj('CasesApiService', ['list']);
      confirmSpy = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

      // Set error BEFORE component initializes
      casesSpy.list.and.returnValue(throwError(() => new Error('Network error')));

      TestBed.configureTestingModule({
        declarations: [DocumentsComponent],
        imports: [HttpClientTestingModule, TranslateModule.forRoot(), ReactiveFormsModule],
        providers: [
          { provide: DocumentsApiService, useValue: documentsSpy },
          { provide: CasesApiService, useValue: casesSpy },
          { provide: ConfirmDialogService, useValue: confirmSpy },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      });

      fixture = TestBed.createComponent(DocumentsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.error).toBe('Failed to load cases');
      expect(component.isLoading).toBeFalse();
      expect(component.selectedCaseId).toBeNull();
    });
  });

  // ==================== CASE CHANGE ====================

  describe('Case Change', () => {
    it('onCaseChange should update selectedCaseId and reload documents', () => {
      setupComponent();
      documentsSpy.listByCase.calls.reset();

      component.onCaseChange('case-2');

      expect(component.selectedCaseId).toBe('case-2');
      expect(documentsSpy.listByCase).toHaveBeenCalledWith('case-2');
    });

    it('onCaseChange should clear selectedDocument before reloading', () => {
      setupComponent();
      // Make listByCase return empty so we can observe the null state
      documentsSpy.listByCase.and.returnValue(of([]));

      component.onCaseChange('case-2');

      // selectedDocument is set to null by onCaseChange, then loadDocuments
      // sets it to first doc (or null if empty). With empty result, it stays null.
      expect(component.selectedDocument).toBeNull();
    });
  });

  // ==================== FILTERING & SORTING ====================

  describe('Filtering & Sorting', () => {
    it('filteredDocuments should filter by search term (name)', () => {
      setupComponent();
      component.filterForm.patchValue({ search: 'test' });
      const filtered = component.filteredDocuments;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('test.pdf');
    });

    it('filteredDocuments should filter by status', () => {
      setupComponent();
      component.filterForm.patchValue({ status: 'validated' });
      const filtered = component.filteredDocuments;
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('validated');
    });

    it('filteredDocuments should filter by type', () => {
      setupComponent();
      component.filterForm.patchValue({ type: 'document' });
      const filtered = component.filteredDocuments;
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('document');
    });

    it('filteredDocuments should sort by name', () => {
      setupComponent();
      component.filterForm.patchValue({ sort: 'name' });
      const filtered = component.filteredDocuments;
      expect(filtered[0].name).toBe('image.png');
      expect(filtered[1].name).toBe('report.docx');
      expect(filtered[2].name).toBe('test.pdf');
    });

    it('filteredDocuments should sort by status', () => {
      setupComponent();
      component.filterForm.patchValue({ sort: 'status' });
      const filtered = component.filteredDocuments;
      expect(filtered[0].status).toBe('pending');
      expect(filtered[filtered.length - 1].status).toBe('validated');
    });

    it('filteredDocuments should sort by updated date (default)', () => {
      setupComponent();
      component.filterForm.patchValue({ sort: 'updated' });
      const filtered = component.filteredDocuments;
      // Most recent first (descending by uploadedAt)
      expect(filtered[0].name).toBe('image.png'); // 2024-01-17
      expect(filtered[1].name).toBe('report.docx'); // 2024-01-16
      expect(filtered[2].name).toBe('test.pdf'); // 2024-01-15
    });

    it('typeOptions should return unique document types', () => {
      setupComponent();
      const types = component.typeOptions;
      expect(types).toContain('application');
      expect(types).toContain('document');
      expect(types.length).toBe(2); // 'application' appears twice in docs but should be unique
    });
  });

  // ==================== PAGINATION ====================

  describe('Pagination', () => {
    it('pagedDocuments should return first page slice', () => {
      setupComponent();
      component.paginationState = { currentPage: 1, totalPages: 1, pageSize: 2 };
      const paged = component.pagedDocuments;
      expect(paged.length).toBe(2);
      expect(paged[0].name).toBe('image.png');
      expect(paged[1].name).toBe('report.docx');
    });

    it('changePage should update paginationState', () => {
      setupComponent();
      component.paginationState = { currentPage: 1, totalPages: 3, pageSize: 1 };
      component.changePage(2);
      expect(component.paginationState.currentPage).toBe(2);
    });

    it('updatePageSize should update paginationState', () => {
      setupComponent();
      component.updatePageSize(20);
      expect(component.paginationState.pageSize).toBe(20);
      expect(component.paginationState.currentPage).toBe(1); // resets to first page
    });
  });

  // ==================== DOCUMENT SELECTION ====================

  describe('Document Selection', () => {
    it('selectDocument should set selectedDocument', () => {
      setupComponent();
      const doc = { id: 'doc-99', name: 'custom.pdf', caseId: 'case-1', type: 'pdf', status: 'pending', uploadedAt: '2024-01-20T10:00:00Z', size: 999 };
      component.selectDocument(doc);
      expect(component.selectedDocument).toBe(doc);
    });
  });

  // ==================== UPLOAD ====================

  describe('Upload', () => {
    it('onFileSelected should upload file when case is selected', () => {
      setupComponent();
      const uploadSubject = new Subject<any>();
      documentsSpy.upload.and.returnValue(uploadSubject.asObservable());

      const file = new File(['content'], 'upload.pdf', { type: 'application/pdf' });
      const input = { files: [file], value: '' } as unknown as HTMLInputElement;
      const event = { target: input } as unknown as Event;

      component.onFileSelected(event);

      expect(documentsSpy.upload).toHaveBeenCalledWith('case-1', file, jasmine.any(Object));
      expect(component.isUploading).toBeTrue();
      expect(component.uploadProgress).toBe(0);
    });

    it('onFileSelected should do nothing when no case selected', () => {
      setupComponent();
      component.selectedCaseId = null;

      const file = new File(['content'], 'upload.pdf', { type: 'application/pdf' });
      const input = { files: [file], value: '' } as unknown as HTMLInputElement;
      const event = { target: input } as unknown as Event;

      component.onFileSelected(event);

      expect(documentsSpy.upload).not.toHaveBeenCalled();
      expect(component.isUploading).toBeFalse();
    });

    it('onFileSelected should handle upload completion and reload documents', fakeAsync(() => {
      setupComponent();
      const uploadSubject = new Subject<any>();
      documentsSpy.upload.and.returnValue(uploadSubject.asObservable());
      documentsSpy.listByCase.calls.reset();

      const file = new File(['content'], 'upload.pdf', { type: 'application/pdf' });
      const input = { files: [file], value: 'some-value' } as unknown as HTMLInputElement;
      const event = { target: input } as unknown as Event;

      component.onFileSelected(event);

      // Emit progress event
      uploadSubject.next({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
      tick();
      expect(component.uploadProgress).toBe(50);

      // Emit response event (completes the upload)
      uploadSubject.next({ type: HttpEventType.Response, body: { document: mockDocs[0] } });
      uploadSubject.complete();
      tick();

      expect(component.isUploading).toBeFalse();
      expect(component.uploadProgress).toBe(0);
      expect(documentsSpy.listByCase).toHaveBeenCalledWith('case-1');
      expect(input.value).toBe('');
      flush();
    }));

    it('onFileSelected should handle upload error', fakeAsync(() => {
      setupComponent();
      const uploadSubject = new Subject<any>();
      documentsSpy.upload.and.returnValue(uploadSubject.asObservable());

      const file = new File(['content'], 'upload.pdf', { type: 'application/pdf' });
      const input = { files: [file], value: '' } as unknown as HTMLInputElement;
      const event = { target: input } as unknown as Event;

      component.onFileSelected(event);

      uploadSubject.error({ error: { message: 'File too large' } });
      tick();

      expect(component.isUploading).toBeFalse();
      expect(component.uploadProgress).toBe(0);
      expect(component.uploadError).toBe('File too large');
      flush();
    }));
  });

  // ==================== DELETE ====================

  describe('Delete', () => {
    it('deleteDocument should show confirmation dialog', fakeAsync(() => {
      setupComponent();
      confirmSpy.confirm.and.resolveTo(false);
      documentsSpy.delete.and.returnValue(of(undefined));

      component.deleteDocument('doc-1');
      tick();

      expect(confirmSpy.confirm).toHaveBeenCalledWith(
        'Eliminar documento',
        'Esta accion eliminara el documento de forma permanente.',
        'Si, eliminar'
      );
      flush();
    }));

    it('deleteDocument should NOT delete when user cancels', fakeAsync(() => {
      setupComponent();
      confirmSpy.confirm.and.resolveTo(false);

      component.deleteDocument('doc-1');
      tick();

      expect(documentsSpy.delete).not.toHaveBeenCalled();
      flush();
    }));

    it('deleteDocument should delete and update list on confirm', fakeAsync(() => {
      setupComponent();
      confirmSpy.confirm.and.resolveTo(true);
      documentsSpy.delete.and.returnValue(of(undefined));

      component.deleteDocument('doc-1');
      tick();

      expect(documentsSpy.delete).toHaveBeenCalledWith('doc-1');
      expect(component.documents.length).toBe(2);
      expect(component.documents.find(d => d.id === 'doc-1')).toBeUndefined();
      flush();
    }));

    it('deleteDocument should do nothing when docId is empty', fakeAsync(() => {
      setupComponent();

      component.deleteDocument('');
      tick();

      expect(confirmSpy.confirm).not.toHaveBeenCalled();
      expect(documentsSpy.delete).not.toHaveBeenCalled();
      flush();
    }));
  });

  // ==================== DOWNLOAD ====================

  describe('Download', () => {
    it('downloadDocument should call download API with correct id', () => {
      setupComponent();
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      documentsSpy.download.and.returnValue(of(mockBlob));

      // Spy on window.URL.createObjectURL to avoid side effects
      const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test-url');
      const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');

      component.downloadDocument('doc-1', 'test.pdf');

      expect(documentsSpy.download).toHaveBeenCalledWith('doc-1');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('downloadDocument should handle download error', () => {
      setupComponent();
      documentsSpy.download.and.returnValue(throwError(() => new Error('Download failed')));

      component.downloadDocument('doc-1', 'test.pdf');

      expect(component.error).toBe('Failed to download document');
    });
  });

  // ==================== UTILITY METHODS ====================

  describe('Utility Methods', () => {
    it('formatFileSize should return "0 B" for 0 bytes', () => {
      setupComponent();
      expect(component.formatFileSize(0)).toBe('0 B');
    });

    it('formatFileSize should format bytes to KB', () => {
      setupComponent();
      expect(component.formatFileSize(1024)).toBe('1 KB');
    });

    it('formatFileSize should format bytes to MB', () => {
      setupComponent();
      expect(component.formatFileSize(1048576)).toBe('1 MB');
    });

    it('formatFileSize should format bytes to GB', () => {
      setupComponent();
      expect(component.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('formatDate should format date string to locale string', () => {
      setupComponent();
      const result = component.formatDate('2024-01-15T10:00:00Z');
      // es-ES locale with day:2-digit, month:2-digit, year:numeric
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
