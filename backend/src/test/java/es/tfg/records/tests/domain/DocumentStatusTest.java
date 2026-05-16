package es.tfg.records.tests.domain;

import es.tfg.records.domain.model.DocumentStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentStatusTest {

    @Test
    void documentStatus_shouldHaveAllExpectedValues() {
        // Then
        assertThat(DocumentStatus.values()).hasSize(3);
    }

    @Test
    void documentStatus_shouldContainAllStatuses() {
        // Then
        assertThat(DocumentStatus.values())
                .extracting(DocumentStatus::name)
                .containsExactly("PENDING", "VALIDATED", "REJECTED");
    }

    @Test
    void documentStatus_shouldMapFromString() {
        // When
        DocumentStatus pending = DocumentStatus.valueOf("PENDING");
        DocumentStatus validated = DocumentStatus.valueOf("VALIDATED");
        DocumentStatus rejected = DocumentStatus.valueOf("REJECTED");

        // Then
        assertThat(pending).isEqualTo(DocumentStatus.PENDING);
        assertThat(validated).isEqualTo(DocumentStatus.VALIDATED);
        assertThat(rejected).isEqualTo(DocumentStatus.REJECTED);
    }

    @Test
    void documentStatus_shouldHaveCorrectOrdinalOrder() {
        // Then
        assertThat(DocumentStatus.PENDING.ordinal()).isEqualTo(0);
        assertThat(DocumentStatus.VALIDATED.ordinal()).isEqualTo(1);
        assertThat(DocumentStatus.REJECTED.ordinal()).isEqualTo(2);
    }
}