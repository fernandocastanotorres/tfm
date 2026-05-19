import { ComponentFixture, TestBed, fakeAsync, tick, flush, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { CaseDetailComponent } from './case-detail.component';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

describe('CaseDetailComponent', () => {
  let component: CaseDetailComponent;
  let fixture: ComponentFixture<CaseDetailComponent>;
  let casesApiService: jasmine.SpyObj<CasesApiService>;
  let confirmDialogService: jasmine.SpyObj<ConfirmDialogService>;
  let router: Router;

  const mockCaseDetail = {
    id: 'case-1',
    title: 'Test Case',
    status: 'PENDING',
    procedureType: 'License Application',
    procedureTypeId: 'license-application',
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-15T10:00:00Z',
    formData: { name: 'John', email: 'john@test.com' },
    description: 'Test description',
    currentTask: 'Review',
    assignedUnit: 'Unit A',
    timeline: [],
    attachments: [
      { id: 'doc-1', name: 'document.pdf', type: 'application/pdf', size: 1024, uploadedAt: '2024-01-10' }
    ]
  };

  function setupComponent(id: string | null = 'case-1'): void {
    casesApiService = jasmine.createSpyObj('CasesApiService', [
      'getDetail',
      'uploadDocument',
      'downloadDocument',
      'downloadReceipt',
      'amend'
    ]);
    confirmDialogService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

    TestBed.configureTestingModule({
      declarations: [CaseDetailComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: CasesApiService, useValue: casesApiService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => id
              }
            }
          }
        }
      ]
    });

    fixture = TestBed.createComponent(CaseDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  afterEach(() => {
    if (component) {
      component.ngOnDestroy();
    }
    TestBed.resetTestingModule();
  });

  // ==================== INITIALIZATION ====================

  describe('Initialization', () => {
    it('should create the component', fakeAsync(() => {
      setupComponent('test-case-id');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();

      expect(component).toBeTruthy();
    }));

    it('should show error when no caseId in route', () => {
      setupComponent(null);
      fixture.detectChanges();

      expect(component.error).toBe('CASE_DETAIL.ERROR_NO_ID');
      expect(component.isLoading).toBeFalse();
    });

    it('should load case detail when caseId exists', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();

      expect(casesApiService.getDetail).toHaveBeenCalledWith('case-1');
    }));

    it('should set caseDetail on successful load', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();

      expect(component.caseDetail).toEqual(mockCaseDetail);
    }));

    it('should set error on failed load', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(throwError(() => ({ error: { message: 'Not found' } })));
      fixture.detectChanges();
      discardPeriodicTasks();

      expect(component.error).toBe('Not found');
    }));

    it('should set error to default message when error response has no message', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(throwError(() => ({})));
      fixture.detectChanges();
      discardPeriodicTasks();

      expect(component.error).toBe('CASE_DETAIL.ERROR_LOAD');
    }));

    it('should set isLoading to false after successful load', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();

      expect(component.isLoading).toBeFalse();
    }));
  });

  // ==================== AUTO-REFRESH ====================

  describe('Auto-Refresh', () => {
    it('should set up 30-second interval for auto-refresh', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();

      // Initial call happened
      expect(casesApiService.getDetail).toHaveBeenCalledTimes(1);

      // After 30 seconds, should trigger another load
      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      tick(30000);

      expect(casesApiService.getDetail).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it('should NOT trigger auto-refresh before 30 seconds', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();

      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      tick(15000); // Only 15 seconds

      expect(casesApiService.getDetail).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should refresh on visibility change when tab becomes visible', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();

      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      // Simulate visibility change to visible
      spyOnProperty(document, 'visibilityState', 'get').and.returnValue('visible');
      document.dispatchEvent(new Event('visibilitychange'));
      tick();

      expect(casesApiService.getDetail).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should NOT refresh on visibility change when tab becomes hidden', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();

      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      // Simulate visibility change to hidden
      spyOnProperty(document, 'visibilityState', 'get').and.returnValue('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      tick();

      expect(casesApiService.getDetail).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should clean up subscriptions on destroy', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();

      const removeEventListenerSpy = spyOn(document, 'removeEventListener');

      component.ngOnDestroy();
      discardPeriodicTasks();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', jasmine.any(Function));
    }));
  });

  // ==================== FILE UPLOAD ====================

  describe('File Upload', () => {
    beforeEach(fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('should upload files when caseId exists', fakeAsync(() => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileList = { 0: file, length: 1 } as unknown as FileList;
      casesApiService.uploadDocument.and.returnValue(of(undefined));

      component.onSelectFiles(fileList);
      tick();

      expect(casesApiService.uploadDocument).toHaveBeenCalledWith('case-1', file);
      discardPeriodicTasks();
    }));

    it('should do nothing when no files provided', fakeAsync(() => {
      component.onSelectFiles(null);
      discardPeriodicTasks();

      expect(casesApiService.uploadDocument).not.toHaveBeenCalled();
    }));

    it('should do nothing when no caseId', fakeAsync(() => {
      // Override caseId to null by directly setting the private property
      (component as any).caseId = null;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileList = { 0: file, length: 1 } as unknown as FileList;

      component.onSelectFiles(fileList);
      discardPeriodicTasks();

      expect(casesApiService.uploadDocument).not.toHaveBeenCalled();
    }));

    it('should do nothing when files array is empty', fakeAsync(() => {
      const fileList = { length: 0 } as unknown as FileList;

      component.onSelectFiles(fileList);
      discardPeriodicTasks();

      expect(casesApiService.uploadDocument).not.toHaveBeenCalled();
    }));

    it('should set isUploading to true when uploading', fakeAsync(() => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileList = { 0: file, length: 1 } as unknown as FileList;
      // Use a Subject so upload doesn't complete immediately
      const uploadSubject = new Subject<void>();
      casesApiService.uploadDocument.and.returnValue(uploadSubject.asObservable());

      component.onSelectFiles(fileList);

      // Check isUploading BEFORE the upload completes
      expect(component.isUploading).toBeTrue();

      uploadSubject.next();
      uploadSubject.complete();
      tick();
      discardPeriodicTasks();
    }));

    it('should reload case detail after all uploads complete', fakeAsync(() => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileList = { 0: file, length: 1 } as unknown as FileList;
      casesApiService.uploadDocument.and.returnValue(of(undefined));
      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      component.onSelectFiles(fileList);
      tick();

      expect(component.isUploading).toBeFalse();
      expect(casesApiService.getDetail).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should handle upload error (set error, still reload)', fakeAsync(() => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileList = { 0: file, length: 1 } as unknown as FileList;
      casesApiService.uploadDocument.and.returnValue(throwError(() => new Error('Upload failed')));
      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      component.onSelectFiles(fileList);
      tick();

      expect(component.error).toBe('CASE_DETAIL.ERROR_LOAD');
      expect(component.isUploading).toBeFalse();
      expect(casesApiService.getDetail).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should handle multiple files with pending counter', fakeAsync(() => {
      const file1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' });
      const file2 = new File(['content2'], 'test2.pdf', { type: 'application/pdf' });
      const fileList = { 0: file1, 1: file2, length: 2 } as unknown as FileList;

      const uploadSubject1 = new Subject<void>();
      const uploadSubject2 = new Subject<void>();
      casesApiService.uploadDocument
        .withArgs('case-1', file1)
        .and.returnValue(uploadSubject1.asObservable());
      casesApiService.uploadDocument
        .withArgs('case-1', file2)
        .and.returnValue(uploadSubject2.asObservable());
      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      component.onSelectFiles(fileList);
      tick();

      // Both uploads started, isUploading should be true
      expect(component.isUploading).toBeTrue();
      expect(casesApiService.getDetail).not.toHaveBeenCalled();

      // Complete first upload
      uploadSubject1.next();
      uploadSubject1.complete();
      tick();

      // Still uploading, second file pending
      expect(component.isUploading).toBeTrue();
      expect(casesApiService.getDetail).not.toHaveBeenCalled();

      // Complete second upload
      uploadSubject2.next();
      uploadSubject2.complete();
      tick();

      expect(component.isUploading).toBeFalse();
      expect(casesApiService.getDetail).toHaveBeenCalled();
      discardPeriodicTasks();
    }));
  });

  // ==================== DOCUMENT DOWNLOAD ====================

  describe('Document Download', () => {
    let mockBlob: Blob;

    beforeEach(fakeAsync(() => {
      mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('should call downloadDocument API with correct id', fakeAsync(() => {
      casesApiService.downloadDocument.and.returnValue(of(mockBlob));
      component.downloadDocument('doc-1', 'test.pdf');
      tick();
      expect(casesApiService.downloadDocument).toHaveBeenCalledWith('doc-1');
      discardPeriodicTasks();
    }));
  });

  // ==================== RECEIPT DOWNLOAD ====================

  describe('Receipt Download', () => {
    let mockBlob: Blob;

    beforeEach(fakeAsync(() => {
      mockBlob = new Blob(['receipt content'], { type: 'application/pdf' });
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('should call downloadReceipt API with case id', fakeAsync(() => {
      casesApiService.downloadReceipt.and.returnValue(of(mockBlob));
      component.downloadReceipt();
      tick();
      expect(casesApiService.downloadReceipt).toHaveBeenCalledWith('case-1');
      discardPeriodicTasks();
    }));

    it('should do nothing when caseDetail is null', fakeAsync(() => {
      component.caseDetail = null;
      component.downloadReceipt();
      tick();
      expect(casesApiService.downloadReceipt).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));
  });

  // ==================== AMENDMENT REQUEST ====================

  describe('Amendment Request', () => {
    beforeEach(fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('should show confirmation dialog', async () => {
      confirmDialogService.confirm.and.resolveTo(true);
      casesApiService.amend.and.returnValue(of({} as any));

      await component.requestAmendment();
    });

    it('should NOT proceed when user cancels', async () => {
      confirmDialogService.confirm.and.resolveTo(false);

      await component.requestAmendment();

      expect(casesApiService.amend).not.toHaveBeenCalled();
    });

    it('should call amend API and reload on confirm', fakeAsync(() => {
      confirmDialogService.confirm.and.resolveTo(true);
      casesApiService.amend.and.returnValue(of({} as any));
      casesApiService.getDetail.calls.reset();
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));

      component.requestAmendment();
      tick();

      expect(casesApiService.amend).toHaveBeenCalledWith('case-1', {
        reason: 'Solicitud de aclaracion desde sede'
      });
      expect(casesApiService.getDetail).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should handle amend error', fakeAsync(() => {
      confirmDialogService.confirm.and.resolveTo(true);
      casesApiService.amend.and.returnValue(throwError(() => new Error('Amend failed')));

      component.requestAmendment();
      tick();

      expect(component.error).toBe('CASE_DETAIL.ERROR_LOAD');
      discardPeriodicTasks();
    }));

    it('should do nothing when caseDetail is null', fakeAsync(() => {
      component.caseDetail = null;
      confirmDialogService.confirm.and.resolveTo(true);

      component.requestAmendment();
      discardPeriodicTasks();

      expect(confirmDialogService.confirm).not.toHaveBeenCalled();
      expect(casesApiService.amend).not.toHaveBeenCalled();
    }));
  });

  // ==================== CONTINUE PROCESSING ====================

  describe('Continue Processing', () => {
    beforeEach(fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('should navigate to wizard with procedureId from caseDetail', fakeAsync(() => {
      spyOn(router, 'navigate');

      component.continueProcessing();
      discardPeriodicTasks();

      expect(router.navigate).toHaveBeenCalledWith(
        ['/sede/expedientes/nuevo', 'license-application'],
        { queryParams: { caseId: 'case-1' } }
      );
    }));

    it('should use procedureTypeId when available', fakeAsync(() => {
      spyOn(router, 'navigate');

      component.continueProcessing();
      discardPeriodicTasks();

      expect(router.navigate).toHaveBeenCalledWith(
        jasmine.arrayContaining(['/sede/expedientes/nuevo', 'license-application']),
        jasmine.any(Object)
      );
    }));

    it('should fallback to slugified procedureType when no procedureTypeId', fakeAsync(() => {
      spyOn(router, 'navigate');
      const caseWithoutTypeId = { ...mockCaseDetail, procedureTypeId: '' };
      component.caseDetail = caseWithoutTypeId;

      component.continueProcessing();
      discardPeriodicTasks();

      expect(router.navigate).toHaveBeenCalledWith(
        ['/sede/expedientes/nuevo', 'license-application'],
        { queryParams: { caseId: 'case-1' } }
      );
    }));

    it('should show error when no procedureId available', fakeAsync(() => {
      spyOn(router, 'navigate');
      const caseWithoutProcedure = { ...mockCaseDetail, procedureTypeId: '', procedureType: '' };
      component.caseDetail = caseWithoutProcedure;

      component.continueProcessing();
      discardPeriodicTasks();

      expect(component.error).toBe('CASE_DETAIL.ERROR_RESUME');
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should do nothing when caseDetail is null', fakeAsync(() => {
      component.caseDetail = null;
      spyOn(router, 'navigate');

      component.continueProcessing();
      discardPeriodicTasks();

      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  // ==================== STATUS CLASS ====================

  describe('Status Class', () => {
    beforeEach(fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('should return green classes for APPROVED', () => {
      expect(component.statusClass('APPROVED')).toBe('bg-green-100 text-green-700');
    });

    it('should return green classes for COMPLETED', () => {
      expect(component.statusClass('COMPLETED')).toBe('bg-green-100 text-green-700');
    });

    it('should return amber classes for PENDING', () => {
      expect(component.statusClass('PENDING')).toBe('bg-amber-100 text-amber-700');
    });

    it('should return amber classes for WAITING', () => {
      expect(component.statusClass('WAITING')).toBe('bg-amber-100 text-amber-700');
    });

    it('should return blue classes for unknown status', () => {
      expect(component.statusClass('UNKNOWN')).toBe('bg-blue-100 text-blue-700');
    });

    it('should return blue classes for REVIEW status', () => {
      expect(component.statusClass('REVIEW')).toBe('bg-blue-100 text-blue-700');
    });
  });

  // ==================== LOAD CASE DETAIL (private method behavior) ====================

  describe('Load Case Detail', () => {
    it('should set isLoading when showLoader is true', fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();

      // isLoading is set to true initially, then false after response
      expect(component.isLoading).toBeFalse();
    }));

    it('should do nothing when caseId is null', () => {
      setupComponent(null);
      fixture.detectChanges();

      // The component should have set error and not called API
      expect(component.error).toBe('CASE_DETAIL.ERROR_NO_ID');
      expect(casesApiService.getDetail).not.toHaveBeenCalled();
    });
  });

  // ==================== UTILITY ====================

  describe('Utility', () => {
    beforeEach(fakeAsync(() => {
      setupComponent('case-1');
      casesApiService.getDetail.and.returnValue(of(mockCaseDetail));
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it('toSlug should convert title to slug (lowercase, no accents, hyphens)', () => {
      const result = (component as any).toSlug('Mi Titulo Con Acentos');
      expect(result).toBe('mi-titulo-con-acentos');
    });

    it('toSlug should handle special characters', () => {
      const result = (component as any).toSlug('Hello! World@#');
      expect(result).toBe('hello-world');
    });

    it('toSlug should collapse multiple spaces into single hyphen', () => {
      const result = (component as any).toSlug('Multiple   Spaces   Here');
      expect(result).toBe('multiple-spaces-here');
    });

    it('toSlug should handle already lowercase input', () => {
      const result = (component as any).toSlug('already-lowercase');
      expect(result).toBe('already-lowercase');
    });

    it('toSlug should handle accented characters', () => {
      const result = (component as any).toSlug('Cafe con Leccion');
      expect(result).toBe('cafe-con-leccion');
    });
  });
});
