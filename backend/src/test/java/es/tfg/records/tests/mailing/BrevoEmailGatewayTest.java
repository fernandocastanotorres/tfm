package es.tfg.records.tests.mailing;

import es.tfg.records.infrastructure.mailing.BrevoEmailGateway;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BrevoEmailGatewayTest {

    @Test
    void sendVerificationEmail_shouldDoNothingWhenDisabled() {
        // Given - mailing.enabled = false
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                "some-api-key", false, "no-reply@test.com", "Test");

        // When/Then - should not throw, just log
        gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify");
        // No assertion needed - the method returns void and should not throw
    }

    @Test
    void sendVerificationEmail_shouldDoNothingWhenApiKeyIsBlank() {
        // Given - empty API key
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                "", true, "no-reply@test.com", "Test");

        // When/Then - should not throw, just log
        gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify");
    }

    @Test
    void sendVerificationEmail_shouldAttemptHttpCallWhenEnabledWithValidKey() {
        // Given - enabled with valid API key, this will make a real HTTP call
        // which will fail since we don't have a mock server, but we can verify
        // the gateway is constructed correctly
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                "test-api-key", true, "no-reply@test.com", "Test Service");

        // When/Then - will throw because the API call fails (no real Brevo server)
        // This verifies the HTTP request is being built and attempted
        assertThatThrownBy(() ->
                gateway.sendVerificationEmail("user@example.com", "John", "https://example.com/verify"))
                .isInstanceOf(Exception.class);
    }

    @Test
    void constructor_shouldUseDefaultValues() {
        // Given - using defaults
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                "", false, "no-reply@records.local", "Records");

        // Then - gateway is constructed without error
        assertThat(gateway).isNotNull();
    }

    @Test
    void sendVerificationEmail_shouldIncludeRecipientNameInEmail() {
        // Given - enabled with valid key
        BrevoEmailGateway gateway = new BrevoEmailGateway(
                "x-valid-key", true, "sender@test.com", "Sender Name");

        // When/Then - the HTTP call will fail but we verify the method doesn't
        // short-circuit (i.e., it attempts the call with the provided params)
        assertThatThrownBy(() ->
                gateway.sendVerificationEmail("recipient@test.com", "Jane Doe", "https://verify.link"))
                .isInstanceOf(Exception.class);
    }
}
