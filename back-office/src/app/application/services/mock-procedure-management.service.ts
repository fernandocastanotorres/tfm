import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ManagedProcedure, ProcedureRequest } from '../models/backoffice.models';
import { mockProcedures } from './mock-data';

@Injectable({ providedIn: 'root' })
export class MockProcedureManagementService {
  private readonly procedures = mockProcedures;

  list(): Observable<ManagedProcedure[]> {
    return of([...this.procedures]).pipe(delay(250));
  }

  create(request: ProcedureRequest): Observable<ManagedProcedure> {
    const procedure: ManagedProcedure = {
      id: `proc-${Date.now()}`,
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.procedures.unshift(procedure);
    return of(procedure).pipe(delay(300));
  }

  update(id: string, request: ProcedureRequest): Observable<ManagedProcedure> {
    const index = this.procedures.findIndex(procedure => procedure.id === id);
    if (index >= 0) {
      this.procedures[index] = {
        ...this.procedures[index],
        ...request,
        updatedAt: new Date().toISOString()
      };
    }
    return of(this.procedures[index]).pipe(delay(300));
  }

  toggleStatus(id: string, status: ManagedProcedure['status']): Observable<ManagedProcedure> {
    const procedure = this.procedures.find(item => item.id === id)!;
    procedure.status = status;
    procedure.updatedAt = new Date().toISOString();
    return of(procedure).pipe(delay(250));
  }
}
