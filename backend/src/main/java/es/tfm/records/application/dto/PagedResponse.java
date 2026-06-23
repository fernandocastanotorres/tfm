package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Paginated response wrapper matching the API contract shape.
 */
@Schema(description = "Paginated response wrapper for collection endpoints")
public record PagedResponse<T>(
        @Schema(description = "Items on the current page")
        List<T> items,
        @Schema(description = "Current page number (0-based)", example = "0")
        int page,
        @Schema(description = "Page size", example = "10")
        int size,
        @Schema(description = "Total number of items across all pages", example = "42")
        long totalItems,
        @Schema(description = "Total number of pages", example = "5")
        int totalPages
) {}
