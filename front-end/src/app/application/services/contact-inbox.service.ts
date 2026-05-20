import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactMessageDto {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  category: string | null;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactInboxService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/contact-messages`;

  listMessages(): Observable<ContactMessageDto[]> {
    return this.http.get<ContactMessageDto[]>(this.baseUrl);
  }

  getMessage(id: string): Observable<ContactMessageDto> {
    return this.http.get<ContactMessageDto>(`${this.baseUrl}/${id}`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count`);
  }
}
