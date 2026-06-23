package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Upload requirement for an upload-type task.
 */
@Schema(description = "Document upload requirement for an upload-type task")
public record UploadRequirementDto(
        @Schema(description = "Requirement unique identifier", example = "idDocument")
        String id,
        @Schema(description = "Requirement label", example = "National ID Card")
        String label,
        @Schema(description = "Whether this document is required")
        boolean required
) {}
