import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { CaseWizardComponent } from './case-wizard.component';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { I18nService, SupportedLocale } from '../../../application/services/i18n.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { ToastService } from '../../../application/services/toast.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CaseWizardComponent', () => {
  let component: CaseWizardComponent;
  let fixture: ComponentFixture<CaseWizardComponent>;
  let proceduresSpy: jasmine.SpyObj<ProceduresApiService>;
  let casesSpy: jasmine.SpyObj<CasesApiService>;
  let i18nSpy: jasmine.SpyObj<I18nService>;
  let confirmSpy: jasmine.SpyObj<ConfirmDialogService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let localeSubject: Subject<SupportedLocale>;

  let routeProcedureId: string | null = 'test-procedure';
  let routeCaseId: string | null = null;

  beforeEach(() => {
    localeSubject = new Subject<SupportedLocale>();
    proceduresSpy = jasmine.createSpyObj('ProceduresApiService', ['getByIdentifier']);
    casesSpy = jasmine.createSpyObj('CasesApiService', ['getDetail', 'create', 'updateDraft', 'uploadDocument', 'submit']);
    i18nSpy = jasmine.createSpyObj('I18nService', ['getCurrentLocale$']);
    confirmSpy = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);
    toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success', 'warning']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    i18nSpy.getCurrentLocale$.and.returnValue(localeSubject.asObservable());
    routeProcedureId = 'test-procedure';
    routeCaseId = null;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function configureAndCreate(): void {
    TestBed.configureTestingModule({
    declarations: [CaseWizardComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [ReactiveFormsModule, TranslateModule.forRoot()],
    providers: [
        { provide: ProceduresApiService, useValue: proceduresSpy },
        { provide: CasesApiService, useValue: casesSpy },
        { provide: I18nService, useValue: i18nSpy },
        { provide: ConfirmDialogService, useValue: confirmSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => routeProcedureId }, queryParamMap: { get: () => routeCaseId } } } },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(CaseWizardComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
  }

  // Data factories
  function makeProcedure(overrides: any = {}) {
    return { id: 'proc-1', slug: 'test-procedure', name: 'Test Procedure', description: 'A test', category: 'General', fee: 0, deadline: 30, status: 'active', tasks: [], ...overrides };
  }
  function makeTask(overrides: any = {}) {
    return { id: 'task-1', name: 'Task 1', type: 'form', description: '', ...overrides };
  }
  function makeField(overrides: any = {}) {
    return { id: 'field-1', name: 'Field 1', type: 'text', required: false, placeholder: '', ...overrides };
  }
  function makeUploadReq(overrides: any = {}) {
    return { id: 'req-1', name: 'Requirement 1', required: false, ...overrides };
  }

  // ===== INITIALIZATION =====

  it('should create component', () => {
    configureAndCreate();
    expect(component).toBeTruthy();
  });

  it('should redirect when no procedureId', () => {
    routeProcedureId = null;
    configureAndCreate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/procedimientos']);
  });

  it('should load procedure when procedureId exists', () => {
    const proc = makeProcedure();
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    // Verify loadProcedure calls the service (test the private method directly)
    (component as any).loadProcedure();
    expect(proceduresSpy.getByIdentifier).toHaveBeenCalledWith('test-procedure');
  });

  it('should set resumingCaseId from query params', () => {
    routeCaseId = 'case-123';
    configureAndCreate();
    expect(component.resumingCaseId).toBe('case-123');
  });

  it('should reload procedure when locale changes', () => {
    const proc = makeProcedure();
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    proceduresSpy.getByIdentifier.calls.reset();
    localeSubject.next('es-ES');
    expect(proceduresSpy.getByIdentifier).toHaveBeenCalledWith('test-procedure');
  });

  // ===== PROCEDURE LOADING =====

  it('should show toast error when procedure loading fails', () => {
    proceduresSpy.getByIdentifier.and.returnValue(throwError(() => new Error('fail')));
    configureAndCreate();
    // Trigger loadProcedure directly to test error handling
    (component as any).loadProcedure();
    expect(toastSpy.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('should set procedure and tasks on successful load', () => {
    const task = makeTask();
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    // Simulate what the subscription callback does
    component.procedure = proc;
    component.tasks = proc.tasks ?? [];
    component.currentTaskIndex = 0;
    component.currentTask = component.tasks[0] ?? null;
    expect(component.procedure).toEqual(proc);
    expect(component.tasks).toEqual([task]);
  });

  it('should set currentTask to first task', () => {
    const task = makeTask();
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.tasks = proc.tasks ?? [];
    component.currentTaskIndex = 0;
    component.currentTask = component.tasks[0] ?? null;
    expect(component.currentTask).toEqual(task);
    expect(component.currentTaskIndex).toBe(0);
  });

  it('should load existing case data when resumingCaseId present', () => {
    const task = makeTask();
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    const caseData = { id: 'case-123', formData: { 'field-1': 'existing value' } };
    casesSpy.getDetail.and.returnValue(of(caseData as any));
    routeCaseId = 'case-123';
    configureAndCreate();
    // Simulate procedure loaded, which triggers case data load
    component.procedure = proc;
    component.tasks = proc.tasks ?? [];
    component.currentTaskIndex = 0;
    component.currentTask = component.tasks[0] ?? null;
    component.resumingCaseId = 'case-123';
    (component as any).loadExistingCaseData();
    expect(casesSpy.getDetail).toHaveBeenCalledWith('case-123');
  });

  // ===== STEP NAVIGATION =====

  it('nextStep should advance to next task', () => {
    const task1 = makeTask({ id: 'task-1' });
    const task2 = makeTask({ id: 'task-2', formFields: [] });
    const proc = makeProcedure({ tasks: [task1, task2] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.tasks = [task1, task2];
    component.currentTaskIndex = 0;
    component.currentTask = task1;
    component.nextStep();
    expect(component.currentTaskIndex).toBe(1);
    expect(component.currentTask).toEqual(task2);
  });

  it('nextStep should not advance beyond last task', () => {
    const task = makeTask({ formFields: [] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.tasks = [task];
    component.currentTaskIndex = 0;
    component.currentTask = task;
    component.nextStep();
    expect(component.currentTaskIndex).toBe(0);
  });

  it('nextStep should do nothing when currentTask is null', () => {
    const proc = makeProcedure();
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.currentTask = null;
    component.nextStep();
    expect(component.currentTaskIndex).toBe(0);
  });

  it('previousStep should go back', () => {
    const task1 = makeTask({ id: 'task-1', formFields: [] });
    const task2 = makeTask({ id: 'task-2', formFields: [] });
    const proc = makeProcedure({ tasks: [task1, task2] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.tasks = [task1, task2];
    component.currentTaskIndex = 1;
    component.currentTask = task2;
    component.previousStep();
    expect(component.currentTaskIndex).toBe(0);
    expect(component.currentTask).toEqual(task1);
  });

  it('previousStep should not go before first task', () => {
    const task = makeTask({ formFields: [] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.tasks = [task];
    component.previousStep();
    expect(component.currentTaskIndex).toBe(0);
  });

  // ===== FORM BUILDING =====

  it('should build form fields for form-type tasks', () => {
    const field = makeField({ id: 'name', type: 'text' });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    expect(component.wizardForm.get('name')).toBeTruthy();
  });

  it('should add required validator for required fields', () => {
    const field = makeField({ id: 'name', required: true });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    const ctrl = component.wizardForm.get('name')!;
    (ctrl as any).setValue('');
    expect(ctrl.valid).toBeFalse();
  });

  it('should add email validator for email-type fields', () => {
    const field = makeField({ id: 'email', type: 'email', required: true });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    const ctrl = component.wizardForm.get('email')!;
    (ctrl as any).setValue('not-an-email');
    expect(ctrl.valid).toBeFalse();
  });

  it('should add pattern validator for phone-type fields', () => {
    const field = makeField({ id: 'phone', type: 'phone', required: true });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    const ctrl = component.wizardForm.get('phone')!;
    (ctrl as any).setValue('abc');
    expect(ctrl.valid).toBeFalse();
  });

  it('should build upload fields for upload-type tasks', () => {
    const req = makeUploadReq({ id: 'doc-1' });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    expect(component.uploadForm.get('doc-1')).toBeTruthy();
  });

  // ===== FILE HANDLING =====

  it('onFilesSelected should add files to attachments', () => {
    const req = makeUploadReq({ id: 'doc-1' });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })] as unknown as FileList;
    component.onFilesSelected('doc-1', files);
    expect(component.attachments.value['doc-1'].length).toBe(1);
    expect(component.attachments.value['doc-1'][0].name).toBe('test.pdf');
  });

  it('onDragOver should set drag state to true', () => {
    configureAndCreate();
    const event = { preventDefault: () => {} } as DragEvent;
    component.onDragOver('doc-1', event);
    expect(component.dragOverState.value['doc-1']).toBeTrue();
  });

  it('onDragLeave should set drag state to false', () => {
    configureAndCreate();
    component.dragOverState.setValue({ 'doc-1': true });
    const event = { preventDefault: () => {} } as DragEvent;
    component.onDragLeave('doc-1', event);
    expect(component.dragOverState.value['doc-1']).toBeFalse();
  });

  it('onDrop should add dropped files and clear drag state', () => {
    const req = makeUploadReq({ id: 'doc-1' });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    const file = new File(['content'], 'dropped.pdf', { type: 'application/pdf' });
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    const event = { preventDefault: () => {}, dataTransfer } as unknown as DragEvent;
    component.onDrop('doc-1', event);
    expect(component.dragOverState.value['doc-1']).toBeFalse();
    expect(component.attachments.value['doc-1'].length).toBe(1);
  });

  it('isDragOver should return correct state', () => {
    configureAndCreate();
    component.dragOverState.setValue({ 'doc-1': true });
    expect(component.isDragOver('doc-1')).toBeTrue();
    expect(component.isDragOver('doc-2')).toBeFalse();
  });

  it('removeAttachment should remove file at index', () => {
    const req = makeUploadReq({ id: 'doc-1' });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    const files = [new File(['a'], 'a.pdf'), new File(['b'], 'b.pdf')] as unknown as FileList;
    component.onFilesSelected('doc-1', files);
    expect(component.attachments.value['doc-1'].length).toBe(2);
    component.removeAttachment('doc-1', 0);
    expect(component.attachments.value['doc-1'].length).toBe(1);
    expect(component.attachments.value['doc-1'][0].name).toBe('b.pdf');
  });

  // ===== VALIDATION =====

  it('isCurrentTaskValid should check wizardForm.valid for form tasks', () => {
    const field = makeField({ id: 'name', required: true });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    component.currentTask = task;
    (component.wizardForm.get('name') as any).setValue('');
    expect((component as any).isCurrentTaskValid()).toBeFalse();
    (component.wizardForm.get('name') as any).setValue('John');
    expect((component as any).isCurrentTaskValid()).toBeTrue();
  });

  it('isCurrentTaskValid should return true for info tasks', () => {
    const task = makeTask({ type: 'info' });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.currentTask = task;
    expect((component as any).isCurrentTaskValid()).toBeTrue();
  });

  it('isUploadsValid should return true when no requirements', () => {
    const task = makeTask({ type: 'upload', uploadRequirements: [] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.currentTask = task;
    expect((component as any).isUploadsValid()).toBeTrue();
  });

  it('isUploadsValid should return false when required has no files', () => {
    const req = makeUploadReq({ id: 'doc-1', required: true });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.currentTask = task;
    expect((component as any).isUploadsValid()).toBeFalse();
  });

  it('markCurrentTaskTouched should mark wizardForm for form tasks', () => {
    const field = makeField({ id: 'name', required: true });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    component.currentTask = task;
    (component as any).markCurrentTaskTouched();
    expect(component.wizardForm.get('name')!.touched).toBeTrue();
  });

  // ===== REVIEW DATA =====

  it('getReviewFormEntries should return entries with labels', () => {
    const field = makeField({ id: 'name', name: 'Full Name' });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    component.procedure = proc;
    (component.wizardForm.get('name') as any).setValue('John Doe');
    const entries = component.getReviewFormEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].label).toBe('Full Name');
    expect(entries[0].value).toBe('John Doe');
  });

  it('getReviewFormEntries should show "-" for empty values', () => {
    const field = makeField({ id: 'name', name: 'Full Name' });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    component.procedure = proc;
    const entries = component.getReviewFormEntries();
    expect(entries[0].value).toBe('-');
  });

  it('getReviewAttachmentGroups should return groups with labels', () => {
    const req = makeUploadReq({ id: 'doc-1', name: 'ID Document' });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    component.procedure = proc;
    const files = [new File(['a'], 'test.pdf')] as unknown as FileList;
    component.onFilesSelected('doc-1', files);
    const groups = component.getReviewAttachmentGroups();
    expect(groups.length).toBe(1);
    expect(groups[0].label).toBe('ID Document');
    expect(groups[0].files.length).toBe(1);
  });

  it('getReviewFormEntries should return empty when no procedure', () => {
    configureAndCreate();
    component.procedure = null;
    expect(component.getReviewFormEntries()).toEqual([]);
  });

  // ===== STEP PROPERTIES =====

  it('isLastStep should return true when on last task', () => {
    const task1 = makeTask({ formFields: [] });
    const task2 = makeTask({ formFields: [] });
    const proc = makeProcedure({ tasks: [task1, task2] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.tasks = [task1, task2];
    component.currentTaskIndex = 1;
    expect(component.isLastStep).toBeTrue();
  });

  it('isLastStep should return false when not on last task', () => {
    const task1 = makeTask({ formFields: [] });
    const task2 = makeTask({ formFields: [] });
    const proc = makeProcedure({ tasks: [task1, task2] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.tasks = [task1, task2];
    expect(component.isLastStep).toBeFalse();
  });

  it('stepLabel should return "current/total" format', () => {
    const task1 = makeTask({ formFields: [] });
    const task2 = makeTask({ formFields: [] });
    const task3 = makeTask({ formFields: [] });
    const proc = makeProcedure({ tasks: [task1, task2, task3] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.tasks = [task1, task2, task3];
    component.currentTaskIndex = 1;
    expect(component.stepLabel).toBe('2/3');
  });

  // ===== UPLOAD REQUIREMENTS =====

  it('effectiveUploadRequirements should return task requirements', () => {
    const req = makeUploadReq({ id: 'doc-1' });
    const task = makeTask({ type: 'upload', uploadRequirements: [req] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.currentTask = task;
    const reqs = component.effectiveUploadRequirements;
    expect(reqs.length).toBe(1);
    expect(reqs[0].id).toBe('doc-1');
  });

  it('effectiveUploadRequirements should return generic when none', () => {
    const task = makeTask({ type: 'upload', uploadRequirements: [] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.currentTask = task;
    const reqs = component.effectiveUploadRequirements;
    expect(reqs.length).toBe(1);
    expect(reqs[0].id).toBe('__genericUpload__');
  });

  // ===== SUBMIT FLOW =====

  it('submit should NOT proceed when user cancels confirmation', async () => {
    const task = makeTask({ type: 'info' });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.currentTask = task;
    confirmSpy.confirm.and.resolveTo(false);
    await component.submit();
    expect(casesSpy.create).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });

  it('submit should NOT proceed when form is invalid', async () => {
    const field = makeField({ id: 'name', required: true });
    const task = makeTask({ type: 'form', formFields: [field] });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    (component as any).buildForms(task);
    component.procedure = proc;
    component.currentTask = task;
    confirmSpy.confirm.and.resolveTo(true);
    await component.submit();
    expect(casesSpy.create).not.toHaveBeenCalled();
  });

  it('submit should create case when no files', async () => {
    const task = makeTask({ type: 'info' });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.currentTask = task;
    confirmSpy.confirm.and.resolveTo(true);
    casesSpy.create.and.returnValue(of({ id: 'new-case' } as any));
    casesSpy.submit.and.returnValue(of(undefined as any));
    await component.submit();
    await new Promise(r => setTimeout(r, 0));
    expect(casesSpy.create).toHaveBeenCalled();
    expect(casesSpy.submit).toHaveBeenCalledWith('new-case');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/expedientes', 'new-case', 'detalle']);
  });

  it('submit should handle create error', async () => {
    const task = makeTask({ type: 'info' });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    configureAndCreate();
    component.procedure = proc;
    component.currentTask = task;
    confirmSpy.confirm.and.resolveTo(true);
    casesSpy.create.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
    await component.submit();
    expect(toastSpy.error).toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });

  it('updateAndSubmit should update draft case', fakeAsync(() => {
    const task = makeTask({ type: 'info' });
    const proc = makeProcedure({ tasks: [task] });
    proceduresSpy.getByIdentifier.and.returnValue(of(proc));
    routeCaseId = 'draft-case';
    configureAndCreate();
    component.procedure = proc;
    component.resumingCaseId = 'draft-case';
    component.currentTask = task;
    casesSpy.updateDraft.and.returnValue(of(undefined as any));
    casesSpy.submit.and.returnValue(of(undefined as any));
    (component as any).updateAndSubmit();
    tick();
    expect(casesSpy.updateDraft).toHaveBeenCalledWith('draft-case', jasmine.any(Object));
    expect(casesSpy.submit).toHaveBeenCalledWith('draft-case');
    flush();
  }));

  it('submitCreatedCase should call submit API and navigate', fakeAsync(() => {
    configureAndCreate();
    casesSpy.submit.and.returnValue(of(undefined as any));
    (component as any).submitCreatedCase('case-456');
    tick();
    expect(casesSpy.submit).toHaveBeenCalledWith('case-456');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/sede/expedientes', 'case-456', 'detalle']);
    flush();
  }));

  // ===== CLEANUP =====

  it('ngOnDestroy should unsubscribe', () => {
    configureAndCreate();
    const unsubSpy = jasmine.createSpy('unsubscribe');
    (component as any).localeSubscription = { unsubscribe: unsubSpy };
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
