import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RegisterRequest, UserProfile } from '../models/auth.models';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'tfg.access_token';
  private readonly refreshKey = 'tfg.refresh_token';
  private readonly storageKey = 'tfg.authenticated';

  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/v1/auth/login — Authenticate user and store JWT tokens.
   */
  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((response) => {
        this.storeTokens(response.accessToken, response.refreshToken);
        return response;
      })
    );
  }

  /**
   * POST /api/v1/auth/register — Register a new user.
   */
  register(request: RegisterRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/auth/register`, request);
  }

  /**
   * POST /api/v1/auth/logout — Invalidate server-side refresh token and clear local tokens.
   */
  logout(): Observable<void> {
    const refresh = this.getRefreshToken();
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, { refreshToken: refresh }).pipe(
      catchError(() => of(undefined)),
      map(() => {
        this.clearTokens();
      })
    );
  }

  /**
   * Check if user is authenticated by validating token presence and expiry.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  /**
   * POST /api/v1/auth/refresh — Refresh access token using refresh token.
   */
  refreshToken(): Observable<string> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return new Observable<string>((observer) => {
        observer.error(new Error('No refresh token available'));
      });
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken: refresh }).pipe(
      map((response) => {
        this.storeTokens(response.accessToken, response.refreshToken);
        return response.accessToken;
      }),
      catchError(() => {
        this.clearTokens();
        return of('');
      })
    );
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
    localStorage.setItem(this.storageKey, 'true');
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.storageKey);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiration;
    } catch {
      return true;
    }
  }
}
