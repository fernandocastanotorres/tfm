package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for password reset confirmation.
 */
@Schema(description = "Password reset confirmation with token")
public record PasswordResetConfirmRequest(
        @Schema(description = "Password reset token received via email")
        @NotBlank
        String token,
        @Schema(description = "New password (min 8 chars, 1 uppercase, 1 number)", example = "NewSecurePass1")
        @NotBlank @Size(min = 8)
        String newPassword
) {}
