import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly authBaseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.authBaseUrl}/me`);
  }

  updateProfile(profile: Omit<ProfileData, 'email'>): Observable<ProfileData> {
    return this.http.put<ProfileData>(`${this.authBaseUrl}/me`, profile);
  }
}
