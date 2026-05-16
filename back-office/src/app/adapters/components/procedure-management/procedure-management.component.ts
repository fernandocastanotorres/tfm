import { Component, OnInit, inject } from '@angular/core';
import { FormSchemaField, ManagedProcedure, ProcedureRequest, ProcedureTaskConfig } from '../../../application/models/backoffice.models';
import { ProcedureManagementService } from '../../../application/services/procedure-management.service';

@Component({
  selector: 'bo-procedure-management',
  templateUrl: './procedure-management.component.html',
  styleUrls: ['./procedure-management.component.css']
})
export class ProcedureManagementComponent implements OnInit {
  private readonly procedureManagementService = inject(ProcedureManagementService);

  procedures: ManagedProcedure[] = [];
  selectedProcedure: ManagedProcedure | null = null;
  searchTerm = '';
  isLoading = true;
  isSaving = false;
  showForm = false;

  form: ProcedureRequest = this.createEmptyForm();

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

  removeTask(taskId: string): void {
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

  removeField(fieldId: string): void {
    this.form.formSchema = this.form.formSchema.filter(field => field.id !== fieldId);
  }

  save(): void {
    if (!this.form.title || !this.form.assignedUnit) return;
    this.isSaving = true;

    if (this.selectedProcedure) {
      this.procedureManagementService.update(this.selectedProcedure.id, this.form).subscribe({
        next: () => this.afterSave(),
        error: () => this.isSaving = false
      });
      return;
    }

    this.procedureManagementService.create(this.form).subscribe({
      next: () => this.afterSave(),
      error: () => this.isSaving = false
    });
  }

  toggleStatus(procedure: ManagedProcedure): void {
    const nextStatus = procedure.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
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
}
