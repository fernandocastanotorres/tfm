import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureDetail, ProcedureTaskDto, FormFieldDto, UploadRequirementDto } from '../../../application/models/procedure.models';
import { CreateCaseRequest } from '../../../application/models/case.models';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
  selector: 'app-case-wizard',
  templateUrl: './case-wizard.component.html',
  styleUrls: ['./case-wizard.component.css']
})
export class CaseWizardComponent implements OnInit {
  private static readonly GENERIC_UPLOAD_ID = '__genericUpload__';
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
  error: string | null = null;
  createdCaseId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly casesApiService: CasesApiService,
    private readonly proceduresApiService: ProceduresApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const procedureIdentifier = this.route.snapshot.paramMap.get('procedureId');
    if (!procedureIdentifier) {
      this.router.navigate(['/sede/procedimientos']);
      return;
    }

    this.proceduresApiService.getByIdentifier(procedureIdentifier).subscribe({
      next: (data) => {
        this.procedure = data;
        this.tasks = data.tasks ?? [];
        this.currentTaskIndex = 0;
        this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
        this.buildForms(this.currentTask);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'CASE_WIZARD.ERROR_LOAD_PROCEDURE';
        this.isLoading = false;
      }
    });
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

  onFilesSelected(requirementId: string, files: FileList | null): void {
    if (!files) {
      return;
    }

    this.addFiles(requirementId, Array.from(files));
  }

  onDragOver(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: true });
  }

  onDragLeave(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: false });
  }

  onDrop(requirementId: string, event: DragEvent): void {
    event.preventDefault();
    this.dragOverState.setValue({ ...this.dragOverState.value, [requirementId]: false });
    const files = event.dataTransfer?.files;
    if (!files) {
      return;
    }

    this.addFiles(requirementId, Array.from(files));
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
      'Confirmar envio',
      'Esta accion enviara el expediente y no podras editarlo despues.',
      'Si, enviar'
    );
    if (!confirmed) {
      return;
    }

    this.isSubmitting = true;

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
        this.error = err?.error?.message ?? 'CASE_WIZARD.ERROR_CREATE';
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
        name: 'Documentacion',
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
      error: () => {
        this.isSubmitting = false;
        this.error = 'CASE_WIZARD.ERROR_SUBMIT';
      }
    });
  }

  private submitCreatedCase(caseId: string): void {
    this.casesApiService.submit(caseId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/sede/expedientes', caseId, 'detalle']);
      },
      error: () => {
        this.isSubmitting = false;
        this.error = 'CASE_WIZARD.ERROR_SUBMIT';
      }
    });
  }
}
