package es.tfm.records.infrastructure.mailing;

public record EmailVerificationMessage(
        String recipientEmail,
        String recipientName,
        String verificationUrl
) {}
