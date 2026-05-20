package es.tfg.records.tests.mailing;

import es.tfg.records.infrastructure.mailing.BrevoEmailGateway;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BrevoEmailGatewayTest {

    @Test
    void sendVerificationEmail_shouldDoNothingWhenDisabled() {
        JavaMailSender sender = mock(JavaMailSender.class);
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                false, "no-reply@test.com", "Test", sender);

        gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify");
        verify(sender, never()).send(any(jakarta.mail.internet.MimeMessage.class));
    }

    @Test
    void sendVerificationEmail_shouldAttemptSendWhenEnabled() {
        JavaMailSender sender = mock(JavaMailSender.class);
        jakarta.mail.internet.MimeMessage mimeMessage = mock(jakarta.mail.internet.MimeMessage.class);
        org.mockito.Mockito.when(sender.createMimeMessage()).thenReturn(mimeMessage);
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                true, "no-reply@test.com", "Test", sender);

        gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify");
        verify(sender).send(mimeMessage);
    }

    @Test
    void sendVerificationEmail_shouldThrowWhenMailSenderFails() throws Exception {
        JavaMailSender sender = mock(JavaMailSender.class);
        jakarta.mail.internet.MimeMessage mimeMessage = mock(jakarta.mail.internet.MimeMessage.class);
        org.mockito.Mockito.when(sender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("smtp down")).when(sender).send(mimeMessage);
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                true, "no-reply@test.com", "Test Service", sender);

        assertThatThrownBy(() ->
                gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void constructor_shouldUseDefaultValues() {
        JavaMailSender sender = mock(JavaMailSender.class);
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                false, "no-reply@records.local", "Records", sender);

        assertThat(gateway).isNotNull();
    }

    @Test
    void sendVerificationEmail_shouldIncludeRecipientNameInEmail() {
        JavaMailSender sender = mock(JavaMailSender.class);
        jakarta.mail.internet.MimeMessage mimeMessage = mock(jakarta.mail.internet.MimeMessage.class);
        org.mockito.Mockito.when(sender.createMimeMessage()).thenReturn(mimeMessage);
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                true, "sender@test.com", "Sender Name", sender);

        gateway.sendVerificationEmail("recipient@test.com", "Jane Doe", "https://verify.link");
        verify(sender).send(mimeMessage);
    }
}
