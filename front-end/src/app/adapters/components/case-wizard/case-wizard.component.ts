import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { CaseWizardService } from '../../../application/services/case-wizard.service';
import {
  ProceduresService,
  ProcedureItem,
  ProcedureTask,
  ProcedureFormField,
  ProcedureUploadRequirement
} from '../../../application/services/procedures.service';

@Component({
  selector: 'app-case-wizard',
  templateUrl: './case-wizard.component.html',
  styleUrls: []
})
export class CaseWizardComponent implements OnInit {
  procedure: ProcedureItem | null = null;
  tasks: ProcedureTask[] = [];
  currentTaskIndex = 0;
  currentTask: ProcedureTask | null = null;
  readonly wizardForm = this.fb.group({});
  readonly uploadForm = this.fb.group({});
  readonly attachments = this.fb.nonNullable.control<Record<string, File[]>>({});

  constructor(
    private readonly fb: FormBuilder,
    private readonly wizardService: CaseWizardService,
    private readonly proceduresService: ProceduresService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const procedureId = this.route.snapshot.paramMap.get('procedureId');
    if (!procedureId) {
      this.router.navigate(['/procedimientos']);
      return;
    }

    const procedure = this.proceduresService.getProcedureById(procedureId);
    if (!procedure) {
      this.router.navigate(['/procedimientos']);
      return;
    }

    this.procedure = procedure;
    this.tasks = procedure.tasks;
    this.currentTaskIndex = 0;
    this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
    this.buildForms(this.currentTask);
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
    if (!this.isCurrentTaskValid()) {
      this.markCurrentTaskTouched();
      return;
    }

    this.wizardService.saveDraft({
      procedureId: this.procedure?.id ?? '',
      payload: {
        form: this.wizardForm.getRawValue(),
        uploads: this.serializeUploads(this.attachments.getRawValue())
      }
    });
  }

  get isLastStep(): boolean {
    return this.currentTaskIndex === this.tasks.length - 1;
  }

  get stepLabel(): string {
    return `${this.currentTaskIndex + 1}/${this.tasks.length}`;
  }

  private buildForms(task: ProcedureTask | null): void {
    if (!task) {
      return;
    }

    if (task.type === 'form') {
      this.buildFormFields(task.fields ?? []);
    }

    if (task.type === 'upload') {
      this.buildUploadFields(task.uploadRequirements ?? []);
    }
  }

  private buildFormFields(fields: ProcedureFormField[]): void {
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

  private buildUploadFields(requirements: ProcedureUploadRequirement[]): void {
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

  private serializeUploads(uploads: Record<string, File[]>): Record<string, string[]> {
    return Object.entries(uploads).reduce<Record<string, string[]>>((acc, [key, files]) => {
      acc[key] = (files ?? []).map((file) => file.name);
      return acc;
    }, {});
  }
}
