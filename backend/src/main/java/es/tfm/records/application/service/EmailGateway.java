package es.tfm.records.application.service;

public interface EmailGateway {
    void sendVerificationEmail(String recipientEmail, String recipientName, String verificationUrl);

    void sendNewMessageNotification(String recipientEmail, String senderName, String messagePreview, String caseId);

    void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetUrl);
}
