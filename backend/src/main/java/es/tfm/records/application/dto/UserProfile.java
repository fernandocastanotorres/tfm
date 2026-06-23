package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

/**
 * User profile included in auth responses.
 */
@Schema(description = "Authenticated user profile")
public record UserProfile(
        @Schema(description = "User unique identifier")
        UUID id,
        @Schema(description = "User email address", example = "citizen@example.com")
        String email,
        @Schema(description = "Full name", example = "Juan Perez")
        String fullName,
        @Schema(description = "National ID", example = "12345678A")
        String nationalId,
        @Schema(description = "Phone number", example = "600123456")
        String phone,
        @Schema(description = "Postal address", example = "Calle Mayor 10, Madrid")
        String address,
        @Schema(description = "Assigned roles", example = "[\"ROLE_CITIZEN\"]")
        List<String> roles
) {}
