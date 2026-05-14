import { Injectable } from '@angular/core';

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
  getProfile(): ProfileData {
    return {
      fullName: 'María López',
      email: 'maria.lopez@example.com',
      phone: '600123456',
      nationalId: '12345678A',
      address: 'Calle Mayor 10, Madrid'
    };
  }
}
