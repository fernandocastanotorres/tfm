package es.tfm.records.application.dto;

import java.time.Instant;
import java.util.UUID;

public record ContactMessageDto(
        UUID id,
        String fullName,
        String email,
        String subject,
        String message,
        String category,
        boolean read,
        Instant createdAt
) {
}
