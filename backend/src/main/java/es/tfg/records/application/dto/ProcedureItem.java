package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

/**
 * Procedure type item from the catalog.
 */
@Schema(description = "Procedure type from the catalog with associated tasks")
public record ProcedureItem(
        @Schema(description = "Procedure unique identifier (UUID)")
        String id,
        @Schema(description = "Procedure stable slug", example = "birth-certificate")
        String slug,
        @Schema(description = "Procedure title", example = "Birth Certificate Application")
        String title,
        @Schema(description = "Procedure description")
        String description,
        @Schema(description = "Administrative fee amount in EUR", example = "15.00")
        BigDecimal feeAmount,
        @Schema(description = "Processing deadline in business days", example = "10")
        int deadlineDays,
        @Schema(description = "Procedure status", example = "ACTIVE")
        String status,
        @Schema(description = "Responsible administrative unit", example = "Civil Registry Office")
        String unit,
        @Schema(description = "Workflow tasks associated with this procedure")
        List<ProcedureTaskDto> tasks
) {}
