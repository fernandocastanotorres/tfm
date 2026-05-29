import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { CaseTimelineEvent, PendingTask } from '../../../application/models/backoffice.models';
import { ToastService } from '../../../application/services/toast.service';

@Component({
    selector: 'bo-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css'],
    standalone: false
})
export class TasksComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  tasks: PendingTask[] = [];
  filter: 'all' | 'urgent' | 'unassigned' = 'all';
  slaFilter: 'all' | 'overdue' | 'today' | 'next7' | 'no_due' = 'all';
  sortBy: 'due_asc' | 'due_desc' | 'priority' | 'created_desc' = 'due_asc';
  search = '';
  bulkAssigneeId = '';
  selectedTaskIds = new Set<string>();
  isLoading = true;
  isLoadingAudit = false;
  auditTask: PendingTask | null = null;
  auditEvents: CaseTimelineEvent[] = [];

  ngOnInit(): void {
    this.loadTasks();
  }

  get filteredTasks(): PendingTask[] {
    const term = this.search.trim().toLowerCase();

    const base = this.tasks.filter((task) => {
      if (this.filter === 'urgent' && task.priority !== 'urgent') {
        return false;
      }
      if (this.filter === 'unassigned' && !!task.assignedTo) {
        return false;
      }
      if (!this.matchesSlaFilter(task)) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        task.taskName.toLowerCase().includes(term) ||
        task.taskType.toLowerCase().includes(term) ||
        task.caseTitle.toLowerCase().includes(term) ||
        task.caseId.toLowerCase().includes(term)
      );
    });

    return base.sort((a, b) => this.compareTasks(a, b));
  }

  get selectedTasksCount(): number {
    return this.selectedTaskIds.size;
  }

  loadTasks(): void {
    this.isLoading = true;
    this.adminCasesService.getPendingTasks().subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: () => {
        this.tasks = [];
        this.isLoading = false;
      }
    });
  }

  openTask(task: PendingTask): void {
    this.router.navigate(['/cases', task.caseId, 'task', task.id]);
  }

  openCase(task: PendingTask): void {
    this.router.navigate(['/cases', task.caseId]);
  }

  openAuditTrail(task: PendingTask): void {
    this.auditTask = task;
    this.isLoadingAudit = true;
    this.auditEvents = [];

    this.adminCasesService.getDetail(task.caseId).subscribe({
      next: (detail) => {
        this.auditEvents = [...detail.timeline].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.isLoadingAudit = false;
      },
      error: () => {
        this.isLoadingAudit = false;
        this.toast.error('Trazabilidad', 'No se pudo cargar la trazabilidad del expediente.');
      }
    });
  }

  closeAuditTrail(): void {
    this.auditTask = null;
    this.auditEvents = [];
  }

  isAssignmentEvent(event: CaseTimelineEvent): boolean {
    const text = `${event.title} ${event.description}`.toLowerCase();
    return text.includes('asign') || text.includes('reassign') || text.includes('reasign');
  }

  toggleSelectTask(taskId: string, checked: boolean): void {
    if (checked) {
      this.selectedTaskIds.add(taskId);
      return;
    }
    this.selectedTaskIds.delete(taskId);
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.filteredTasks.forEach((task) => this.selectedTaskIds.add(task.id));
      return;
    }
    this.selectedTaskIds.clear();
  }

  bulkReassign(): void {
    const assignee = this.bulkAssigneeId.trim();
    if (!assignee) {
      this.toast.warning('Reasignacion', 'Indica un identificador de usuario para reasignar.');
      return;
    }

    const selected = this.filteredTasks.filter((task) => this.selectedTaskIds.has(task.id));
    if (selected.length === 0) {
      this.toast.warning('Reasignacion', 'Selecciona al menos una tarea.');
      return;
    }

    let pending = selected.length;
    let failed = 0;
    selected.forEach((task) => {
      this.adminCasesService.reassignCase(task.caseId, assignee).subscribe({
        next: () => {
          pending -= 1;
          if (pending === 0) {
            this.finishBulkReassign(failed, selected.length);
          }
        },
        error: () => {
          failed += 1;
          pending -= 1;
          if (pending === 0) {
            this.finishBulkReassign(failed, selected.length);
          }
        }
      });
    });
  }

  slaBadge(task: PendingTask): { label: string; className: string } {
    if (!task.dueDate) {
      return { label: 'Sin vencimiento', className: 'bg-slate-100 text-slate-700' };
    }
    const days = this.daysUntil(task.dueDate);
    if (days < 0) {
      return { label: 'Fuera de SLA', className: 'bg-red-100 text-red-700' };
    }
    if (days === 0) {
      return { label: 'Vence hoy', className: 'bg-amber-100 text-amber-700' };
    }
    if (days <= 2) {
      return { label: `Vence en ${days} dia(s)`, className: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'En plazo', className: 'bg-emerald-100 text-emerald-700' };
  }

  isTaskSelected(taskId: string): boolean {
    return this.selectedTaskIds.has(taskId);
  }

  private finishBulkReassign(failed: number, total: number): void {
    this.selectedTaskIds.clear();
    this.bulkAssigneeId = '';
    this.loadTasks();
    if (failed === 0) {
      this.toast.success('Reasignacion completada', `${total} tarea(s) reasignadas correctamente.`);
      return;
    }
    this.toast.warning('Reasignacion parcial', `${total - failed} correcta(s), ${failed} con error.`);
  }

  private matchesSlaFilter(task: PendingTask): boolean {
    if (this.slaFilter === 'all') {
      return true;
    }
    if (this.slaFilter === 'no_due') {
      return !task.dueDate;
    }
    if (!task.dueDate) {
      return false;
    }
    const days = this.daysUntil(task.dueDate);
    if (this.slaFilter === 'overdue') {
      return days < 0;
    }
    if (this.slaFilter === 'today') {
      return days === 0;
    }
    return days >= 0 && days <= 7;
  }

  private daysUntil(rawDate: string): number {
    const due = new Date(rawDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private compareTasks(a: PendingTask, b: PendingTask): number {
    if (this.sortBy === 'priority') {
      const pa = a.priority === 'urgent' ? 2 : 1;
      const pb = b.priority === 'urgent' ? 2 : 1;
      return pb - pa;
    }
    if (this.sortBy === 'created_desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (this.sortBy === 'due_desc') {
      return bDue - aDue;
    }
    return aDue - bDue;
  }
}
