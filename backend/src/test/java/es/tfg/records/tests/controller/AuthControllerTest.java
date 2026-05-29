package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.*;
import es.tfg.records.application.exception.ValidationException;
import es.tfg.records.application.service.AuthService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.AuthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void login_shouldReturn200() throws Exception {
        UserProfile user = new UserProfile(UUID.randomUUID(), "citizen@example.com", "Citizen", "12345678A", "600123456", "Calle Mayor 10", List.of("ROLE_CITIZEN"));
        LoginResponse response = new LoginResponse("access", "refresh", 900, user);
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("citizen@example.com", "Password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access"))
                .andExpect(jsonPath("$.user.email").value("citizen@example.com"));
    }

    @Test
    void register_shouldReturn201() throws Exception {
        UserProfile profile = new UserProfile(UUID.randomUUID(), "new@example.com", "New User", "12345678A", "600123456", "Calle Mayor 10", List.of("ROLE_CITIZEN"));
        when(authService.register(any(RegisterRequest.class))).thenReturn(profile);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("new@example.com", "New User", "12345678A", "600123456", "Calle Mayor 10", "Password123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    void forgotPassword_shouldReturn200() throws Exception {
        doNothing().when(authService).forgotPassword(any(PasswordResetRequest.class));

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetRequest("citizen@example.com"))))
                .andExpect(status().isOk());
    }

    // ──────────────────────────────────────────────
    // POST /refresh — refreshToken
    // ──────────────────────────────────────────────

    @Test
    void refreshToken_shouldReturn200() throws Exception {
        UserProfile user = new UserProfile(UUID.randomUUID(), "citizen@example.com", "Citizen", "12345678A", "600123456", "Calle Mayor 10", List.of("ROLE_CITIZEN"));
        LoginResponse response = new LoginResponse("new-access", "new-refresh", 900, user);
        when(authService.refreshToken(any(TokenRefreshRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TokenRefreshRequest("valid-refresh-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh"));
    }

    @Test
    void refreshToken_shouldReturn400_whenTokenIsBlank() throws Exception {
        when(authService.refreshToken(any(TokenRefreshRequest.class)))
                .thenThrow(new ValidationException(List.of(new ValidationException.ValidationError("refreshToken", "must not be blank"))));

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TokenRefreshRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }

    @Test
    void refreshToken_shouldReturn401_whenTokenIsExpired() throws Exception {
        when(authService.refreshToken(any(TokenRefreshRequest.class)))
                .thenThrow(new es.tfg.records.application.exception.AuthenticationException("AUTH-401-EXPIRED_TOKEN", "Refresh token expired"));

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TokenRefreshRequest("expired-token"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH-401-EXPIRED_TOKEN"));
    }

    // ──────────────────────────────────────────────
    // POST /resend-verification — resendVerificationEmail
    // ──────────────────────────────────────────────

    @Test
    void resendVerification_shouldReturn200() throws Exception {
        doNothing().when(authService).resendVerificationEmail(any(PasswordResetRequest.class));

        mockMvc.perform(post("/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetRequest("citizen@example.com"))))
                .andExpect(status().isOk());
    }

    @Test
    void resendVerification_shouldReturn400_whenEmailIsInvalid() throws Exception {
        doThrow(new ValidationException(List.of(new ValidationException.ValidationError("email", "must be a valid email address"))))
                .when(authService).resendVerificationEmail(any(PasswordResetRequest.class));

        mockMvc.perform(post("/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetRequest("not-an-email"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }

    // ──────────────────────────────────────────────
    // POST /verify-otp — verifyOtp
    // ──────────────────────────────────────────────

    @Test
    void verifyOtp_shouldReturn200() throws Exception {
        doNothing().when(authService).verifyOtp(any(OtpRequest.class));

        mockMvc.perform(post("/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpRequest("citizen@example.com", "123456"))))
                .andExpect(status().isOk());
    }

    @Test
    void verifyOtp_shouldReturn400_whenCodeIsInvalidFormat() throws Exception {
        doThrow(new ValidationException(List.of(new ValidationException.ValidationError("code", "must be a 6-digit number"))))
                .when(authService).verifyOtp(any(OtpRequest.class));

        mockMvc.perform(post("/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpRequest("citizen@example.com", "abc"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }

    @Test
    void verifyOtp_shouldReturn400_whenOtpIsExpired() throws Exception {
        doThrow(new es.tfg.records.application.exception.AuthenticationException("AUTH-400-INVALID_OTP", "Invalid or expired OTP"))
                .when(authService).verifyOtp(any(OtpRequest.class));

        mockMvc.perform(post("/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new OtpRequest("citizen@example.com", "999999"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH-400-INVALID_OTP"));
    }

    // ──────────────────────────────────────────────
    // GET /verify-email — verifyEmailToken
    // ──────────────────────────────────────────────

    @Test
    void verifyEmail_shouldReturn200() throws Exception {
        doNothing().when(authService).verifyEmailToken(eq("valid-token"));

        mockMvc.perform(get("/auth/verify-email")
                        .param("token", "valid-token"))
                .andExpect(status().isOk());
    }

    @Test
    void verifyEmail_shouldReturn401_whenTokenIsInvalid() throws Exception {
        doThrow(new es.tfg.records.application.exception.AuthenticationException("AUTH-401-INVALID_TOKEN", "Invalid or expired verification token"))
                .when(authService).verifyEmailToken(eq("bad-token"));

        mockMvc.perform(get("/auth/verify-email")
                        .param("token", "bad-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH-401-INVALID_TOKEN"));
    }

    // ──────────────────────────────────────────────
    // GET /me — getProfile
    // ──────────────────────────────────────────────

    @Test
    void getProfile_shouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserProfile profile = new UserProfile(userId, "citizen@example.com", "Citizen", "12345678A", "600123456", "Calle Mayor 10", List.of("ROLE_CITIZEN"));
        when(authService.getProfile(eq(userId))).thenReturn(profile);

        mockMvc.perform(get("/auth/me")
                        .principal(new TestingAuthenticationToken(userId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("citizen@example.com"))
                .andExpect(jsonPath("$.fullName").value("Citizen"));
    }

    @Test
    void getProfile_shouldReturn404_whenUserNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        when(authService.getProfile(eq(userId)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("User", userId.toString()));

        mockMvc.perform(get("/auth/me")
                        .principal(new TestingAuthenticationToken(userId.toString(), null)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USER-404-NOT_FOUND"));
    }

    // ──────────────────────────────────────────────
    // PUT /me — updateProfile
    // ──────────────────────────────────────────────

    @Test
    void updateProfile_shouldReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        UpdateCitizenProfileRequest request = new UpdateCitizenProfileRequest("Updated Name", "600999888", "87654321B", "Nueva Calle 5");
        UserProfile updated = new UserProfile(userId, "citizen@example.com", "Updated Name", "87654321B", "600999888", "Nueva Calle 5", List.of("ROLE_CITIZEN"));
        when(authService.updateProfile(eq(userId), any(UpdateCitizenProfileRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/auth/me")
                        .principal(new TestingAuthenticationToken(userId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.phone").value("600999888"));
    }

    @Test
    void updateProfile_shouldReturn400_whenFieldsAreBlank() throws Exception {
        UUID userId = UUID.randomUUID();
        UpdateCitizenProfileRequest request = new UpdateCitizenProfileRequest("", "", "", "");
        when(authService.updateProfile(eq(userId), any(UpdateCitizenProfileRequest.class)))
                .thenThrow(new ValidationException(List.of(
                        new ValidationException.ValidationError("fullName", "must not be blank"),
                        new ValidationException.ValidationError("phone", "must not be blank"),
                        new ValidationException.ValidationError("nationalId", "must not be blank"),
                        new ValidationException.ValidationError("address", "must not be blank")
                )));

        mockMvc.perform(put("/auth/me")
                        .principal(new TestingAuthenticationToken(userId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }

    @Test
    void updateProfile_shouldReturn404_whenUserNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        UpdateCitizenProfileRequest request = new UpdateCitizenProfileRequest("Name", "600123456", "12345678A", "Address");
        when(authService.updateProfile(eq(userId), any(UpdateCitizenProfileRequest.class)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("User", userId.toString()));

        mockMvc.perform(put("/auth/me")
                        .principal(new TestingAuthenticationToken(userId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USER-404-NOT_FOUND"));
    }

    // ──────────────────────────────────────────────
    // POST /reset-password — resetPassword
    // ──────────────────────────────────────────────

    @Test
    void resetPassword_shouldReturn200() throws Exception {
        doNothing().when(authService).resetPassword(any(PasswordResetConfirmRequest.class));

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetConfirmRequest("reset-token-xyz", "NewSecurePass1"))))
                .andExpect(status().isOk());
    }

    @Test
    void resetPassword_shouldReturn400_whenPasswordIsTooShort() throws Exception {
        doThrow(new ValidationException(List.of(new ValidationException.ValidationError("newPassword", "size must be between 8 and 2147483647"))))
                .when(authService).resetPassword(any(PasswordResetConfirmRequest.class));

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetConfirmRequest("reset-token-xyz", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }

    @Test
    void resetPassword_shouldReturn400_whenTokenIsExpired() throws Exception {
        doThrow(new es.tfg.records.application.exception.AuthenticationException("AUTH-400-EXPIRED_TOKEN", "Reset token expired"))
                .when(authService).resetPassword(any(PasswordResetConfirmRequest.class));

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetConfirmRequest("expired-token", "NewSecurePass1"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH-400-EXPIRED_TOKEN"));
    }

    // ──────────────────────────────────────────────
    // POST /logout — logout
    // ──────────────────────────────────────────────

    @Test
    void logout_shouldReturn200() throws Exception {
        doNothing().when(authService).logout(eq("valid-refresh-token"));

        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TokenRefreshRequest("valid-refresh-token"))))
                .andExpect(status().isOk());
    }

    @Test
    void logout_shouldReturn400_whenTokenIsBlank() throws Exception {
        doThrow(new ValidationException(List.of(new ValidationException.ValidationError("refreshToken", "must not be blank"))))
                .when(authService).logout(any());

        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TokenRefreshRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }
}
