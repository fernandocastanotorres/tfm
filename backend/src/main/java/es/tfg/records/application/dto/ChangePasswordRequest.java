package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request to change password for authenticated user")
public record ChangePasswordRequest(
        @Schema(description = "Current password for verification", example = "OldPass1")
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @Schema(description = "New password (min 8 chars, 1 uppercase, 1 number, 1 special char)", example = "NewPass1!")
        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 128)
        String newPassword
) {}
