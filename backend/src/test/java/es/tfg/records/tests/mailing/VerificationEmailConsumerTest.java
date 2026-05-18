package es.tfg.records.tests.mailing;

import es.tfg.records.infrastructure.mailing.BrevoEmailGateway;
import es.tfg.records.infrastructure.mailing.EmailVerificationMessage;
import es.tfg.records.infrastructure.mailing.VerificationEmailConsumer;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationEmailConsumerTest {

    @Mock
    private BrevoEmailGateway brevoEmailGateway;

    @Mock
    private MeterRegistry meterRegistry;

    @Mock
    private Counter deliveredCounter;

    @Mock
    private Counter failedCounter;

    private VerificationEmailConsumer consumer;

    @BeforeEach
    void setUp() {
        when(meterRegistry.counter("records_mail_delivery_total", "type", "verification", "status", "success"))
                .thenReturn(deliveredCounter);
        when(meterRegistry.counter("records_mail_delivery_total", "type", "verification", "status", "failure"))
                .thenReturn(failedCounter);
        consumer = new VerificationEmailConsumer(brevoEmailGateway, meterRegistry);
    }

    @Test
    void handle_shouldSendEmailAndIncrementDeliveredCounter() {
        EmailVerificationMessage message = new EmailVerificationMessage(
                "user@example.com", "John", "https://example.com/verify/abc123"
        );

        consumer.handle(message);

        verify(brevoEmailGateway).sendVerificationEmail("user@example.com", "John", "https://example.com/verify/abc123");
        verify(deliveredCounter).increment();
        verify(failedCounter, never()).increment();
    }

    @Test
    void handle_shouldIncrementFailedCounterAndRethrowOnFailure() {
        EmailVerificationMessage message = new EmailVerificationMessage(
                "user@example.com", "John", "https://example.com/verify/abc123"
        );

        RuntimeException expected = new RuntimeException("SMTP error");
        doThrow(expected).when(brevoEmailGateway).sendVerificationEmail(anyString(), anyString(), anyString());

        assertThatThrownBy(() -> consumer.handle(message))
                .isSameAs(expected);

        verify(failedCounter).increment();
        verify(deliveredCounter, never()).increment();
    }
}
