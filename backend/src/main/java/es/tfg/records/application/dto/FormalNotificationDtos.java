package es.tfg.records.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class FormalNotificationDtos {

    private FormalNotificationDtos() {
    }

    public record IssueRequest(
            UUID citizenId,
            UUID procedureId,
            String typeKey,
            String subject,
            String body,
            Instant expiresAt,
            boolean notifyByEmail
    ) {}

    public record InboxItem(
            UUID id,
            UUID citizenId,
            UUID procedureId,
            String caseTitle,
            String status,
            String typeKey,
            String subject,
            String body,
            Instant availableAt,
            Instant expiresAt,
            Instant accessedAt,
            Instant resolvedAt,
            Instant expiredAt,
            List<AttachmentDto> attachments
    ) {}

    public record AttachmentDto(
            UUID id,
            String name,
            String mimeType,
            long size,
            Instant createdAt
    ) {}

    public record UnreadCount(long unread) {}

    public record ResolutionRequest(String notes) {}

    public record CitizenOption(
            UUID id,
            String email,
            String displayName,
            String nationalId
    ) {}

    public record CitizenCaseOption(
            UUID id,
            String title,
            String typeTitle,
            String status,
            Instant createdAt
    ) {}

    public record AdminNotificationItem(
            UUID id,
            UUID citizenId,
            String citizenEmail,
            String citizenDisplayName,
            UUID procedureId,
            String caseTitle,
            String recordNumber,
            String status,
            String typeKey,
            String subject,
            String body,
            Instant availableAt,
            Instant expiresAt,
            Instant accessedAt,
            Instant resolvedAt,
            Instant createdAt,
            String resolutionNotes,
            int attachmentCount,
            List<AttachmentDto> attachments
    ) {}
}
