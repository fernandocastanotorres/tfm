package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Version information within a document detail.
 */
@Schema(description = "Document version entry in version history")
public record DocumentVersionDto(
        @Schema(description = "Version entry unique identifier")
        UUID id,
        @Schema(description = "Version number", example = "1")
        int version,
        @Schema(description = "File size in bytes")
        long size,
        @Schema(description = "Upload timestamp")
        Instant uploadedAt,
        @Schema(description = "Version status", example = "PENDING")
        String status
) {}
