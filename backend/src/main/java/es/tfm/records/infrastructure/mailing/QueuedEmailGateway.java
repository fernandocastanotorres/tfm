package es.tfm.records.infrastructure.mailing;

import es.tfm.records.application.service.EmailGateway;
import es.tfm.records.infrastructure.config.MailQueueConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
@ConditionalOnProperty(name = "mailing.queue.enabled", havingValue = "true", matchIfMissing = true)
public class QueuedEmailGateway implements EmailGateway {

    private final RabbitTemplate rabbitTemplate;

    public QueuedEmailGateway(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void sendVerificationEmail(String recipientEmail, String recipientName, String verificationUrl) {
        EmailVerificationMessage message = new EmailVerificationMessage(recipientEmail, recipientName, verificationUrl);
        rabbitTemplate.convertAndSend(MailQueueConfig.MAIL_EXCHANGE, MailQueueConfig.MAIL_ROUTING_KEY, message);
    }

    @Override
    public void sendNewMessageNotification(String recipientEmail, String senderName, String messagePreview, String caseId) {
        NewMessageNotificationMessage message = new NewMessageNotificationMessage(recipientEmail, senderName, messagePreview, caseId);
        rabbitTemplate.convertAndSend(MailQueueConfig.MAIL_EXCHANGE, MailQueueConfig.MAIL_ROUTING_KEY, message);
    }

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetUrl) {
        PasswordResetEmailMessage message = new PasswordResetEmailMessage(recipientEmail, recipientName, resetUrl);
        rabbitTemplate.convertAndSend(MailQueueConfig.MAIL_EXCHANGE, MailQueueConfig.MAIL_ROUTING_KEY, message);
    }

    public record PasswordResetEmailMessage(String recipientEmail, String recipientName, String resetUrl) {}
}
