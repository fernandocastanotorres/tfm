import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { TaskResolutionRequest } from '../../../application/models/backoffice.models';

@Component({
  selector: 'bo-task-resolution',
  templateUrl: './task-resolution.component.html',
  styleUrls: ['./task-resolution.component.css']
})
export class TaskResolutionComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  resolutionForm: FormGroup = this.fb.group({
    action: ['approve', Validators.required],
    notes: ['', Validators.required]
  });

  caseId = '';
  taskId = '';
  isLoading = false;
  success = false;

  actionOptions = [
    { value: 'approve', label: 'Aprobar' },
    { value: 'reject', label: 'Rechazar' },
    { value: 'request_amendment', label: 'Solicitar Subsanacion' },
    { value: 'reassign', label: 'Reasignar' }
  ];

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('id') || '';
    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
  }

  onSubmit(): void {
    if (this.resolutionForm.invalid) return;

    this.isLoading = true;
    const request: TaskResolutionRequest = this.resolutionForm.value;

    this.adminCasesService.resolveTask(this.caseId, this.taskId, request).subscribe({
      next: () => {
        this.success = true;
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/cases', this.caseId]);
        }, 2000);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
