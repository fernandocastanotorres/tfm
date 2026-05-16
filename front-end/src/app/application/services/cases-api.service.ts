import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<PagedResponse<CaseItem>>(this.baseUrl, { params });
  }

  /**
   * GET /api/v1/citizen/procedures/{id} — Get case detail with timeline and attachments.
   */
  getDetail(id: string): Observable<CaseDetail> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getCaseDetail(id);
    }
    return this.http.get<CaseDetail>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/v1/citizen/procedures/{id}/status — Get case status.
   */
  getStatus(id: string): Observable<CaseStatusResponse> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.getCaseStatus(id);
    }
    return this.http.get<CaseStatusResponse>(`${this.baseUrl}/${id}/status`);
  }

  /**
   * POST /api/v1/citizen/procedures — Create a new case draft.
   */
  create(request: CreateCaseRequest): Observable<CaseItem> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.createCase(request);
    }
    return this.http.post<CaseItem>(this.baseUrl, request);
  }

  /**
   * POST /api/v1/citizen/procedures/{id}/submit — Submit a case.
   */
  submit(id: string): Observable<CaseStatusResponse> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.submitCase(id);
    }
    return this.http.post<CaseStatusResponse>(`${this.baseUrl}/${id}/submit`, {});
  }

  /**
   * POST /api/v1/citizen/procedures/{id}/amend — Request amendment for a case.
   */
  amend(id: string, request: AmendCaseRequest): Observable<CaseStatusResponse> {
    if (environment.useMockCitizenFlow) {
      return this.mockCitizenFlowService.amendCase(id, request);
    }
    return this.http.post<CaseStatusResponse>(`${this.baseUrl}/${id}/amend`, request);
  }
}
