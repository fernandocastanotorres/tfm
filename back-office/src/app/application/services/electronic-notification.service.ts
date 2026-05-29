import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CitizenOption {
  id: string;
  email: string;
  displayName: string | null;
  nationalId: string | null;
}

export interface CitizenCaseOption {
  id: string;
  title: string;
  procedureType: string;
  status: string;
  createdAt: string;
}

export interface FormalNotificationAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface AdminNotificationItem {
  id: string;
  citizenId: string;
  citizenEmail: string;
  citizenDisplayName: string | null;
  procedureId: string;
  caseTitle: string;
  recordNumber: string | null;
  status: string;
  typeKey: string;
  subject: string;
  body: string;
  availableAt: string;
  expiresAt: string;
  accessedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  resolutionNotes: string | null;
  attachmentCount: number;
  attachments: FormalNotificationAttachment[];
}

export interface AdminNotificationPage {
  items: AdminNotificationItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface FormalNotificationItem {
  id: string;
  citizenId: string;
  procedureId: string;
  caseTitle: string;
  status: string;
  typeKey: string;
  subject: string;
  body: string;
  availableAt: string;
  expiresAt: string;
  accessedAt: string | null;
  resolvedAt: string | null;
  expiredAt: string | null;
  attachments: FormalNotificationAttachment[];
}

@Injectable({ providedIn: 'root' })
export class ElectronicNotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  listCitizens(search?: string): Observable<CitizenOption[]> {
    const url = search 
      ? `${this.baseUrl}/notifications/citizens?search=${encodeURIComponent(search)}`
      : `${this.baseUrl}/notifications/citizens`;
    return this.http.get<CitizenOption[]>(url);
  }

  listCitizenCases(citizenId: string): Observable<CitizenCaseOption[]> {
    return this.http.get<CitizenCaseOption[]>(`${this.baseUrl}/notifications/citizens/${citizenId}/cases`);
  }

  listAllNotifications(page: number, size: number, status?: string): Observable<AdminNotificationPage> {
    let url = `${this.baseUrl}/notifications/formal?page=${page}&size=${size}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return this.http.get<AdminNotificationPage>(url);
  }

  sendFormalNotification(
    citizenId: string,
    procedureId: string,
    templateKey: string,
    subject: string,
    body: string,
    dueDays: number,
    notifyByEmail: boolean,
    files: File[]
  ): Observable<FormalNotificationItem> {
    const formData = new FormData();
    formData.append('citizenId', citizenId);
    formData.append('procedureId', procedureId);
    formData.append('typeKey', templateKey);
    formData.append('subject', subject);
    formData.append('body', body);
    formData.append('dueDays', String(dueDays));
    formData.append('notifyByEmail', String(notifyByEmail));
    files.forEach((file) => formData.append('files', file));
    return this.http.post<FormalNotificationItem>(`${this.baseUrl}/notifications/formal`, formData);
  }
}
