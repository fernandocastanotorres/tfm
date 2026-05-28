package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response body for successful login.
 */
@Schema(description = "Authentication response containing JWT tokens and user profile")
public record LoginResponse(
        @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIs...")
        String accessToken,
        @Schema(description = "JWT refresh token (rotation-based)", example = "eyJhbGciOiJIUzI1NiIs...")
        String refreshToken,
        @Schema(description = "Access token expiry in seconds", example = "900")
        long expiresIn,
        @Schema(description = "Authenticated user profile")
        UserProfile user
) {}
