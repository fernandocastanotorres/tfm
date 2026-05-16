import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  CaseItem,
  CaseDetail,
  CaseStatusResponse,
  PagedResponse,
  TaskResolutionRequest,
  PendingTask,
  DashboardStats
} from '../models/backoffice.models';
import {
  mockCases,
  mockCaseDetails,
  mockDashboardStats,
  mockPendingTasks,
  getPagedCases
} from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class MockAdminCasesService {

  list(page: number = 0, size: number = 10, sort?: string, status?: string): Observable<PagedResponse<CaseItem>> {
    const result = getPagedCases(page, size, status);
    return of(result).pipe(delay(400));
  }

  getDetail(id: string): Observable<CaseDetail> {
    const detail = mockCaseDetails[id];
    if (!detail) {
      const fallback: CaseDetail = {
        id,
        procedureType: 'Desconocido',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        title: 'Expediente ' + id.substring(0, 8),
        description: '',
        currentTask: '',
        assignedUnit: '',
        assignedTo: null,
        citizenName: 'Ciudadano Ejemplo',
        citizenEmail: 'ejemplo@email.es',
        timeline: [],
        attachments: [],
        formData: {}
      };
      return of(fallback).pipe(delay(300));
    }
    return of(detail).pipe(delay(300));
  }

  updateStatus(id: string, status: string): Observable<CaseStatusResponse> {
    const caseItem = mockCases.find(c => c.id === id);
    if (caseItem) {
      caseItem.status = status;
      caseItem.lastUpdated = new Date().toISOString();
    }
    return of({
      id,
      status,
      currentTask: caseItem?.currentTask || '',
      lastUpdated: new Date().toISOString()
    }).pipe(delay(500));
  }

  reassignCase(id: string, assigneeId: string): Observable<CaseStatusResponse> {
    const caseItem = mockCases.find(c => c.id === id);
    if (caseItem) {
      caseItem.assignedTo = assigneeId;
      caseItem.lastUpdated = new Date().toISOString();
    }
    return of({
      id,
      status: caseItem?.status || 'IN_PROGRESS',
      currentTask: caseItem?.currentTask || '',
      lastUpdated: new Date().toISOString()
    }).pipe(delay(500));
  }

  getPendingTasks(): Observable<PendingTask[]> {
    return of(mockPendingTasks).pipe(delay(400));
  }

  resolveTask(caseId: string, taskId: string, request: TaskResolutionRequest): Observable<CaseStatusResponse> {
    const caseItem = mockCases.find(c => c.id === caseId);
    const newStatus = request.action === 'approve' ? 'RESOLVED'
      : request.action === 'reject' ? 'REJECTED'
        : request.action === 'request_amendment' ? 'PENDING_AMENDMENT'
          : 'IN_PROGRESS';

    if (caseItem) {
      caseItem.status = newStatus;
      caseItem.lastUpdated = new Date().toISOString();
    }

    return of({
      id: caseId,
      status: newStatus,
      currentTask: '',
      lastUpdated: new Date().toISOString()
    }).pipe(delay(600));
  }

  getDashboardStats(): Observable<DashboardStats> {
    return of(mockDashboardStats).pipe(delay(300));
  }
}
