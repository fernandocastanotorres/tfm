import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CaseItem,
  CaseDetail,
  CaseStatusResponse,
  PagedResponse,
  TaskResolutionRequest,
  PendingTask,
  DashboardStats
} from '../models/backoffice.models';

@Injectable({
  providedIn: 'root'
})
export class AdminCasesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  list(page: number = 0, size: number = 10, sort?: string, status?: string): Observable<PagedResponse<CaseItem>> {
    const params: any = { page: page.toString(), size: size.toString() };
    if (sort) params.sort = sort;
    if (status) params.status = status;
    return this.http.get<PagedResponse<CaseItem>>(`${this.baseUrl}/procedures`, { params });
  }

  getDetail(id: string): Observable<CaseDetail> {
    return this.http.get<CaseDetail>(`${this.baseUrl}/procedures/${id}`);
  }

  updateStatus(id: string, status: string): Observable<CaseStatusResponse> {
    return this.http.patch<CaseStatusResponse>(`${this.baseUrl}/procedures/${id}/status`, null, {
      params: { status }
    });
  }

  reassignCase(id: string, assigneeId: string): Observable<CaseStatusResponse> {
    return this.http.patch<CaseStatusResponse>(`${this.baseUrl}/procedures/${id}/reassign`, null, {
      params: { assigneeId }
    });
  }

  getPendingTasks(): Observable<PendingTask[]> {
    return this.http.get<PendingTask[]>(`${this.baseUrl}/tasks/pending`);
  }

  resolveTask(caseId: string, taskId: string, request: TaskResolutionRequest): Observable<CaseStatusResponse> {
    return this.http.post<CaseStatusResponse>(
      `${this.baseUrl}/procedures/${caseId}/tasks/${taskId}/resolve`,
      request
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }
}
