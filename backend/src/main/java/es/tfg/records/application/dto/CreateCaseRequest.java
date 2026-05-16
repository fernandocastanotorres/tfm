package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Request body for creating a new case (procedure).
 */
@Schema(description = "Request to create a new case draft")
public record CreateCaseRequest(
        @Schema(description = "Procedure type identifier (slug from catalog)", example = "birth-certificate")
        @NotBlank
        String procedureId,
        @Schema(description = "Dynamic form data as key-value pairs matching the procedure's form schema")
        Map<String, Object> formData,
        @Schema(description = "List of document IDs to associate with this case")
        List<UUID> documentIds
) {}
