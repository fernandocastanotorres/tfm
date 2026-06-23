package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for the messaging system.
 */
public class MessagingDtos {

    @Schema(description = "Message thread summary")
    public record ThreadSummary(
            @Schema(description = "Thread unique identifier")
            UUID id,
            @Schema(description = "Case/procedure ID")
            UUID procedureId,
            @Schema(description = "Case title")
            String caseTitle,
            @Schema(description = "Last message preview")
            String lastMessagePreview,
            @Schema(description = "Last message timestamp")
            Instant lastMessageAt,
            @Schema(description = "Unread count for current user")
            int unreadCount,
            @Schema(description = "Total message count")
            int totalMessages
    ) {}

    @Schema(description = "Single message in a thread")
    public record MessageDto(
            @Schema(description = "Message unique identifier")
            UUID id,
            @Schema(description = "Thread ID")
            UUID threadId,
            @Schema(description = "Sender role: CITIZEN, ADMIN, or SYSTEM")
            String senderRole,
            @Schema(description = "Sender display name")
            String senderName,
            @Schema(description = "Sender email")
            String senderEmail,
            @Schema(description = "Message content")
            String content,
            @Schema(description = "Template key if sent from template")
            String templateKey,
            @Schema(description = "Whether this message has been read")
            boolean read,
            @Schema(description = "When the message was read")
            Instant readAt,
            @Schema(description = "Number of attachments")
            int attachmentCount,
            @Schema(description = "Attachments")
            List<MessageAttachmentDto> attachments,
            @Schema(description = "Message creation timestamp")
            Instant createdAt
    ) {}

    @Schema(description = "Attachment on a message")
    public record MessageAttachmentDto(
            @Schema(description = "Attachment unique identifier")
            UUID id,
            @Schema(description = "File name")
            String name,
            @Schema(description = "MIME type")
            String mimeType,
            @Schema(description = "File size in bytes")
            long size,
            @Schema(description = "Upload timestamp")
            Instant createdAt
    ) {}

    @Schema(description = "Request to send a new message")
    public record SendMessageRequest(
            @Schema(description = "Case/procedure ID")
            UUID procedureId,
            @Schema(description = "Message content")
            String content,
            @Schema(description = "Template key if using a template")
            String templateKey,
            @Schema(description = "Whether to notify recipient by email")
            boolean notifyByEmail
    ) {}

    @Schema(description = "Response with unread counts")
    public record UnreadCounts(
            @Schema(description = "Unread messages for citizen")
            long citizenUnread,
            @Schema(description = "Unread messages for admin")
            long adminUnread
    ) {}

    @Schema(description = "Paged response of messages")
    public record PagedMessages(
            List<MessageDto> messages,
            int page,
            int size,
            long totalItems,
            int totalPages
    ) {}
}
