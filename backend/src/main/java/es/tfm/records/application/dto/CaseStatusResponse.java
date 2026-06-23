package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Response for case status endpoint.
 */
@Schema(description = "Case status response")
public record CaseStatusResponse(
        @Schema(description = "Case unique identifier")
        UUID id,
        @Schema(description = "Current status", example = "SUBMITTED")
        String status,
        @Schema(description = "Timestamp of last status change")
        Instant statusUpdatedAt,
        @Schema(description = "Current workflow task name", example = "Document Review")
        String currentTask,
        @Schema(description = "Business record number", example = "EXP/URB/2026/000123")
        String recordNumber,
        @Schema(description = "Entry registry number (NRE)", example = "RE/URB/2026/000001")
        String entryNumber
) {}
