import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject, delay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  BackofficeUserProfile
} from '../models/backoffice.models';
import { mockAdminUser, mockTramitadorUser } from './mock-data';

const TOKEN_KEY = 'bo_access_token';
const REFRESH_TOKEN_KEY = 'bo_refresh_token';
const USER_KEY = 'bo_user';

const MOCK_USERS: Record<string, BackofficeUserProfile> = {
  'admin@tfg.es': mockAdminUser,
  'tramitador@tfg.es': mockTramitadorUser
};

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@tfg.es': 'Admin1234',
  'tramitador@tfg.es': 'Tramitador1'
};

const MOCK_TOKEN = 'mock-jwt-token-' + Date.now();
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-' + Date.now();

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private readonly currentUserSubject = new BehaviorSubject<BackofficeUserProfile | null>(null);

  constructor() {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser$() {
    return this.currentUserSubject.asObservable();
  }

  get currentUser(): BackofficeUserProfile | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    const user = MOCK_USERS[request.email];
    const password = MOCK_PASSWORDS[request.email];

    if (!user || request.password !== password) {
      return throwError(() => new Error('Credenciales invalidas')).pipe(delay(500));
    }

    const response: LoginResponse = {
      accessToken: MOCK_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
      expiresIn: 900,
      user
    };

    return of(response).pipe(
      delay(800),
      tap(() => {
        localStorage.setItem(TOKEN_KEY, MOCK_TOKEN);
        localStorage.setItem(REFRESH_TOKEN_KEY, MOCK_REFRESH_TOKEN);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const roleName = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.includes(roleName);
  }

  isTramitador(): boolean {
    return this.hasRole('ROLE_TRAMITADOR');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
