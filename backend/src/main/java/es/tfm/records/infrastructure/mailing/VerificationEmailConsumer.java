package es.tfm.records.infrastructure.mailing;

import es.tfm.records.infrastructure.config.MailQueueConfig;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "mailing.queue.enabled", havingValue = "true", matchIfMissing = true)
public class VerificationEmailConsumer {

    private static final Logger log = LoggerFactory.getLogger(VerificationEmailConsumer.class);

    private final BrevoEmailGateway brevoEmailGateway;
    private final Counter deliveredCounter;
    private final Counter failedCounter;

    public VerificationEmailConsumer(BrevoEmailGateway brevoEmailGateway, MeterRegistry meterRegistry) {
        this.brevoEmailGateway = brevoEmailGateway;
        this.deliveredCounter = meterRegistry.counter("records_mail_delivery_total", "type", "verification", "status", "success");
        this.failedCounter = meterRegistry.counter("records_mail_delivery_total", "type", "verification", "status", "failure");
    }

    @RabbitListener(queues = MailQueueConfig.MAIL_QUEUE)
    public void handle(EmailVerificationMessage message) {
        try {
            brevoEmailGateway.sendVerificationEmail(message.recipientEmail(), message.recipientName(), message.verificationUrl());
            deliveredCounter.increment();
            log.info("Verification email delivered to {}", message.recipientEmail());
        } catch (Exception ex) {
            failedCounter.increment();
            log.error("Verification email delivery failed for {}", message.recipientEmail(), ex);
            throw ex;
        }
    }

    @RabbitListener(queues = MailQueueConfig.MAIL_QUEUE)
    public void handleNewMessage(NewMessageNotificationMessage message) {
        try {
            brevoEmailGateway.sendNewMessageNotification(message.recipientEmail(), message.senderName(), message.messagePreview(), message.caseId());
            deliveredCounter.increment();
            log.info("New message notification delivered to {}", message.recipientEmail());
        } catch (Exception ex) {
            failedCounter.increment();
            log.error("New message notification delivery failed for {}", message.recipientEmail(), ex);
            throw ex;
        }
    }
}
