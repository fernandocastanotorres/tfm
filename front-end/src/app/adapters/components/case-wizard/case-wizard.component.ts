import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { CasesApiService } from '../../../application/services/cases-api.service';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureDetail, ProcedureTaskDto, FormFieldDto, UploadRequirementDto } from '../../../application/models/procedure.models';
import { CreateCaseRequest } from '../../../application/models/case.models';

@Component({
  selector: 'app-case-wizard',
  templateUrl: './case-wizard.component.html',
  styleUrls: []
})
export class CaseWizardComponent implements OnInit {
  procedure: ProcedureDetail | null = null;
  tasks: ProcedureTaskDto[] = [];
  currentTaskIndex = 0;
  currentTask: ProcedureTaskDto | null = null;
  readonly wizardForm = this.fb.group({});
  readonly uploadForm = this.fb.group({});
  readonly attachments = this.fb.nonNullable.control<Record<string, File[]>>({});
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  createdCaseId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly casesApiService: CasesApiService,
    private readonly proceduresApiService: ProceduresApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
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

    const current = this.attachments.value[requirementId] ?? [];
    const next = [...current, ...Array.from(files)];
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

  submit(): void {
    if (!this.procedure || !this.isCurrentTaskValid()) {
      this.markCurrentTaskTouched();
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
        // Submit the case immediately after creation
        this.casesApiService.submit(createdCase.id).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/expedientes', createdCase.id, 'detalle']);
          },
          error: () => {
            this.isSubmitting = false;
            this.error = 'CASE_WIZARD.ERROR_SUBMIT';
          }
        });
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
}
