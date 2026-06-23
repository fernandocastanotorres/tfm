package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full detail of a document including version history.
 */
@Schema(description = "Full document detail including version history")
public record DocumentDetail(
        @Schema(description = "Document unique identifier")
        UUID id,
        @Schema(description = "Original file name", example = "passport-scan.pdf")
        String name,
        @Schema(description = "MIME type", example = "application/pdf")
        String mimeType,
        @Schema(description = "File size in bytes")
        long size,
        @Schema(description = "Current version number")
        int version,
        @Schema(description = "Upload timestamp")
        Instant uploadedAt,
        @Schema(description = "Document status", example = "VALIDATED")
        String status,
        @Schema(description = "Whether original upload artifact is available", example = "true")
        boolean hasOriginal,
        @Schema(description = "Whether signed artifact is available", example = "true")
        boolean hasSigned,
        @Schema(description = "Associated case ID")
        UUID caseId,
        @Schema(description = "Version history")
        List<DocumentVersionDto> versions
) {}
