package es.tfg.records.application.dto;

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
        @Schema(description = "Assigned roles", example = "[\"ROLE_CITIZEN\"]")
        List<String> roles
) {}
