package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Form field definition for dynamic UI rendering.
 */
@Schema(description = "Form field definition for dynamic UI rendering")
public record FormFieldDto(
        @Schema(description = "Field unique identifier", example = "firstName")
        String id,
        @Schema(description = "Display label", example = "First Name")
        String label,
        @Schema(description = "Placeholder text", example = "Enter your first name")
        String placeholder,
        @Schema(description = "Whether this field is required")
        boolean required,
        @Schema(description = "Field type", example = "text", allowableValues = {"text", "number", "email", "date", "select", "textarea", "checkbox"})
        String type,
        @Schema(description = "Options for select-type fields")
        List<FieldOptionDto> options
) {}
