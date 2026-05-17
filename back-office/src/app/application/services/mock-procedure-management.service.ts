import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  ManagedProcedure,
  ProcedureRequest,
  ProcedureTranslation,
  ProcedureTranslationRequest
} from '../models/backoffice.models';
import { mockProcedures } from './mock-data';

@Injectable({ providedIn: 'root' })
export class MockProcedureManagementService {
  private readonly procedures = mockProcedures;
  private readonly translations = new Map<string, ProcedureTranslation[]>();

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

  listTranslations(id: string): Observable<ProcedureTranslation[]> {
    return of([...(this.translations.get(id) ?? [])]).pipe(delay(120));
  }

  upsertTranslation(id: string, request: ProcedureTranslationRequest): Observable<ProcedureTranslation> {
    const current = this.translations.get(id) ?? [];
    const existing = current.find((item) => item.locale === request.locale);
    const now = new Date().toISOString();
    const next: ProcedureTranslation = existing
      ? {
          ...existing,
          title: request.title,
          description: request.description,
          unit: request.unit,
          updatedAt: now
        }
      : {
          id: `tr-${Date.now()}-${request.locale}`,
          procedureTypeId: id,
          locale: request.locale,
          title: request.title,
          description: request.description,
          unit: request.unit,
          createdAt: now,
          updatedAt: now
        };

    const updated = existing
      ? current.map((item) => (item.locale === request.locale ? next : item))
      : [...current, next];
    this.translations.set(id, updated);
    return of(next).pipe(delay(120));
  }
}
