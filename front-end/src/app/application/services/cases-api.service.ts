import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MockCitizenFlowService } from './mock-citizen-flow.service';
import {
  CaseItem,
  CaseDetail,
  CaseStatusResponse,
  CreateCaseRequest,
  AmendCaseRequest,
  PagedResponse
} from '../models/case.models';

@Injectable({
  providedIn: 'root'
})
export class CasesApiService {
  private readonly http = inject(HttpClient);
  private readonly mockCitizenFlowService = inject(MockCitizenFlowService);
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/procedures`;

  private mapCaseItem(raw: any): CaseItem {
    return {
      id: raw.id,
      procedureType: raw.category ?? raw.procedureType ?? 'Procedimiento',
      status: raw.status,
      createdAt: raw.submittedAt ?? raw.lastUpdated,
      lastUpdated: raw.lastUpdated,
      title: raw.title,
      description: raw.description ?? '',
      assignedUnit: raw.assignedUnit ?? ''
    };
  }

  private mapCaseDetail(raw: any): CaseDetail {
    return {
      id: raw.id,
      procedureType: raw.category ?? raw.procedureType ?? 'Procedimiento',
      status: raw.status,
      createdAt: raw.submittedAt ?? raw.lastUpdated,
      lastUpdated: raw.lastUpdated ?? raw.submittedAt,
      title: raw.title,
      description: raw.description ?? '',
      currentTask: raw.currentTask ?? '',
      assignedUnit: raw.assignedUnit ?? '',
      timeline: raw.timeline ?? [],
      attachments: (raw.attachments ?? []).map((attachment: any) => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type ?? attachment.mimeType,
        size: attachment.size,
        uploadedAt: attachment.uploadedAt
      }))
    };
  }

  private mapStatus(raw: any): CaseStatusResponse {
    return {
      id: raw.id,
      status: raw.status,
      currentTask: raw.currentTask ?? '',
      lastUpdated: raw.lastUpdated ?? raw.statusUpdatedAt
    };
  }

  /**
   * GET /api/v1/citizen/procedures — List citizen cases with pagination.
   */
  list(page: number = 0, size: number = 10, sort?: string): Observable<PagedResponse<CaseItem>> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.listCases(page, size);
    }

    const params: any = { page: page.toString(), size: size.toString() };
    if (sort) {
      params.sort = sort;
    }
    return this.http.get<PagedResponse<any>>(this.baseUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((item) => this.mapCaseItem(item))
      }))
    );
  }

  /**
   * GET /api/v1/citizen/procedures/{id} — Get case detail with timeline and attachments.
   */
  getDetail(id: string): Observable<CaseDetail> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getCaseDetail(id);
    }
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((response) => this.mapCaseDetail(response))
    );
  }

  /**
   * GET /api/v1/citizen/procedures/{id}/status — Get case status.
   */
  getStatus(id: string): Observable<CaseStatusResponse> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getCaseStatus(id);
    }
    return this.http.get<any>(`${this.baseUrl}/${id}/status`).pipe(
      map((response) => this.mapStatus(response))
    );
  }

  /**
   * POST /api/v1/citizen/procedures — Create a new case draft.
   */
  create(request: CreateCaseRequest): Observable<CaseItem> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.createCase(request);
    }
    const backendRequest = {
      procedureId: request.procedureId,
      formData: request.formData,
      documentIds: []
    };
    return this.http.post<any>(this.baseUrl, backendRequest).pipe(
      map((response) => this.mapCaseItem(response))
    );
  }

  /**
   * POST /api/v1/citizen/procedures/{id}/submit — Submit a case.
   */
  submit(id: string): Observable<CaseStatusResponse> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.submitCase(id);
    }
    return this.http.post<any>(`${this.baseUrl}/${id}/submit`, {}).pipe(
      map((response) => this.mapStatus(response))
    );
  }

  /**
   * POST /api/v1/citizen/procedures/{id}/amend — Request amendment for a case.
   */
  amend(id: string, request: AmendCaseRequest): Observable<CaseStatusResponse> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.amendCase(id, request);
    }
    const backendRequest = {
      procedureId: 'amendment',
      formData: request.formData ?? {},
      documentIds: []
    };
    return this.http.post<any>(`${this.baseUrl}/${id}/amend`, backendRequest).pipe(
      map((response) => this.mapStatus(response))
    );
  }
}
