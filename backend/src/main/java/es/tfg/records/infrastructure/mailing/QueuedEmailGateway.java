package es.tfg.records.infrastructure.mailing;

import es.tfg.records.application.service.EmailGateway;
import es.tfg.records.infrastructure.config.MailQueueConfig;
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
}
