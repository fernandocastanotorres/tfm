import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
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
    const submittedAt = raw.submittedAt ?? raw.createdAt ?? raw.lastUpdated;
    const fallbackTimeline = submittedAt
      ? [{
          id: `${raw.id}-submitted`,
          title: 'Expediente enviado',
          date: submittedAt,
          description: 'La solicitud ha sido registrada y enviada para su tramitacion.'
        }]
      : [];

    return {
      id: raw.id,
      procedureType: raw.category ?? raw.procedureType ?? 'Procedimiento',
      status: raw.status,
      createdAt: submittedAt,
      lastUpdated: raw.lastUpdated ?? submittedAt,
      title: raw.title,
      description: raw.description ?? '',
      currentTask: raw.currentTask ?? '',
      assignedUnit: raw.assignedUnit ?? '',
      timeline: raw.timeline?.length ? raw.timeline : fallbackTimeline,
      attachments: (raw.attachments ?? []).map((attachment: any) => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type ?? attachment.mimeType,
        size: attachment.size,
        uploadedAt: attachment.uploadedAt,
        signed: attachment.signed ?? false
      })),
      procedureTypeId: raw.procedureTypeId ?? '',
      formData: raw.formData ?? null
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
    const params = new HttpParams().set('ts', Date.now());
    return this.http.get<any>(`${this.baseUrl}/${id}`, { params }).pipe(
      map((response) => this.mapCaseDetail(response)),
      switchMap((detail) =>
        this.listDocuments(id).pipe(
          map((documents) => ({
            ...detail,
            attachments: documents.length > 0 ? documents : detail.attachments
          }))
        )
      )
    );
  }

  listDocuments(caseId: string): Observable<CaseDetail['attachments']> {
    const params = new HttpParams().set('ts', Date.now());
    return this.http.get<any[]>(`${this.baseUrl}/${caseId}/documents`, { params }).pipe(
      map((docs) => docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.mimeType ?? doc.type ?? 'application/octet-stream',
        size: doc.size ?? 0,
        uploadedAt: doc.uploadedAt ?? doc.createdAt ?? new Date().toISOString(),
        signed: doc.signed ?? false
      })))
    );
  }

  uploadDocument(caseId: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.baseUrl}/${caseId}/documents`, formData);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${documentId}/download`, { responseType: 'blob' });
  }

  downloadReceipt(caseId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${caseId}/receipt`, { responseType: 'blob' });
  }

  /**
   * GET /api/v1/citizen/procedures/{id}/enidoc — Download ENI-compliant electronic file package.
   */
  downloadEniDoc(caseId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${caseId}/enidoc`, { responseType: 'blob' });
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
   * PUT /api/v1/citizen/procedures/{id} — Update a draft case.
   */
  updateDraft(id: string, request: CreateCaseRequest): Observable<CaseStatusResponse> {
    const backendRequest = {
      procedureId: request.procedureId,
      formData: request.formData,
      documentIds: []
    };
    return this.http.put<any>(`${this.baseUrl}/${id}`, backendRequest).pipe(
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
