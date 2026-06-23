package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for password reset initiation.
 */
@Schema(description = "Password reset request")
public record PasswordResetRequest(
        @Schema(description = "Registered email address", example = "citizen@example.com")
        @Email @NotBlank
        String email
) {}
