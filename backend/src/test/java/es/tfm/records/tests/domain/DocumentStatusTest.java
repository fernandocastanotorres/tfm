package es.tfm.records.tests.domain;

import es.tfm.records.domain.model.DocumentStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentStatusTest {

    @Test
    void documentStatus_shouldHaveAllExpectedValues() {
        assertThat(DocumentStatus.values()).hasSize(4);
    }

    @Test
    void documentStatus_shouldContainAllStatuses() {
        assertThat(DocumentStatus.values())
                .extracting(DocumentStatus::name)
                .containsExactly("PENDING", "SIGNED", "VALIDATED", "REJECTED");
    }

    @Test
    void documentStatus_shouldMapFromString() {
        DocumentStatus pending = DocumentStatus.valueOf("PENDING");
        DocumentStatus signed = DocumentStatus.valueOf("SIGNED");
        DocumentStatus validated = DocumentStatus.valueOf("VALIDATED");
        DocumentStatus rejected = DocumentStatus.valueOf("REJECTED");

        assertThat(pending).isEqualTo(DocumentStatus.PENDING);
        assertThat(signed).isEqualTo(DocumentStatus.SIGNED);
        assertThat(validated).isEqualTo(DocumentStatus.VALIDATED);
        assertThat(rejected).isEqualTo(DocumentStatus.REJECTED);
    }

    @Test
    void documentStatus_shouldHaveCorrectOrdinalOrder() {
        assertThat(DocumentStatus.PENDING.ordinal()).isEqualTo(0);
        assertThat(DocumentStatus.SIGNED.ordinal()).isEqualTo(1);
        assertThat(DocumentStatus.VALIDATED.ordinal()).isEqualTo(2);
        assertThat(DocumentStatus.REJECTED.ordinal()).isEqualTo(3);
    }
}
