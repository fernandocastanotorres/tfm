package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

/**
 * Canonical error response following the ERROR_MODEL.md specification.
 */
@Schema(description = "Canonical error response following the ERROR_MODEL.md specification")
public record ErrorResponse(
        @Schema(description = "Error timestamp")
        Instant timestamp,
        @Schema(description = "HTTP status code", example = "400")
        int status,
        @Schema(description = "Error code for programmatic handling", example = "AUTH-401-INVALID_CREDENTIALS")
        String code,
        @Schema(description = "Human-readable error message", example = "Invalid email or password")
        String message,
        @Schema(description = "Request path that caused the error", example = "/api/v1/auth/login")
        String path,
        @Schema(description = "Correlation ID for request tracing")
        String correlationId,
        @Schema(description = "Field-level validation error details")
        List<ErrorDetail> details
) {
    @Schema(description = "Field-level validation error detail")
    public record ErrorDetail(
            @Schema(description = "Field name that failed validation", example = "email")
            String field,
            @Schema(description = "Validation issue description", example = "must be a valid email address")
            String issue
    ) {}
}
