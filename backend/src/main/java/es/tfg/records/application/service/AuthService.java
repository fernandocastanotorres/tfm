package es.tfg.records.application.service;

import es.tfg.records.application.dto.*;

import java.util.UUID;

/**
 * Application service port for authentication and user management operations.
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserProfile register(RegisterRequest request);

    LoginResponse refreshToken(TokenRefreshRequest request);

    void forgotPassword(PasswordResetRequest request);

    void resendVerificationEmail(PasswordResetRequest request);

    void verifyOtp(OtpRequest request);

    void resetPassword(PasswordResetConfirmRequest request);

    void logout(String refreshToken);

    void verifyEmailToken(String token);

    UserProfile getProfile(UUID userId);

    UserProfile updateProfile(UUID userId, UpdateCitizenProfileRequest request);
}
