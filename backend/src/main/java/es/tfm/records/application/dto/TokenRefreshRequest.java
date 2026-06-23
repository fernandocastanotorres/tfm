package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for token refresh.
 */
@Schema(description = "Token refresh request")
public record TokenRefreshRequest(
        @Schema(description = "Current refresh token to exchange for a new access token")
        @NotBlank
        String refreshToken
) {}
