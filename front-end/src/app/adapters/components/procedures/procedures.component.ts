import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProceduresService, ProcedureItem } from '../../../application/services/procedures.service';

@Component({
  selector: 'app-procedures',
  templateUrl: './procedures.component.html',
  styleUrls: []
})
export class ProceduresComponent implements OnInit {
  procedures: ProcedureItem[] = [];

  constructor(
    private readonly proceduresService: ProceduresService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.procedures = this.proceduresService.getProcedures();
  }

  startProcedure(procedure: ProcedureItem): void {
    this.router.navigate(['/procedimientos', procedure.id, 'flujo']);
  }
}
