import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TransparencyReport {
  id: string;
  title: string;
  year: number;
  description: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReportRequest {
  title?: string;
  year?: number;
  description?: string;
  sortOrder?: number;
  published?: boolean;
}

export interface CreateReportRequest {
  file: File;
  title: string;
  year: number;
  description?: string;
  sortOrder?: number;
  published?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TransparencyManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/transparency/reports`;

  listReports(): Observable<TransparencyReport[]> {
    return this.http.get<TransparencyReport[]>(this.baseUrl);
  }

  createReport(request: CreateReportRequest): Observable<TransparencyReport> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('title', request.title);
    formData.append('year', String(request.year));
    if (request.description) formData.append('description', request.description);
    if (request.sortOrder !== undefined) formData.append('sortOrder', String(request.sortOrder));
    formData.append('published', String(request.published));
    return this.http.post<TransparencyReport>(this.baseUrl, formData);
  }

  updateReport(id: string, request: UpdateReportRequest): Observable<TransparencyReport> {
    return this.http.put<TransparencyReport>(`${this.baseUrl}/${id}`, request);
  }

  replaceFile(id: string, file: File): Observable<TransparencyReport> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<TransparencyReport>(`${this.baseUrl}/${id}/file`, formData);
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  downloadReport(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }
}
