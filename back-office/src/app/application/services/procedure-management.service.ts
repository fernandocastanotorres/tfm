import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagedProcedure, ProcedureRequest } from '../models/backoffice.models';

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
}
