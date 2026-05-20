import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureItem } from '../../../application/models/procedure.models';
import { ToastService } from '../../../application/services/toast.service';

@Component({
    selector: 'app-procedures',
    templateUrl: './procedures.component.html',
    styleUrls: [],
    standalone: false
})
export class ProceduresComponent implements OnInit {
  procedures: ProcedureItem[] = [];
  isLoading = true;

  constructor(
    private readonly proceduresApiService: ProceduresApiService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.proceduresApiService.listAll().subscribe({
      next: (data) => {
        this.procedures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error('Error', err?.error?.message ?? 'No se han podido cargar los procedimientos.');
        this.isLoading = false;
      }
    });
  }

  startProcedure(procedure: ProcedureItem): void {
    this.router.navigate(['/sede/expedientes/nuevo', procedure.id]);
  }
}
