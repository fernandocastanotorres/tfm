package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Summary item for a document in listings.
 */
@Schema(description = "Document summary item for listings")
public record DocumentItem(
        @Schema(description = "Document unique identifier")
        UUID id,
        @Schema(description = "Original file name", example = "passport-scan.pdf")
        String name,
        @Schema(description = "MIME type", example = "application/pdf")
        String mimeType,
        @Schema(description = "File size in bytes", example = "2048576")
        long size,
        @Schema(description = "Version number", example = "1")
        int version,
        @Schema(description = "Upload timestamp")
        Instant uploadedAt,
        @Schema(description = "Document status", example = "PENDING", allowableValues = {"PENDING", "SIGNED", "VALIDATED", "REJECTED"})
        String status,
        @Schema(description = "Whether original upload artifact is available", example = "true")
        boolean hasOriginal,
        @Schema(description = "Whether signed artifact is available", example = "true")
        boolean hasSigned,
        @Schema(description = "Associated case ID")
        UUID caseId
) {}
