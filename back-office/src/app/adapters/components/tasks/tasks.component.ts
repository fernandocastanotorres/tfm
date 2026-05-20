import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { PendingTask } from '../../../application/models/backoffice.models';

@Component({
    selector: 'bo-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css'],
    standalone: false
})
export class TasksComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);
  private readonly router = inject(Router);

  tasks: PendingTask[] = [];
  filter: 'all' | 'urgent' | 'unassigned' = 'all';
  isLoading = true;

  ngOnInit(): void {
    this.loadTasks();
  }

  get filteredTasks(): PendingTask[] {
    if (this.filter === 'urgent') {
      return this.tasks.filter(task => task.priority === 'urgent');
    }
    if (this.filter === 'unassigned') {
      return this.tasks.filter(task => !task.assignedTo);
    }
    return this.tasks;
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
}
