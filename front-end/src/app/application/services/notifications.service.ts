import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { NotificationInboxItem } from '../models/notification.models';
import { environment } from '../../../environments/environment';

interface FormalNotificationApiItem {
  id: string;
  procedureId: string;
  caseTitle: string;
  status: 'AVAILABLE' | 'ACCESSED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  typeKey: string;
  subject: string;
  body: string;
  availableAt: string;
  attachments: { id: string; name: string; mimeType: string; size: number; createdAt: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen/notifications/formal`;

  getInbox(): Observable<NotificationInboxItem[]> {
    return this.http.get<FormalNotificationApiItem[]>(this.baseUrl).pipe(
      map((items) => items.map((item) => ({
        id: item.id,
        title: item.subject,
        message: item.body,
        date: item.availableAt,
        read: item.status !== 'AVAILABLE',
        caseId: item.procedureId,
        caseTitle: item.caseTitle,
        typeKey: `NOTIFICATION_TYPE.${item.typeKey}`,
        status: item.status,
        attachments: item.attachments
      } satisfies NotificationInboxItem)))
    );
  }

  markAccessed(id: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/access`, {});
  }

  accept(id: string, notes?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/accept`, { notes: notes ?? '' });
  }

  reject(id: string, notes?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/reject`, { notes: notes ?? '' });
  }

  downloadAttachment(notificationId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${notificationId}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }
}
