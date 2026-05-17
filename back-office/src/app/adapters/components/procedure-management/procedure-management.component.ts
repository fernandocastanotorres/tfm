import { Component, OnInit, inject } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import {
  FormSchemaField,
  ManagedProcedure,
  ProcedureRequest,
  ProcedureTaskConfig,
  ProcedureTranslation
} from '../../../application/models/backoffice.models';
import { ProcedureManagementService } from '../../../application/services/procedure-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
  selector: 'bo-procedure-management',
  templateUrl: './procedure-management.component.html',
  styleUrls: ['./procedure-management.component.css']
})
export class ProcedureManagementComponent implements OnInit {
  private readonly procedureManagementService = inject(ProcedureManagementService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  readonly supportedLocales = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];

  procedures: ManagedProcedure[] = [];
  selectedProcedure: ManagedProcedure | null = null;
  selectedLocale = 'es-ES';
  searchTerm = '';
  isLoading = true;
  isSaving = false;
  showForm = false;

  form: ProcedureRequest = this.createEmptyForm();
  translationForm = this.createTranslationMap();

  ngOnInit(): void {
    this.loadProcedures();
  }

  get filteredProcedures(): ManagedProcedure[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.procedures;
    return this.procedures.filter(procedure =>
      procedure.title.toLowerCase().includes(term) ||
      procedure.category.toLowerCase().includes(term) ||
      procedure.assignedUnit.toLowerCase().includes(term)
    );
  }

  loadProcedures(): void {
    this.isLoading = true;
    this.procedureManagementService.list().subscribe({
      next: procedures => {
        this.procedures = procedures;
        this.isLoading = false;
      },
      error: () => {
        this.procedures = [];
        this.isLoading = false;
      }
    });
  }

  openCreate(): void {
    this.selectedProcedure = null;
    this.form = this.createEmptyForm();
    this.translationForm = this.createTranslationMap();
    this.selectedLocale = 'es-ES';
    this.syncSpanishFromBase();
    this.showForm = true;
  }

  openEdit(procedure: ManagedProcedure): void {
    this.selectedProcedure = procedure;
    this.form = {
      title: procedure.title,
      description: procedure.description,
      category: procedure.category,
      status: procedure.status,
      assignedUnit: procedure.assignedUnit,
      deadlineDays: procedure.deadlineDays,
      feeAmount: procedure.feeAmount,
      tasks: procedure.tasks.map(task => ({ ...task })),
      formSchema: procedure.formSchema.map(field => ({ ...field, options: field.options ? [...field.options] : undefined }))
    };
    this.translationForm = this.createTranslationMap();
    this.selectedLocale = 'es-ES';
    this.syncSpanishFromBase();
    this.procedureManagementService.listTranslations(procedure.id).subscribe({
      next: (translations) => this.applyTranslations(translations),
      error: () => undefined
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedProcedure = null;
  }

  addTask(): void {
    const task: ProcedureTaskConfig = {
      id: `task-${Date.now()}`,
      title: 'Nueva tarea',
      type: 'REVIEW',
      description: '',
      orderIndex: this.form.tasks.length,
      assignedRole: 'ROLE_TRAMITADOR'
    };
    this.form.tasks = [...this.form.tasks, task];
  }

  async removeTask(taskId: string): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm('Eliminar tarea', 'Esta accion eliminara la tarea del procedimiento.', 'Si, eliminar');
    if (!confirmed) return;
    this.form.tasks = this.form.tasks.filter(task => task.id !== taskId).map((task, index) => ({ ...task, orderIndex: index }));
  }

  addField(): void {
    const field: FormSchemaField = {
      id: `field_${Date.now()}`,
      label: 'Nuevo campo',
      type: 'text',
      required: false
    };
    this.form.formSchema = [...this.form.formSchema, field];
  }

  async removeField(fieldId: string): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm('Eliminar campo', 'Esta accion eliminara el campo del formulario dinamico.', 'Si, eliminar');
    if (!confirmed) return;
    this.form.formSchema = this.form.formSchema.filter(field => field.id !== fieldId);
  }

  async save(): Promise<void> {
    if (!this.form.title || !this.form.assignedUnit) return;
    const confirmed = await this.confirmDialogService.confirm('Guardar cambios', 'Se actualizara la definicion del procedimiento y sus tareas.', 'Si, guardar');
    if (!confirmed) return;
    this.isSaving = true;

    if (this.selectedProcedure) {
      this.procedureManagementService.update(this.selectedProcedure.id, this.form).pipe(
        switchMap((saved) => this.persistTranslations(saved.id))
      ).subscribe({
        next: () => this.afterSave(),
        error: () => this.isSaving = false
      });
      return;
    }

    this.procedureManagementService.create(this.form).pipe(
      switchMap((saved) => this.persistTranslations(saved.id))
    ).subscribe({
      next: () => this.afterSave(),
      error: () => this.isSaving = false
    });
  }

  onBaseFieldsChanged(): void {
    if (this.selectedLocale === 'es-ES') {
      this.syncSpanishFromBase();
    }
  }

  selectLocale(locale: string): void {
    this.selectedLocale = locale;
  }

  get selectedTranslation(): ProcedureTranslation {
    return this.translationForm[this.selectedLocale];
  }

  async toggleStatus(procedure: ManagedProcedure): Promise<void> {
    const nextStatus = procedure.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmed = await this.confirmDialogService.confirm('Cambiar estado', `El procedimiento pasara a estado ${nextStatus}.`, 'Si, continuar');
    if (!confirmed) return;
    this.procedureManagementService.toggleStatus(procedure.id, nextStatus).subscribe({
      next: updated => procedure.status = updated.status
    });
  }

  private afterSave(): void {
    this.isSaving = false;
    this.closeForm();
    this.loadProcedures();
  }

  private createEmptyForm(): ProcedureRequest {
    return {
      title: '',
      description: '',
      category: 'Administrativo',
      status: 'DRAFT',
      assignedUnit: '',
      deadlineDays: 10,
      feeAmount: 0,
      tasks: [],
      formSchema: []
    };
  }

  private createTranslationMap(): Record<string, ProcedureTranslation> {
    return this.supportedLocales.reduce<Record<string, ProcedureTranslation>>((acc, locale) => {
      acc[locale] = {
        id: '',
        procedureTypeId: '',
        locale,
        title: '',
        description: '',
        unit: '',
        createdAt: '',
        updatedAt: ''
      };
      return acc;
    }, {});
  }

  private applyTranslations(translations: ProcedureTranslation[]): void {
    translations.forEach((translation) => {
      if (this.translationForm[translation.locale]) {
        this.translationForm[translation.locale] = { ...translation };
      }
    });
  }

  private persistTranslations(procedureId: string) {
    const requests = this.supportedLocales
      .map((locale) => {
        const translation = this.translationForm[locale];
        if (!translation.title.trim()) {
          return null;
        }
        return this.procedureManagementService.upsertTranslation(procedureId, {
          locale,
          title: translation.title,
          description: translation.description,
          unit: translation.unit
        });
      })
      .filter((request): request is ReturnType<ProcedureManagementService['upsertTranslation']> => request !== null);

    if (requests.length === 0) {
      return of([]);
    }
    return forkJoin(requests);
  }

  private syncSpanishFromBase(): void {
    const spanish = this.translationForm['es-ES'];
    this.translationForm['es-ES'] = {
      ...spanish,
      title: this.form.title,
      description: this.form.description,
      unit: this.form.assignedUnit
    };
  }
}
