package es.tfg.records.infrastructure.mailing;

import es.tfg.records.application.service.EmailGateway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
@ConditionalOnProperty(name = "mailing.queue.enabled", havingValue = "false")
public class DirectEmailGateway implements EmailGateway {

    private final BrevoEmailGateway brevoEmailGateway;

    public DirectEmailGateway(BrevoEmailGateway brevoEmailGateway) {
        this.brevoEmailGateway = brevoEmailGateway;
    }

    @Override
    public void sendVerificationEmail(String recipientEmail, String recipientName, String verificationUrl) {
        brevoEmailGateway.sendVerificationEmail(recipientEmail, recipientName, verificationUrl);
    }

    @Override
    public void sendNewMessageNotification(String recipientEmail, String senderName, String messagePreview, String caseId) {
        brevoEmailGateway.sendNewMessageNotification(recipientEmail, senderName, messagePreview, caseId);
    }
}
