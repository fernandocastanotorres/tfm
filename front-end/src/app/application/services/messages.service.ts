import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageThreadSummary, MessageAttachmentDto, MessageDto, PagedMessages } from '../models/message.models';

export { MessageThreadSummary, MessageAttachmentDto, MessageDto, PagedMessages };

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/citizen`;

  getThreads(): Observable<MessageThreadSummary[]> {
    return this.http.get<MessageThreadSummary[]>(`${this.baseUrl}/messages/threads`);
  }

  getThreadMessages(procedureId: string, page: number, size: number): Observable<PagedMessages> {
    return this.http.get<PagedMessages>(`${this.baseUrl}/procedures/${procedureId}/messages`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  sendMessage(
    procedureId: string,
    content: string,
    templateKey?: string,
    notifyByEmail: boolean = true,
    files?: File[]
  ): Observable<MessageDto> {
    const formData = new FormData();
    formData.append('content', content);
    if (templateKey) formData.append('templateKey', templateKey);
    formData.append('notifyByEmail', notifyByEmail.toString());
    if (files) {
      files.forEach((file) => formData.append('files', file));
    }
    return this.http.post<MessageDto>(`${this.baseUrl}/procedures/${procedureId}/messages`, formData);
  }

  downloadAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/procedures/messages/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/messages/unread-count`);
  }
}
