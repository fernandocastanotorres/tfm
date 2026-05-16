package es.tfg.records.application.service;

import es.tfg.records.application.dto.*;

/**
 * Application service port for authentication and user management operations.
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserProfile register(RegisterRequest request);

    LoginResponse refreshToken(TokenRefreshRequest request);

    void forgotPassword(PasswordResetRequest request);

    void verifyOtp(OtpRequest request);

    void resetPassword(PasswordResetConfirmRequest request);

    void logout(String refreshToken);
}
