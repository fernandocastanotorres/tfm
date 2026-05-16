import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackofficeUser, CreateUserRequest, UpdateUserRequest } from '../models/backoffice.models';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/users`;

  list(): Observable<BackofficeUser[]> {
    return this.http.get<BackofficeUser[]>(this.baseUrl);
  }

  create(request: CreateUserRequest): Observable<BackofficeUser> {
    return this.http.post<BackofficeUser>(this.baseUrl, request);
  }

  update(id: string, request: UpdateUserRequest): Observable<BackofficeUser> {
    return this.http.put<BackofficeUser>(`${this.baseUrl}/${id}`, request);
  }

  toggleActive(id: string, isActive: boolean): Observable<BackofficeUser> {
    return this.http.patch<BackofficeUser>(`${this.baseUrl}/${id}/status`, { isActive });
  }
}
