/**
 * Shared API response models matching backend DTOs.
 * Backend: Spring Boot 3.2.5 with Jackson (camelCase JSON).
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  nationalId: string;
  phone: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  nationalId: string;
  phone: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
