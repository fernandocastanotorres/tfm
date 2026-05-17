package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Update authenticated citizen profile")
public record UpdateCitizenProfileRequest(
        @Schema(description = "Full name", example = "Juan Perez")
        @NotBlank
        String fullName,
        @Schema(description = "Phone number", example = "600123456")
        @NotBlank
        String phone,
        @Schema(description = "National ID", example = "12345678A")
        @NotBlank
        String nationalId,
        @Schema(description = "Postal address", example = "Calle Mayor 10, Madrid")
        @NotBlank
        String address
) {}
