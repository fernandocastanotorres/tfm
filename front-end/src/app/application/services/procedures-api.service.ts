import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import {
  ProcedureItem,
  ProcedureDetail,
  ProcedureTaskDto
} from '../models/procedure.models';

@Injectable({
  providedIn: 'root'
})
export class ProceduresApiService {
  private readonly http = inject(HttpClient);
  private readonly mockCitizenFlowService = inject(MockCitizenFlowService);
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/procedures/catalog`;

  /**
   * GET /api/v1/citizen/procedures/catalog — List all available procedures.
   */
  listAll(): Observable<ProcedureItem[]> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.listProcedures();
    }
    return this.http.get<ProcedureItem[]>(this.baseUrl);
  }

  /**
   * GET /api/v1/citizen/procedures/catalog/{slug} — Get procedure detail with tasks.
   */
  getBySlug(slug: string): Observable<ProcedureDetail> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getProcedureBySlug(slug);
    }
    return this.http.get<ProcedureDetail>(`${this.baseUrl}/${slug}`);
  }

  /**
   * GET /api/v1/citizen/procedures/catalog/{slug}/form-schema — Get form schema for procedure.
   */
  getFormSchema(slug: string): Observable<ProcedureTaskDto[]> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getFormSchema(slug);
    }
    return this.http.get<ProcedureTaskDto[]>(`${this.baseUrl}/${slug}/form-schema`);
  }

  /**
   * GET /api/v1/citizen/procedures/catalog/{slug}/tasks/{taskId}/schema — Get schema for a specific task.
   */
  getTaskSchema(slug: string, taskId: string): Observable<ProcedureTaskDto> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getTaskSchema(slug, taskId);
    }
    return this.http.get<ProcedureTaskDto>(`${this.baseUrl}/${slug}/tasks/${taskId}/schema`);
  }
}
