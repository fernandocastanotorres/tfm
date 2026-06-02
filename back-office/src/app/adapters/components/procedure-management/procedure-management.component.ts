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
import { ToastService } from '../../../application/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'bo-procedure-management',
    templateUrl: './procedure-management.component.html',
    styleUrls: ['./procedure-management.component.css'],
    standalone: false
})
export class ProcedureManagementComponent implements OnInit {
  private readonly procedureManagementService = inject(ProcedureManagementService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly CONFIRM_ACTION_DELETE = 'Si, eliminar';
  readonly supportedLocales = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];

  procedures: ManagedProcedure[] = [];
  selectedProcedure: ManagedProcedure | null = null;
  selectedLocale = 'es-ES';
  searchTerm = '';
  isLoading = true;
  isSaving = false;
  showForm = false;
  private lastFocusedElement: HTMLElement | null = null;

  categories: string[] = [];
  units: string[] = [];
  customCategory = '';
  customUnit = '';
  showCustomCategoryInput = false;
  showCustomUnitInput = false;
  activeTaskIndex: number | null = null;

  form: ProcedureRequest = this.createEmptyForm();
  translationForm = this.createTranslationMap();

  ngOnInit(): void {
    this.loadCatalog();
    this.loadProcedures();
  }

  private loadCatalog(): void {
    forkJoin({
      categories: this.procedureManagementService.listCategories(),
      units: this.procedureManagementService.listUnits()
    }).subscribe({
      next: ({ categories, units }) => {
        this.categories = categories;
        this.units = units;
      },
      error: () => {
        this.categories = ['Urbanismo', 'Padrón', 'Administración', 'General'];
        this.units = ['Secretaría', 'Tesorería', 'Registro'];
      }
    });
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

  get formCategories(): string[] {
    const base = [...this.categories];
    if (this.customCategory && !base.includes(this.customCategory)) {
      base.push(this.customCategory);
    }
    return base;
  }

  get formUnits(): string[] {
    const base = [...this.units];
    if (this.customUnit && !base.includes(this.customUnit)) {
      base.push(this.customUnit);
    }
    return base;
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
    this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.selectedProcedure = null;
    this.form = this.createEmptyForm();
    this.translationForm = this.createTranslationMap();
    this.selectedLocale = 'es-ES';
    this.syncSpanishFromBase();
    this.customCategory = '';
    this.customUnit = '';
    this.showCustomCategoryInput = false;
    this.showCustomUnitInput = false;
    this.activeTaskIndex = null;
    this.showForm = true;
  }

  openEdit(procedure: ManagedProcedure): void {
    this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.selectedProcedure = procedure;
    this.customCategory = '';
    this.customUnit = '';
    this.showCustomCategoryInput = !this.categories.includes(procedure.category);
    this.showCustomUnitInput = !this.units.includes(procedure.assignedUnit);
    if (this.showCustomCategoryInput) {
      this.customCategory = procedure.category;
    }
    if (this.showCustomUnitInput) {
      this.customUnit = procedure.assignedUnit;
    }
    this.form = {
      title: procedure.title,
      description: procedure.description,
      category: procedure.category,
      status: procedure.status,
      assignedUnit: procedure.assignedUnit,
      deadlineDays: procedure.deadlineDays,
      feeAmount: procedure.feeAmount,
      tasks: procedure.tasks.map(task => ({
        ...task,
        fields: task.fields ? [...task.fields] : []
      })),
      formSchema: procedure.formSchema.map(field => ({ ...field, options: field.options ? [...field.options] : undefined }))
    };
    this.translationForm = this.createTranslationMap();
    this.selectedLocale = 'es-ES';
    this.syncSpanishFromBase();
    this.activeTaskIndex = null;
    this.procedureManagementService.listTranslations(procedure.id).subscribe({
      next: (translations) => this.applyTranslations(translations),
      error: () => undefined
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedProcedure = null;
    this.restoreFocus();
  }

  addTask(): void {
    const task: ProcedureTaskConfig = {
      id: crypto.randomUUID(),
      title: 'Nueva tarea',
      type: 'REVIEW',
      description: '',
      orderIndex: this.form.tasks.length,
      assignedRole: 'ROLE_TRAMITADOR',
      fields: []
    };
    this.form.tasks = [...this.form.tasks, task];
    this.activeTaskIndex = this.form.tasks.length - 1;
  }

  async removeTask(taskId: string): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm('Eliminar tarea', 'Esta accion eliminara la tarea del procedimiento.', this.CONFIRM_ACTION_DELETE);
    if (!confirmed) return;
    const removedIndex = this.form.tasks.findIndex(t => t.id === taskId);
    this.form.tasks = this.form.tasks.filter(task => task.id !== taskId).map((task, index) => ({ ...task, orderIndex: index }));
    if (this.activeTaskIndex === removedIndex) {
      this.activeTaskIndex = null;
    } else if (this.activeTaskIndex !== null && removedIndex < this.activeTaskIndex) {
      this.activeTaskIndex--;
    }
  }

  selectTask(index: number): void {
    this.activeTaskIndex = this.activeTaskIndex === index ? null : index;
  }

  addFieldToTask(taskIndex: number): void {
    const task = this.form.tasks[taskIndex];
    if (!task.fields) {
      task.fields = [];
    }
    const field: FormSchemaField = {
      id: `field_${Date.now()}`,
      label: 'Nuevo campo',
      type: 'text',
      required: false
    };
    task.fields = [...task.fields, field];
    this.activeTaskIndex = taskIndex;
  }

  async removeFieldFromTask(taskIndex: number, fieldId: string): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm('Eliminar campo de tarea', 'Esta accion eliminara el campo de la tarea.', this.CONFIRM_ACTION_DELETE);
    if (!confirmed) return;
    const task = this.form.tasks[taskIndex];
    task.fields = [...(task.fields ?? []).filter(f => f.id !== fieldId)];
  }


  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === '__custom__') {
      this.showCustomCategoryInput = true;
      this.form.category = '';
    } else {
      this.form.category = value;
      this.showCustomCategoryInput = false;
    }
  }

  onUnitChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === '__custom__') {
      this.showCustomUnitInput = true;
      this.form.assignedUnit = '';
    } else {
      this.form.assignedUnit = value;
      this.showCustomUnitInput = false;
    }
  }

  async save(): Promise<void> {
    if (!this.form.title) {
      this.toastService.error(this.translateService.instant('BO.COMMON.VALIDATION_TITLE_REQUIRED') || 'El titulo es obligatorio');
      return;
    }
    if (!this.form.assignedUnit) {
      this.toastService.error(this.translateService.instant('BO.COMMON.VALIDATION_UNIT_REQUIRED') || 'La unidad es obligatoria');
      return;
    }
    const confirmed = await this.confirmDialogService.confirm('Guardar cambios', 'Se actualizara la definicion del procedimiento y sus tareas.', 'Si, guardar');
    if (!confirmed) return;
    this.isSaving = true;

    if (this.selectedProcedure) {
      this.procedureManagementService.update(this.selectedProcedure.id, this.form).pipe(
        switchMap((saved) => this.persistTranslations(saved.id))
      ).subscribe({
        next: () => this.afterSave(),
        error: () => {
          this.isSaving = false;
          this.toastService.error(this.translateService.instant('BO.COMMON.ERROR_PROCEDURE_UPDATE'));
        }
      });
      return;
    }

    this.procedureManagementService.create(this.form).pipe(
      switchMap((saved) => this.persistTranslations(saved.id))
    ).subscribe({
      next: () => this.afterSave(),
      error: () => {
        this.isSaving = false;
        this.toastService.error(this.translateService.instant('BO.COMMON.ERROR_PROCEDURE_CREATE'));
      }
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

  get formTasks(): ProcedureTaskConfig[] {
    return this.form.tasks;
  }

  async toggleStatus(procedure: ManagedProcedure): Promise<void> {
    const nextStatus = procedure.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmed = await this.confirmDialogService.confirm('Cambiar estado', `El procedimiento pasara a estado ${nextStatus}.`, 'Si, continuar');
    if (!confirmed) return;
    this.procedureManagementService.toggleStatus(procedure.id, nextStatus).subscribe({
      next: updated => procedure.status = updated.status
    });
  }

  hasPendingChanges(): boolean {
    if (!this.showForm || this.isSaving) {
      return false;
    }
    return Boolean(this.form.title.trim()) || this.form.tasks.length > 0 || this.form.formSchema.length > 0;
  }

  private afterSave(): void {
    this.isSaving = false;
    this.closeForm();
    this.loadProcedures();
    this.toastService.success(this.translateService.instant('BO.COMMON.SUCCESS_SAVED'));
  }

  private createEmptyForm(): ProcedureRequest {
    return {
      title: '',
      description: '',
      category: 'Administración',
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

  private restoreFocus(): void {
    if (!this.lastFocusedElement) {
      return;
    }
    const target = this.lastFocusedElement;
    this.lastFocusedElement = null;
    setTimeout(() => target.focus(), 0);
  }
}