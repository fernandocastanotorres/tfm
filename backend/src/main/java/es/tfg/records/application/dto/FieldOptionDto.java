package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Option for a select-type form field.
 */
@Schema(description = "Select field option")
public record FieldOptionDto(
        @Schema(description = "Option value (submitted in form data)", example = "M")
        String value,
        @Schema(description = "Option display label", example = "Male")
        String label
) {}
