package es.tfm.records.tests.mailing;

import es.tfm.records.infrastructure.mailing.BrevoEmailGateway;
import es.tfm.records.infrastructure.mailing.DirectEmailGateway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DirectEmailGatewayTest {

    @Mock
    private BrevoEmailGateway brevoEmailGateway;

    @Test
    void sendVerificationEmail_shouldDelegateToBrevo() {
        DirectEmailGateway gateway = new DirectEmailGateway(brevoEmailGateway);

        gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify");

        verify(brevoEmailGateway).sendVerificationEmail("user@example.com", "John", "https://example.com/verify");
    }

    @Test
    void sendNewMessageNotification_shouldDelegateToBrevo() {
        DirectEmailGateway gateway = new DirectEmailGateway(brevoEmailGateway);

        gateway.sendNewMessageNotification("user@example.com", "Sender", "Preview", "case-42");

        verify(brevoEmailGateway).sendNewMessageNotification("user@example.com", "Sender", "Preview", "case-42");
    }

    @Test
    void sendPasswordResetEmail_shouldDelegateToBrevo() {
        DirectEmailGateway gateway = new DirectEmailGateway(brevoEmailGateway);

        gateway.sendPasswordResetEmail("user@example.com", "John", "https://example.com/reset");

        verify(brevoEmailGateway).sendPasswordResetEmail("user@example.com", "John", "https://example.com/reset");
    }
}
