package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for user login.
 */
@Schema(description = "User login credentials")
public record LoginRequest(
        @Schema(description = "User email address", example = "citizen@example.com")
        @Email @NotBlank
        String email,
        @Schema(description = "User password", example = "SecurePass1")
        @NotBlank
        String password
) {}
