import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private readonly storageKey = 'tfg.otp';

  generateOtp(destination: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = {
      destination,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
    return code;
  }

  verifyOtp(code: string): boolean {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return false;
    }

    const payload = JSON.parse(raw) as { code: string; expiresAt: number };
    const valid = payload.code === code && payload.expiresAt > Date.now();
    if (valid) {
      localStorage.removeItem(this.storageKey);
    }
    return valid;
  }
}
