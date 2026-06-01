import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureDetail, ProcedureTaskDto } from '../../../application/models/procedure.models';
import { ToastService } from '../../../application/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { SkeletonScreenComponent } from '../../../shared/components/skeleton-screen/skeleton-screen.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-procedure-flow',
    templateUrl: './procedure-flow.component.html',
    imports: [NgIf, SkeletonScreenComponent, RouterLink, TranslatePipe]
})
export class ProcedureFlowComponent implements OnInit {
  procedure: ProcedureDetail | null = null;
  tasks: ProcedureTaskDto[] = [];
  currentTaskIndex = 0;
  currentTask: ProcedureTaskDto | null = null;
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly proceduresApiService: ProceduresApiService,
    private readonly toast: ToastService,
    private readonly translate: TranslateService
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
        this.isLoading = false;
      },
      error: () => {
        this.toast.error(this.translate.instant('COMMON.ERROR'), this.translate.instant('COMMON.ERROR_LOAD_PROCEDURE'));
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

  toCaseStatusKey(status: string): string {
    return (status ?? '').trim().replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
  }
}
