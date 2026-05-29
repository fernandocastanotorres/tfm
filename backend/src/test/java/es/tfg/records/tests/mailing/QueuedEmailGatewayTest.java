package es.tfg.records.tests.mailing;

import es.tfg.records.infrastructure.config.MailQueueConfig;
import es.tfg.records.infrastructure.mailing.EmailVerificationMessage;
import es.tfg.records.infrastructure.mailing.NewMessageNotificationMessage;
import es.tfg.records.infrastructure.mailing.QueuedEmailGateway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class QueuedEmailGatewayTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Captor
    private ArgumentCaptor<Object> messageCaptor;

    @Test
    void sendVerificationEmail_shouldSendToRabbitMQ() {
        QueuedEmailGateway gateway = new QueuedEmailGateway(rabbitTemplate);

        gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify");

        verify(rabbitTemplate).convertAndSend(
                MailQueueConfig.MAIL_EXCHANGE,
                MailQueueConfig.MAIL_ROUTING_KEY,
                new EmailVerificationMessage("user@example.com", "John", "https://example.com/verify"));
    }

    @Test
    void sendNewMessageNotification_shouldSendToRabbitMQ() {
        QueuedEmailGateway gateway = new QueuedEmailGateway(rabbitTemplate);

        gateway.sendNewMessageNotification("user@example.com", "Sender", "Preview", "case-42");

        verify(rabbitTemplate).convertAndSend(
                MailQueueConfig.MAIL_EXCHANGE,
                MailQueueConfig.MAIL_ROUTING_KEY,
                new NewMessageNotificationMessage("user@example.com", "Sender", "Preview", "case-42"));
    }

    @Test
    void sendPasswordResetEmail_shouldSendToRabbitMQ() {
        QueuedEmailGateway gateway = new QueuedEmailGateway(rabbitTemplate);

        gateway.sendPasswordResetEmail("user@example.com", "John", "https://example.com/reset");

        verify(rabbitTemplate).convertAndSend(
                MailQueueConfig.MAIL_EXCHANGE,
                MailQueueConfig.MAIL_ROUTING_KEY,
                new QueuedEmailGateway.PasswordResetEmailMessage(
                        "user@example.com", "John", "https://example.com/reset"));
    }

    @Test
    void passwordResetEmailMessage_shouldBeARecord() {
        var message = new QueuedEmailGateway.PasswordResetEmailMessage(
                "user@example.com", "John", "https://example.com/reset");

        assertThat(message.recipientEmail()).isEqualTo("user@example.com");
        assertThat(message.recipientName()).isEqualTo("John");
        assertThat(message.resetUrl()).isEqualTo("https://example.com/reset");
    }
}
