package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request body for OTP verification.
 */
@Schema(description = "OTP verification request")
public record OtpRequest(
        @Schema(description = "User email address", example = "citizen@example.com")
        @NotBlank
        String email,
        @Schema(description = "6-digit OTP code", example = "123456")
        @NotBlank @Pattern(regexp = "\\d{6}")
        String code
) {}
