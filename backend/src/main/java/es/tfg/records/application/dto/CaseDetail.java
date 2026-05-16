package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full detail of a case including timeline and attachments.
 */
@Schema(description = "Full case detail including timeline events and attachments")
public record CaseDetail(
        @Schema(description = "Case unique identifier")
        UUID id,
        @Schema(description = "Case title", example = "Birth Certificate Application")
        String title,
        @Schema(description = "Current case status", example = "IN_REVIEW")
        String status,
        @Schema(description = "Procedure category", example = "Civil Registry")
        String category,
        @Schema(description = "Assigned administrative unit", example = "Unit A1")
        String assignedUnit,
        @Schema(description = "Submission timestamp")
        Instant submittedAt,
        @Schema(description = "Case description")
        String description,
        @Schema(description = "Chronological timeline of case events")
        List<CaseTimelineEventDto> timeline,
        @Schema(description = "Attached documents")
        List<CaseAttachmentDto> attachments
) {}
