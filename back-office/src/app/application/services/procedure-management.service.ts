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
  FieldI18nUpsertRequest
} from '../models/backoffice.models';

@Injectable({ providedIn: 'root' })
export class ProcedureManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/procedure-types`;

  list(): Observable<ManagedProcedure[]> {
    return this.http.get<ManagedProcedure[]>(this.baseUrl);
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
}
