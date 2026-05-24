import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, BackofficeUserProfile } from '../models/backoffice.models';

const TOKEN_KEY = 'bo_access_token';
const REFRESH_TOKEN_KEY = 'bo_refresh_token';
const USER_KEY = 'bo_user_profile';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<BackofficeUserProfile | null>(null);

  constructor() {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem(USER_KEY);
      }
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
        sessionStorage.setItem(TOKEN_KEY, response.accessToken);
        sessionStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    const refresh = this.getRefreshToken();
    if (refresh) {
      this.http.post<void>(`${this.baseUrl}/logout`, { refreshToken: refresh }).pipe(
        catchError(() => of(undefined))
      ).subscribe();
    }
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem(TOKEN_KEY);
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
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
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
        sessionStorage.setItem(TOKEN_KEY, response.accessToken);
        sessionStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }),
      map((response) => response.accessToken)
    );
  }
}
