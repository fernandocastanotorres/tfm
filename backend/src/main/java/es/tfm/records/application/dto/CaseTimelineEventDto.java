package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Timeline event within a case detail.
 */
@Schema(description = "Timeline event in case history")
public record CaseTimelineEventDto(
        @Schema(description = "Event unique identifier")
        UUID id,
        @Schema(description = "Event title", example = "Case Submitted")
        String title,
        @Schema(description = "Event timestamp")
        Instant date,
        @Schema(description = "Event description")
        String description
) {}
