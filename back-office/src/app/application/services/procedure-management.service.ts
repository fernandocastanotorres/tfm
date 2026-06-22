import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ManagedProcedure,
  ProcedureRequest,
  ProcedureTranslation,
  ProcedureTranslationRequest,
  FieldI18nGroup,
  FieldI18nEntry,
  FieldI18nUpsertRequest,
  ProcedureTaskTranslation,
  ProcedureTaskTranslationRequest
} from '../models/backoffice.models';

@Injectable({ providedIn: 'root' })
export class ProcedureManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/procedure-types`;
  private readonly catalogUrl = `${environment.apiBaseUrl}/admin/catalog`;

  list(): Observable<ManagedProcedure[]> {
    return this.http.get<ManagedProcedure[]>(this.baseUrl);
  }

  listCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.catalogUrl}/categories`);
  }

  listUnits(): Observable<string[]> {
    return this.http.get<string[]>(`${this.catalogUrl}/units`);
  }

  create(request: ProcedureRequest): Observable<ManagedProcedure> {
    return this.http.post<ManagedProcedure>(this.baseUrl, request);
  }

  update(id: string, request: ProcedureRequest): Observable<ManagedProcedure> {
    return this.http.put<ManagedProcedure>(`${this.baseUrl}/${id}`, request);
  }

  toggleStatus(id: string, status: ManagedProcedure['status']): Observable<ManagedProcedure> {
    return this.http.patch<ManagedProcedure>(`${this.baseUrl}/${id}/status`, { status });
  }

  listTranslations(id: string): Observable<ProcedureTranslation[]> {
    return this.http.get<ProcedureTranslation[]>(`${this.baseUrl}/${id}/translations`);
  }

  upsertTranslation(id: string, request: ProcedureTranslationRequest): Observable<ProcedureTranslation> {
    return this.http.put<ProcedureTranslation>(`${this.baseUrl}/${id}/translations`, request);
  }

  listFieldTranslations(id: string): Observable<FieldI18nGroup[]> {
    return this.http.get<FieldI18nGroup[]>(`${this.baseUrl}/${id}/field-i18n`);
  }

  upsertFieldTranslation(id: string, request: FieldI18nUpsertRequest): Observable<FieldI18nEntry> {
    return this.http.put<FieldI18nEntry>(`${this.baseUrl}/${id}/field-i18n`, request);
  }

  deleteFieldTranslation(id: string, fieldId: string, locale: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/field-i18n/${fieldId}/${locale}`);
  }

  listTaskTranslations(id: string): Observable<ProcedureTaskTranslation[]> {
    return this.http.get<ProcedureTaskTranslation[]>(`${this.baseUrl}/${id}/task-i18n`);
  }

  upsertTaskTranslation(id: string, taskOrderIndex: number, request: ProcedureTaskTranslationRequest): Observable<ProcedureTaskTranslation> {
    return this.http.put<ProcedureTaskTranslation>(`${this.baseUrl}/${id}/task-i18n/${taskOrderIndex}`, request);
  }

  deleteTaskTranslation(id: string, taskOrderIndex: number, locale: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/task-i18n/${taskOrderIndex}/${locale}`);
  }
}
