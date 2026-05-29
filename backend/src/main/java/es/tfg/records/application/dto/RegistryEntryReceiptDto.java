package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Formal electronic registry receipt data for a submitted case")
public record RegistryEntryReceiptDto(
        @Schema(description = "Case unique identifier")
        UUID caseId,
        @Schema(description = "Business record number", example = "EXP/URB/2026/000123")
        String recordNumber,
        @Schema(description = "Entry registry number (NRE)", example = "RE/URB/2026/000001")
        String entryNumber,
        @Schema(description = "Submission timestamp")
        Instant submittedAt,
        @Schema(description = "CSV code linked to a signed document when available", example = "A1B2C3D4E5F6")
        String csvCode,
        @Schema(description = "Public verification URL for CSV when available")
        String verificationUrl,
        @Schema(description = "API path to download the generated receipt PDF")
        String receiptDownloadPath
) {}
