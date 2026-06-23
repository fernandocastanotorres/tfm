package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Task definition within a procedure type.
 */
@Schema(description = "Workflow task definition within a procedure type")
public record ProcedureTaskDto(
        @Schema(description = "Task unique identifier")
        String id,
        @Schema(description = "Task type", example = "FORM", allowableValues = {"FORM", "UPLOAD", "REVIEW"})
        String type,
        @Schema(description = "Task title", example = "Personal Information")
        String title,
        @Schema(description = "Task description")
        String description,
        @Schema(description = "Form field definitions (for FORM-type tasks)")
        List<FormFieldDto> fields,
        @Schema(description = "Upload requirements (for UPLOAD-type tasks)")
        List<UploadRequirementDto> uploadRequirements
) {}
