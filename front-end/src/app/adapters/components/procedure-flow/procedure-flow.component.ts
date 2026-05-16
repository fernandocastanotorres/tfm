import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureDetail, ProcedureTaskDto } from '../../../application/models/procedure.models';

@Component({
  selector: 'app-procedure-flow',
  templateUrl: './procedure-flow.component.html',
  styleUrls: []
})
export class ProcedureFlowComponent implements OnInit {
  procedure: ProcedureDetail | null = null;
  tasks: ProcedureTaskDto[] = [];
  currentTaskIndex = 0;
  currentTask: ProcedureTaskDto | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly proceduresApiService: ProceduresApiService
  ) {}

  ngOnInit(): void {
    const procedureSlug = this.route.snapshot.paramMap.get('procedureId');
    if (!procedureSlug) {
      this.router.navigate(['/sede/procedimientos']);
      return;
    }

    this.proceduresApiService.getBySlug(procedureSlug).subscribe({
      next: (data) => {
        this.procedure = data;
        this.tasks = data.tasks ?? [];
        this.currentTaskIndex = 0;
        this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'PROCEDURE_FLOW.ERROR_LOAD';
        this.isLoading = false;
      }
    });
  }

  nextTask(): void {
    if (!this.procedure) {
      return;
    }
    this.currentTaskIndex = Math.min(this.currentTaskIndex + 1, this.tasks.length - 1);
    this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
  }

  previousTask(): void {
    if (!this.procedure) {
      return;
    }
    this.currentTaskIndex = Math.max(this.currentTaskIndex - 1, 0);
    this.currentTask = this.tasks[this.currentTaskIndex] ?? null;
  }

  get taskStepLabel(): string {
    if (!this.procedure) {
      return '';
    }
    return `${this.currentTaskIndex + 1} / ${this.tasks.length}`;
  }

  getTaskTypeHint(type: string): string {
    switch (type) {
      case 'form':
        return 'PROCEDURE_FLOW.HINT_FORM';
      case 'upload':
        return 'PROCEDURE_FLOW.HINT_UPLOAD';
      case 'review':
        return 'PROCEDURE_FLOW.HINT_REVIEW';
      default:
        return '';
    }
  }
}
