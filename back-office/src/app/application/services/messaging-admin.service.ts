import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MessageAttachmentDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface MessageDto {
  id: string;
  threadId: string;
  senderRole: string;
  senderName: string;
  senderEmail: string;
  content: string;
  templateKey: string | null;
  read: boolean;
  readAt: string | null;
  attachmentCount: number;
  attachments: MessageAttachmentDto[];
  createdAt: string;
}

export interface PagedMessages {
  messages: MessageDto[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface UnreadCounts {
  citizenUnread: number;
  adminUnread: number;
}

export interface UnreadThreadSummary {
  id: string;
  procedureId: string;
  caseTitle: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  totalMessages: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  getThreadMessages(procedureId: string, page: number, size: number): Observable<PagedMessages> {
    return this.http.get<PagedMessages>(`${this.baseUrl}/procedures/${procedureId}/messages`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  sendMessage(procedureId: string, content: string, templateKey?: string, notifyByEmail: boolean = true, files?: File[]): Observable<MessageDto> {
    const formData = new FormData();
    formData.append('content', content);
    if (templateKey) formData.append('templateKey', templateKey);
    formData.append('notifyByEmail', notifyByEmail.toString());
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('files', file));
    }
    return this.http.post<MessageDto>(`${this.baseUrl}/procedures/${procedureId}/messages`, formData);
  }

  downloadAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/procedures/messages/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  getUnreadCounts(): Observable<UnreadCounts> {
    return this.http.get<UnreadCounts>(`${this.baseUrl}/messages/unread-count`);
  }

  getUnreadThreadSummaries(): Observable<UnreadThreadSummary[]> {
    return this.http.get<UnreadThreadSummary[]>(`${this.baseUrl}/messages/unread-threads`);
  }
}
