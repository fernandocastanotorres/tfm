import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, BackofficeUserProfile } from '../models/backoffice.models';

const TOKEN_KEY = 'bo_access_token';
const REFRESH_TOKEN_KEY = 'bo_refresh_token';
const USER_KEY = 'bo_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
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
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response: LoginResponse) => {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
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

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return new Observable<string>((observer) => {
        observer.error(new Error('No refresh token available'));
      });
    }

    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }),
      map((response) => response.accessToken)
    );
  }
}
