import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProceduresService, ProcedureItem, ProcedureTask } from '../../../application/services/procedures.service';

@Component({
  selector: 'app-procedure-flow',
  templateUrl: './procedure-flow.component.html',
  styleUrls: []
})
export class ProcedureFlowComponent implements OnInit {
  procedure: ProcedureItem | null = null;
  currentTaskIndex = 0;
  currentTask: ProcedureTask | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly proceduresService: ProceduresService
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
    this.currentTaskIndex = 0;
    this.currentTask = procedure.tasks[this.currentTaskIndex] ?? null;
  }

  nextTask(): void {
    if (!this.procedure) {
      return;
    }
    this.currentTaskIndex = Math.min(this.currentTaskIndex + 1, this.procedure.tasks.length - 1);
    this.currentTask = this.procedure.tasks[this.currentTaskIndex] ?? null;
  }

  previousTask(): void {
    if (!this.procedure) {
      return;
    }
    this.currentTaskIndex = Math.max(this.currentTaskIndex - 1, 0);
    this.currentTask = this.procedure.tasks[this.currentTaskIndex] ?? null;
  }

  get taskStepLabel(): string {
    if (!this.procedure) {
      return '';
    }
    return `${this.currentTaskIndex + 1} / ${this.procedure.tasks.length}`;
  }
}
