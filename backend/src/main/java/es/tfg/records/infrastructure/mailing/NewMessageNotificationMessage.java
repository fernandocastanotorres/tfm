package es.tfg.records.infrastructure.mailing;

public record NewMessageNotificationMessage(
        String recipientEmail,
        String senderName,
        String messagePreview,
        String caseId
) {}
