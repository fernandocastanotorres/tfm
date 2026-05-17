package es.tfg.records.application.service;

public interface EmailGateway {
    void sendVerificationEmail(String recipientEmail, String recipientName, String verificationUrl);
}
