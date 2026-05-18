package es.tfg.records.tests.domain;

import es.tfg.records.domain.model.CaseAttachment;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CaseAttachmentTest {

    @Test
    void defaultConstructor_shouldCreateEmptyAttachment() {
        CaseAttachment attachment = new CaseAttachment();
        assertThat(attachment.getId()).isNull();
        assertThat(attachment.getProcedureId()).isNull();
        assertThat(attachment.getName()).isNull();
        assertThat(attachment.getType()).isNull();
        assertThat(attachment.getStoragePath()).isNull();
        assertThat(attachment.getUploadedAt()).isNull();
        assertThat(attachment.getCreatedAt()).isNull();
    }

    @Test
    void parameterizedConstructor_shouldSetFields() {
        UUID id = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        String name = "test.pdf";
        String type = "application/pdf";
        String storagePath = "/storage/test.pdf";

        CaseAttachment attachment = new CaseAttachment(id, procedureId, name, type, storagePath);

        assertThat(attachment.getId()).isEqualTo(id);
        assertThat(attachment.getProcedureId()).isEqualTo(procedureId);
        assertThat(attachment.getName()).isEqualTo(name);
        assertThat(attachment.getType()).isEqualTo(type);
        assertThat(attachment.getStoragePath()).isEqualTo(storagePath);
    }

    @Test
    void setters_shouldUpdateFields() {
        CaseAttachment attachment = new CaseAttachment();
        UUID id = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        Instant now = Instant.now();

        attachment.setId(id);
        attachment.setProcedureId(procedureId);
        attachment.setName("doc.pdf");
        attachment.setType("application/pdf");
        attachment.setStoragePath("/docs/doc.pdf");
        attachment.setUploadedAt(now);
        attachment.setCreatedAt(now);

        assertThat(attachment.getId()).isEqualTo(id);
        assertThat(attachment.getProcedureId()).isEqualTo(procedureId);
        assertThat(attachment.getName()).isEqualTo("doc.pdf");
        assertThat(attachment.getType()).isEqualTo("application/pdf");
        assertThat(attachment.getStoragePath()).isEqualTo("/docs/doc.pdf");
        assertThat(attachment.getUploadedAt()).isEqualTo(now);
        assertThat(attachment.getCreatedAt()).isEqualTo(now);
    }
}
