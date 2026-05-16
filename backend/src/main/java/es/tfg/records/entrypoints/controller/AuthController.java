package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.*;
import es.tfg.records.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Handles login, registration, OTP verification, password reset, and token refresh.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "User authentication, registration, OTP verification, and password management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Exchange email/password credentials for a JWT access token and refresh token pair")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account. An OTP verification code will be sent to the provided email.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = UserProfile.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or weak password",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email already registered",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<UserProfile> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Exchange a valid refresh token for a new access token. The old refresh token is invalidated (rotation).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "Expired or invalid refresh token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LoginResponse> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Send a password reset email. Always returns 200 regardless of email existence to prevent enumeration.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Request processed (email sent if address exists)"),
            @ApiResponse(responseCode = "400", description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody PasswordResetRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP code", description = "Verify the 6-digit OTP code sent during registration to activate the account.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OTP verified, account activated"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired OTP code",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> verifyOtp(
            @Valid @RequestBody OtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Set a new password using a valid reset token received via email.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired reset token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidate the current refresh token to prevent further token refreshes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logout successful"),
            @ApiResponse(responseCode = "400", description = "Missing refresh token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> logout(
            @Valid @RequestBody TokenRefreshRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok().build();
    }
}
