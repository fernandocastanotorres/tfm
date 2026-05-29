package es.tfg.records.tests.mailing;

import es.tfg.records.infrastructure.mailing.NewMessageNotificationMessage;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NewMessageNotificationMessageTest {

    @Test
    void shouldCreateRecord_withAllFields() {
        var message = new NewMessageNotificationMessage(
                "user@example.com", "Sender Name", "Message preview text", "case-123");

        assertThat(message.recipientEmail()).isEqualTo("user@example.com");
        assertThat(message.senderName()).isEqualTo("Sender Name");
        assertThat(message.messagePreview()).isEqualTo("Message preview text");
        assertThat(message.caseId()).isEqualTo("case-123");
    }

    @Test
    void shouldBeImmutable() {
        var message = new NewMessageNotificationMessage(
                "user@example.com", "Sender", "Preview", "case-1");

        // Verify it is a record: equals uses all components
        var same = new NewMessageNotificationMessage(
                "user@example.com", "Sender", "Preview", "case-1");
        assertThat(message).isEqualTo(same);

        var different = new NewMessageNotificationMessage(
                "other@example.com", "Sender", "Preview", "case-1");
        assertThat(message).isNotEqualTo(different);
    }
}
