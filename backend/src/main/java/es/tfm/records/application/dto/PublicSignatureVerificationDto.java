package es.tfm.records.application.dto;

import java.time.Instant;
import java.util.UUID;

public record PublicSignatureVerificationDto(
        boolean valid,
        String message,
        String csvCode,
        UUID documentId,
        UUID caseId,
        Instant signedAt,
        String digest
) {}
