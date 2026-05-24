import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { I18nService } from '../../../application/services/i18n.service';
import { ProcedureDetail, ProcedureTaskDto, FormFieldDto, UploadRequirementDto } from '../../../application/models/procedure.models';
import { CreateCaseRequest } from '../../../application/models/case.models';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';
import { ToastService } from '../../../application/services/toast.service';
import { Subscription } from 'rxjs';

import { trackByIndex } from '../../../application/utils/track-by.utils';

@Component({
    selector: 'app-case-wizard',
    templateUrl: './case-wizard.component.html',
    styleUrls: ['./case-wizard.component.css'],
    standalone: false
})
export class CaseWizardComponent implements OnInit, OnDestroy {
  private static readonly GENERIC_UPLOAD_ID = '__genericUpload__';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);
  private static readonly ALLOWED_EXTENSIONS = new Set([
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx'
  ]);
  private localeSubscription: Subscription | null = null;
  private procedureIdentifier: string | null = null;
  procedure: ProcedureDetail | null = null;
  tasks: ProcedureTaskDto[] = [];
  currentTaskIndex = 0;
  currentTask: ProcedureTaskDto | null = null;
  readonly wizardForm = this.fb.group({});
  readonly uploadForm = this.fb.group({});
  readonly attachments = this.fb.nonNullable.control<Record<string, File[]>>({});
  readonly dragOverState = this.fb.nonNullable.control<Record<string, boolean>>({});
  isLoading = true;
  isSubmitting = false;
  createdCaseId: string | null = null;
  resumingCaseId: string | null = null;

  protected readonly trackByIndex = trackByIndex;

  constructor(
    private readonly fb: FormBuilder,
    private readonly casesApiService: CasesApiService,
    private readonly proceduresApiService: ProceduresApiService,
    private readonly i18nService: I18nService,
    private readonly translate: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly confirmDialogService: ConfirmDialogService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.procedureIdentifier = this.route.snapshot.paramMap.get('procedureId');
    if (!this.procedureIdentifier) {
      this.router.navigate(['/sede/procedimientos']);
      return;
    }

    this.resumingCaseId = this.route.snapshot.queryParamMap.get('caseId');

    // Reload procedure data when locale changes
    this.localeSubscription = this.i18nService.getCurrentLocale$().subscribe(() => {
      this.loadProcedure();
    });
  }

  ngOnDestroy(): void {
    this.localeSubscription?.unsubscribe();
  }

  private loadProcedure(): void {
    if (!this.procedureIdentifier) return;
    this.isLoading = true;

    this.proceduresApiService.getByIdentifier(this.procedureIdentifier).subscribe({
      next: (data) => {
        this.procedure = data;
        this.tasks = data.tasks ?? [];
        this.currentTaskIndex = 0;
        this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
        this.buildForms(this.currentTask);

        if (this.resumingCaseId) {
          this.loadExistingCaseData();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.toast.error('Error', 'No se ha podido cargar el procedimiento.');
        this.isLoading = false;
      }
    });
  }

  private loadExistingCaseData(): void {
    this.casesApiService.getDetail(this.resumingCaseId!).subscribe({
      next: (caseData) => {
        if (caseData.formData) {
          this.populateFormFromData(caseData.formData);
        }
        this.isLoading = false;
      },
      error: () => {
        this.resumingCaseId = null;
        this.isLoading = false;
      }
    });
  }

  private populateFormFromData(formData: Record<string, any>): void {
    const rawValue = this.wizardForm.getRawValue();
    for (const key of Object.keys(rawValue)) {
      if (formData[key] !== undefined) {
        this.wizardForm.get(key)?.setValue(formData[key]);
      }
    }
  }

  nextStep(): void {
    if (!this.currentTask) {
      return;
    }

    if (!this.isCurrentTaskValid()) {
      this.markCurrentTaskTouched();
      return;
    }

    this.currentTaskIndex = Math.min(this.currentTaskIndex + 1, this.tasks.length - 1);
    this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
    this.buildForms(this.currentTask);
  }

  previousStep(): void {
    this.currentTaskIndex = Math.max(this.currentTaskIndex - 1, 0);
    this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
    this.buildForms(this.currentTask);
  }

  onFilesSelected(requirementId: string, files: FileList | null, input?: HTMLInputElement | null): void {
    
    if (!files) {
      if (input) {
        input.value = '';
      }
      return;
    }

    const acceptedFiles = this.filterAllowedFiles(Array.from(files));
    this.addFiles(requirementId, acceptedFiles);

    if (input) {
      input.value = '';
    }

    if (acceptedFiles.length === 0) {
      this.toast.info(this.translate.instant('CASE_WIZARD.NO_NEW_ATTACHMENTS'), this.translate.instant('CASE_WIZARD.NO_NEW_ATTACHMENTS_DESC'));
    }
  }

  onDragOver(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: true });
  }

  onDragEnter(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: true });
  }

  onDragLeave(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: false });
  }

  onDrop(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: false });
    const files = this.extractDroppedFiles(event.dataTransfer);
    if (files.length === 0) {
      return;
    }

    this.addFiles(requirementId, this.filterAllowedFiles(files));
  }

  openFilePicker(requirementId: string): void {
    const input = document.getElementById(`file-input-${requirementId}`) as HTMLInputElement | null;
    if (!input) {
      this.toast.error('Error', 'No se ha encontrado el selector de archivos.');
      return;
    }

    input.click();
  }

  onDropzoneKeydown(requirementId: string, event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openFilePicker(requirementId);
    }
  }

  @HostListener('document:dragenter', ['$event'])
  preventDocumentDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('window:dragenter', ['$event'])
  preventWindowDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:dragover', ['$event'])
  preventDocumentDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:drop', ['$event'])
  preventDocumentDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('window:dragover', ['$event'])
  preventWindowDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('window:drop', ['$event'])
  preventWindowDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  isDragOver(requirementId: string): boolean {
    return Boolean(this.dragOverState.value[requirementId]);
  }

  getReviewFormEntries(): Array<{ label: string; value: string }> {
    if (!this.procedure) {
      return [];
    }

    const valueMap = this.wizardForm.getRawValue() as Record<string, unknown>;
    const labelMap = new Map<string, string>();

    (this.procedure.tasks ?? [])
      .flatMap((task) => task.formFields ?? [])
      .forEach((field) => labelMap.set(field.id, field.name));

    return Object.entries(valueMap).map(([key, value]) => ({
      label: labelMap.get(key) ?? key,
      value: value == null || `${value}`.trim() === '' ? '-' : `${value}`
    }));
  }

  getReviewAttachmentGroups(): Array<{ label: string; files: File[] }> {
    const requirementLabelMap = new Map<string, string>();
    (this.procedure?.tasks ?? [])
      .flatMap((task) => task.uploadRequirements ?? [])
      .forEach((requirement) => requirementLabelMap.set(requirement.id, requirement.name));

    return Object.entries(this.attachments.value).map(([key, files]) => ({
      label: requirementLabelMap.get(key) ?? 'Documentacion adjunta',
      files
    }));
  }

  private addFiles(requirementId: string, files: File[]): void {
    
    if (files.length === 0) {
      return;
    }

    const current = this.attachments.value[requirementId] ?? [];
    const next = [...current];
    files.forEach((file) => {
      const alreadyIncluded = next.some(
        (existing) =>
          existing.name === file.name
          && existing.size === file.size
          && existing.lastModified === file.lastModified
      );
      if (!alreadyIncluded) {
        next.push(file);
      }
    });

    this.attachments.setValue({
      ...this.attachments.value,
      [requirementId]: next
    });
    this.uploadForm.get(requirementId)?.setValue(next.map((file) => file.name));
  }

  private extractDroppedFiles(dataTransfer: DataTransfer | null | undefined): File[] {
    if (!dataTransfer) {
      return [];
    }

    if (dataTransfer.files && dataTransfer.files.length > 0) {
      return Array.from(dataTransfer.files);
    }

    if (dataTransfer.items && dataTransfer.items.length > 0) {
      return Array.from(dataTransfer.items)
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);
    }

    return [];
  }

  removeAttachment(requirementId: string, index: number): void {
    const current = this.attachments.value[requirementId] ?? [];
    const next = current.filter((_, fileIndex) => fileIndex !== index);
    this.attachments.setValue({
      ...this.attachments.value,
      [requirementId]: next
    });
    this.uploadForm.get(requirementId)?.setValue(next.map((file) => file.name));
  }

  async submit(): Promise<void> {
    if (!this.procedure || !this.isCurrentTaskValid()) {
      this.markCurrentTaskTouched();
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      this.translate.instant('CASE_WIZARD.CONFIRM_SUBMIT'),
      'Esta accion enviara el expediente y no podras editarlo despues.',
      this.translate.instant('CASE_WIZARD.CONFIRM_SUBMIT_YES')
    );
    if (!confirmed) {
      return;
    }

    this.isSubmitting = true;

    if (this.resumingCaseId) {
      this.updateAndSubmit();
      return;
    }

    const request: CreateCaseRequest = {
      procedureId: this.procedure.id,
      title: this.procedure.name,
      formData: this.wizardForm.getRawValue()
    };

    this.casesApiService.create(request).subscribe({
      next: (createdCase) => {
        this.createdCaseId = createdCase.id;

        const filesToUpload = Object.values(this.attachments.value).flat();
        if (filesToUpload.length === 0) {
          this.submitCreatedCase(createdCase.id);
          return;
        }

        this.uploadAttachmentsAndSubmit(createdCase.id, filesToUpload, 0);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error('Error', err?.error?.message ?? 'No se ha podido crear el expediente.');
      }
    });
  }

  private updateAndSubmit(): void {
    const request: CreateCaseRequest = {
      procedureId: this.procedure!.id,
      title: this.procedure!.name,
      formData: this.wizardForm.getRawValue()
    };

    this.casesApiService.updateDraft(this.resumingCaseId!, request).subscribe({
      next: () => {
        const filesToUpload = Object.values(this.attachments.value).flat();
        if (filesToUpload.length === 0) {
          this.submitCreatedCase(this.resumingCaseId!);
          return;
        }
        this.uploadAttachmentsAndSubmit(this.resumingCaseId!, filesToUpload, 0);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error('Error', err?.error?.message ?? 'No se ha podido enviar el expediente.');
      }
    });
  }

  get isLastStep(): boolean {
    return this.currentTaskIndex === this.tasks.length - 1;
  }

  get stepLabel(): string {
    return `${this.currentTaskIndex + 1}/${this.tasks.length}`;
  }

  get effectiveUploadRequirements(): UploadRequirementDto[] {
    const requirements = this.currentTask?.uploadRequirements ?? [];
    if (requirements.length > 0) {
      return requirements;
    }

    return [
      {
        id: CaseWizardComponent.GENERIC_UPLOAD_ID,
        name: 'CASE_WIZARD.UPLOAD_GENERIC_LABEL',
        required: false
      }
    ];
  }

  private buildForms(task: ProcedureTaskDto | null): void {
    if (!task) {
      return;
    }

    if (task.type === 'form' && task.formFields) {
      this.buildFormFields(task.formFields);
    }

    if (task.type === 'upload' && task.uploadRequirements) {
      this.buildUploadFields(task.uploadRequirements);
    }
  }

  private buildFormFields(fields: FormFieldDto[]): void {
    Object.keys(this.wizardForm.controls).forEach((key) => this.wizardForm.removeControl(key));
    fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      if (field.type === 'phone') {
        validators.push(Validators.pattern(/^[0-9]{9,15}$/));
      }
      this.wizardForm.addControl(field.id, this.fb.control('', validators));
    });
  }

  private buildUploadFields(requirements: UploadRequirementDto[]): void {
    Object.keys(this.uploadForm.controls).forEach((key) => this.uploadForm.removeControl(key));
    requirements.forEach((requirement) => {
      this.uploadForm.addControl(
        requirement.id,
        this.fb.control([], requirement.required ? [Validators.required] : [])
      );
    });
  }

  private isCurrentTaskValid(): boolean {
    if (!this.currentTask) {
      return false;
    }

    if (this.currentTask.type === 'form') {
      return this.wizardForm.valid;
    }

    if (this.currentTask.type === 'upload') {
      return this.isUploadsValid();
    }

    return true;
  }

  private isUploadsValid(): boolean {
    if (!this.currentTask?.uploadRequirements) {
      return true;
    }

    return this.currentTask.uploadRequirements.every((requirement) => {
      if (!requirement.required) {
        return true;
      }
      const files = this.attachments.value[requirement.id] ?? [];
      return files.length > 0;
    });
  }

  private markCurrentTaskTouched(): void {
    if (this.currentTask?.type === 'form') {
      this.wizardForm.markAllAsTouched();
    }
    if (this.currentTask?.type === 'upload') {
      this.uploadForm.markAllAsTouched();
    }
  }

  private uploadAttachmentsAndSubmit(caseId: string, files: File[], index: number): void {
    if (index >= files.length) {
      this.submitCreatedCase(caseId);
      return;
    }

    this.casesApiService.uploadDocument(caseId, files[index]).subscribe({
      next: () => {
        this.uploadAttachmentsAndSubmit(caseId, files, index + 1);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error('Error', err?.error?.message ?? 'No se ha podido subir el documento adjunto.');
      }
    });
  }

  private filterAllowedFiles(files: File[]): File[] {
    const accepted: File[] = [];
    const rejectedByType: string[] = [];
    const rejectedBySize: string[] = [];

    files.forEach((file) => {
      if (file.size > CaseWizardComponent.MAX_FILE_SIZE) {
        rejectedBySize.push(file.name);
        return;
      }

      const extension = this.getFileExtension(file.name);
      const allowedByMime = CaseWizardComponent.ALLOWED_MIME_TYPES.has(file.type);
      const allowedByExtension = CaseWizardComponent.ALLOWED_EXTENSIONS.has(extension);

      if (!allowedByMime && !allowedByExtension) {
        rejectedByType.push(file.name);
        return;
      }

      accepted.push(file);
    });

    if (rejectedByType.length > 0) {
      this.toast.warning(
        this.translate.instant('CASE_WIZARD.INVALID_FILE_TYPE'),
        `No se han anadido: ${rejectedByType.join(', ')}. Formatos permitidos: PDF, JPG, PNG, GIF, DOC, DOCX.`
      );
    }

    if (rejectedBySize.length > 0) {
      this.toast.warning(
        this.translate.instant('CASE_WIZARD.FILE_TOO_LARGE'),
        `No se han anadido: ${rejectedBySize.join(', ')}. Tamano maximo por archivo: 10 MB.`
      );
    }

    return accepted;
  }

  private getFileExtension(fileName: string): string {
    const index = fileName.lastIndexOf('.');
    if (index < 0 || index === fileName.length - 1) {
      return '';
    }
    return fileName.slice(index).toLowerCase();
  }

  private submitCreatedCase(caseId: string): void {
    this.casesApiService.submit(caseId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/sede/expedientes', caseId, 'detalle']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Error', 'No se ha podido enviar el expediente.');
      }
    });
  }
}
