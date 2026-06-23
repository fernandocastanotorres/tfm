package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for user registration.
 */
@Schema(description = "New user registration request")
public record RegisterRequest(
        @Schema(description = "User email address (must be unique)", example = "citizen@example.com")
        @Email @NotBlank
        String email,
        @Schema(description = "Full name for the user", example = "Juan Perez")
        @NotBlank
        String fullName,
        @Schema(description = "National ID", example = "12345678A")
        @NotBlank
        String nationalId,
        @Schema(description = "Phone number", example = "600123456")
        @NotBlank
        String phone,
        @Schema(description = "Postal address", example = "Calle Mayor 10, Madrid")
        String address,
        @Schema(description = "Password (min 8 chars, 1 uppercase, 1 number)", example = "SecurePass1")
        @NotBlank @Size(min = 8)
        String password
) {}
