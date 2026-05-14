import { Injectable } from '@angular/core';

export interface AuthCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'tfg.authenticated';

  login(credentials: AuthCredentials): boolean {
    if (!credentials.email || !credentials.password) {
      return false;
    }

    localStorage.setItem(this.storageKey, 'true');
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.storageKey) === 'true';
  }
}
