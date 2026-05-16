package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Summary item for a case in paginated listings.
 */
@Schema(description = "Summary item for a case in paginated listings")
public record CaseItem(
        @Schema(description = "Case unique identifier")
        UUID id,
        @Schema(description = "Case title", example = "Birth Certificate Application")
        String title,
        @Schema(description = "Current case status", example = "DRAFT", allowableValues = {"DRAFT", "SUBMITTED", "IN_REVIEW", "AMENDMENT_REQUIRED", "RESUBMITTED", "APPROVED", "REJECTED"})
        String status,
        @Schema(description = "Last update timestamp")
        Instant lastUpdated,
        @Schema(description = "Submission timestamp (null if still in draft)")
        Instant submittedAt,
        @Schema(description = "Procedure category", example = "Civil Registry")
        String category,
        @Schema(description = "Assigned administrative unit", example = "Unit A1")
        String assignedUnit
) {}
