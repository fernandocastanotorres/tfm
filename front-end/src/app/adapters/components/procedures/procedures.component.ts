import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProceduresApiService } from '../../../application/services/procedures-api.service';
import { ProcedureItem } from '../../../application/models/procedure.models';

@Component({
  selector: 'app-procedures',
  templateUrl: './procedures.component.html',
  styleUrls: []
})
export class ProceduresComponent implements OnInit {
  procedures: ProcedureItem[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private readonly proceduresApiService: ProceduresApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.proceduresApiService.listAll().subscribe({
      next: (data) => {
        this.procedures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'PROCEDURES.ERROR_LOAD';
        this.isLoading = false;
      }
    });
  }

  startProcedure(procedure: ProcedureItem): void {
    this.router.navigate(['/sede/expedientes/nuevo', procedure.id]);
  }
}
