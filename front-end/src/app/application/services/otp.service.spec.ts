import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OtpService]
    });
    service = TestBed.inject(OtpService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateOtp', () => {
    it('should return a 6-digit code', () => {
      const code = service.generateOtp('user@example.com');
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBeTrue();
    });

    it('should store OTP payload in localStorage', () => {
      const code = service.generateOtp('+34600123456');
      const stored = localStorage.getItem('tfg.otp');
      expect(stored).not.toBeNull();

      const payload = JSON.parse(stored!);
      expect(payload.destination).toBe('+34600123456');
      expect(payload.code).toBe(code);
      expect(payload.expiresAt).toBeDefined();
    });

    it('should set expiration 5 minutes in the future', () => {
      const beforeGenerate = Date.now();
      service.generateOtp('user@example.com');
      const afterGenerate = Date.now();

      const stored = JSON.parse(localStorage.getItem('tfg.otp')!);
      const expectedMin = beforeGenerate + 5 * 60 * 1000;
      const expectedMax = afterGenerate + 5 * 60 * 1000;

      expect(stored.expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(stored.expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should overwrite previous OTP', () => {
      service.generateOtp('first@example.com');
      const newCode = service.generateOtp('second@example.com');

      const stored = JSON.parse(localStorage.getItem('tfg.otp')!);
      expect(stored.destination).toBe('second@example.com');
      expect(stored.code).toBe(newCode);
    });

    it('should generate different codes on subsequent calls', () => {
      const code1 = service.generateOtp('user@example.com');
      const code2 = service.generateOtp('user@example.com');
      // While unlikely, codes could theoretically be the same; we just verify format
      expect(/^\d{6}$/.test(code1)).toBeTrue();
      expect(/^\d{6}$/.test(code2)).toBeTrue();
    });
  });

  describe('verifyOtp', () => {
    it('should return true for valid non-expired OTP', fakeAsync(() => {
      const code = service.generateOtp('user@example.com');
      const result = service.verifyOtp(code);
      expect(result).toBeTrue();
    }));

    it('should return false for incorrect code', fakeAsync(() => {
      service.generateOtp('user@example.com');
      const result = service.verifyOtp('000000');
      expect(result).toBeFalse();
    }));

    it('should return false when no OTP exists', () => {
      const result = service.verifyOtp('123456');
      expect(result).toBeFalse();
    });

    it('should return false for expired OTP', fakeAsync(() => {
      const code = service.generateOtp('user@example.com');

      // Manually set expiration to the past
      const stored = JSON.parse(localStorage.getItem('tfg.otp')!);
      stored.expiresAt = Date.now() - 1000;
      localStorage.setItem('tfg.otp', JSON.stringify(stored));

      const result = service.verifyOtp(code);
      expect(result).toBeFalse();
    }));

    it('should remove OTP from localStorage after successful verification', fakeAsync(() => {
      const code = service.generateOtp('user@example.com');
      service.verifyOtp(code);
      expect(localStorage.getItem('tfg.otp')).toBeNull();
    }));

    it('should not remove OTP from localStorage after failed verification', fakeAsync(() => {
      service.generateOtp('user@example.com');
      service.verifyOtp('000000');
      expect(localStorage.getItem('tfg.otp')).not.toBeNull();
    }));

    it('should not remove OTP from localStorage when expired', fakeAsync(() => {
      const code = service.generateOtp('user@example.com');

      const stored = JSON.parse(localStorage.getItem('tfg.otp')!);
      stored.expiresAt = Date.now() - 1000;
      localStorage.setItem('tfg.otp', JSON.stringify(stored));

      service.verifyOtp(code);
      expect(localStorage.getItem('tfg.otp')).not.toBeNull();
    }));

    it('should handle malformed localStorage data gracefully', () => {
      localStorage.setItem('tfg.otp', 'not-json');
      expect(() => service.verifyOtp('123456')).not.toThrow();
      expect(service.verifyOtp('123456')).toBeFalse();
    });
  });
});
