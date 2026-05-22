import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CaseDetail,
  CaseItem,
  CaseWorkflowGraph,
  CaseStatusResponse,
  DashboardStats,
  DashboardReport,
  PagedResponse,
  PendingTask,
  TaskResolutionRequest
} from '../models/backoffice.models';

@Injectable({
  providedIn: 'root'
})
export class AdminCasesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  list(page: number = 0, size: number = 10, sort?: string, status?: string): Observable<PagedResponse<CaseItem>> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString()
    };
    if (sort) params['sort'] = sort;
    if (status) params['status'] = status;
    return this.http.get<PagedResponse<CaseItem>>(`${this.baseUrl}/procedures`, { params });
  }

  getDetail(id: string): Observable<CaseDetail> {
    return this.http.get<any>(`${this.baseUrl}/procedures/${id}`).pipe(
      map((response: any) => ({
        ...response,
        timeline: (response.timeline ?? []).map((event: any) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          description: event.description,
          actor: event.actor ?? 'Sistema'
        })),
        attachments: (response.attachments ?? []).map((attachment: any) => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size ?? 0,
          uploadedAt: attachment.uploadedAt,
          uploadedBy: attachment.uploadedBy ?? 'Sistema',
          signed: attachment.signed ?? false
        }))
      }))
    );
  }

  updateStatus(id: string, status: string): Observable<CaseStatusResponse> {
    return this.http.patch<any>(`${this.baseUrl}/procedures/${id}/status`, null, { params: { status } }).pipe(
      map((response: any) => ({
        id: response.id,
        status: response.status,
        currentTask: response.currentTask ?? '',
        lastUpdated: response.lastUpdated ?? response.statusUpdatedAt
      }))
    );
  }

  reassignCase(id: string, assigneeId: string): Observable<CaseStatusResponse> {
    return this.http.patch<any>(`${this.baseUrl}/procedures/${id}/reassign`, null, { params: { assigneeId } }).pipe(
      map((response: any) => ({
        id: response.id,
        status: response.status,
        currentTask: response.currentTask ?? '',
        lastUpdated: response.lastUpdated ?? response.statusUpdatedAt
      }))
    );
  }

  getPendingTasks(): Observable<PendingTask[]> {
    return this.http.get<PendingTask[]>(`${this.baseUrl}/tasks/pending`);
  }

  getPendingTasksByCase(caseId: string): Observable<PendingTask[]> {
    return this.http.get<PendingTask[]>(`${this.baseUrl}/tasks/pending`).pipe(
      map((tasks) => tasks.filter((t) => t.caseId === caseId))
    );
  }

  resolveTask(caseId: string, taskId: string, request: TaskResolutionRequest): Observable<CaseStatusResponse> {
    return this.http.post<any>(`${this.baseUrl}/procedures/${caseId}/tasks/${taskId}/resolve`, request).pipe(
      map((response: any) => ({
        id: response.id,
        status: response.status,
        currentTask: response.currentTask ?? '',
        lastUpdated: response.lastUpdated ?? response.statusUpdatedAt
      }))
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  getDashboardReport(from?: string, to?: string): Observable<DashboardReport> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<DashboardReport>(`${this.baseUrl}/dashboard/report`, { params });
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/procedures/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  getWorkflowGraph(caseId: string): Observable<CaseWorkflowGraph> {
    return this.http.get<CaseWorkflowGraph>(`${this.baseUrl}/procedures/${caseId}/workflow-graph`);
  }
}
