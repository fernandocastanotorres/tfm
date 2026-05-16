import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { BackofficeUser, CreateUserRequest, UpdateUserRequest } from '../models/backoffice.models';
import { mockBackofficeUsers } from './mock-data';

@Injectable({ providedIn: 'root' })
export class MockUserManagementService {
  private readonly users = mockBackofficeUsers;

  list(): Observable<BackofficeUser[]> {
    return of([...this.users]).pipe(delay(250));
  }

  create(request: CreateUserRequest): Observable<BackofficeUser> {
    const user: BackofficeUser = {
      id: `user-${Date.now()}`,
      email: request.email,
      roles: [...request.roles],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: request.isActive
    };
    this.users.unshift(user);
    return of(user).pipe(delay(300));
  }

  update(id: string, request: UpdateUserRequest): Observable<BackofficeUser> {
    const index = this.users.findIndex(user => user.id === id);
    if (index >= 0) {
      this.users[index] = { ...this.users[index], ...request };
    }
    return of(this.users[index]).pipe(delay(300));
  }

  toggleActive(id: string, isActive: boolean): Observable<BackofficeUser> {
    const user = this.users.find(item => item.id === id)!;
    user.isActive = isActive;
    return of(user).pipe(delay(250));
  }
}
