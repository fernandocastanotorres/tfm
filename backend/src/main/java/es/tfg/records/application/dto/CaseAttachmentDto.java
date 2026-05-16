package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Attachment within a case detail.
 */
@Schema(description = "Case attachment reference")
public record CaseAttachmentDto(
        @Schema(description = "Attachment unique identifier")
        UUID id,
        @Schema(description = "Attachment file name", example = "supporting-doc.pdf")
        String name,
        @Schema(description = "Attachment type", example = "SUPPORTING_DOCUMENT")
        String type,
        @Schema(description = "Upload timestamp")
        Instant uploadedAt
) {}
