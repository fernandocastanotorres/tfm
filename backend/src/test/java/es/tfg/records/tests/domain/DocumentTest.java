package es.tfg.records.tests.domain;

import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentTest {

    @Test
    void defaultConstructor_shouldCreateEmptyDocument() {
        Document doc = new Document();
        assertThat(doc.getId()).isNull();
        assertThat(doc.getProcedureId()).isNull();
        assertThat(doc.getName()).isNull();
        assertThat(doc.getMimeType()).isNull();
        assertThat(doc.getSize()).isZero();
        assertThat(doc.getVersion()).isZero();
        assertThat(doc.getStatus()).isNull();
        assertThat(doc.getStoragePath()).isNull();
        assertThat(doc.getUploadedAt()).isNull();
        assertThat(doc.getCreatedAt()).isNull();
        assertThat(doc.getUpdatedAt()).isNull();
    }

    @Test
    void parameterizedConstructor_shouldSetFields() {
        UUID id = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        String name = "contract.pdf";
        String mimeType = "application/pdf";
        long size = 1024L;
        int version = 1;
        DocumentStatus status = DocumentStatus.VALIDATED;
        String storagePath = "/storage/contract.pdf";

        Document doc = new Document(id, procedureId, name, mimeType, size, version, status, storagePath);

        assertThat(doc.getId()).isEqualTo(id);
        assertThat(doc.getProcedureId()).isEqualTo(procedureId);
        assertThat(doc.getName()).isEqualTo(name);
        assertThat(doc.getMimeType()).isEqualTo(mimeType);
        assertThat(doc.getSize()).isEqualTo(size);
        assertThat(doc.getVersion()).isEqualTo(version);
        assertThat(doc.getStatus()).isEqualTo(status);
        assertThat(doc.getStoragePath()).isEqualTo(storagePath);
    }

    @Test
    void setters_shouldUpdateFields() {
        Document doc = new Document();
        UUID id = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        Instant now = Instant.now();

        doc.setId(id);
        doc.setProcedureId(procedureId);
        doc.setName("report.docx");
        doc.setMimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        doc.setSize(2048L);
        doc.setVersion(2);
        doc.setStatus(DocumentStatus.REJECTED);
        doc.setStoragePath("/docs/report.docx");
        doc.setUploadedAt(now);
        doc.setCreatedAt(now);
        doc.setUpdatedAt(now);

        assertThat(doc.getId()).isEqualTo(id);
        assertThat(doc.getProcedureId()).isEqualTo(procedureId);
        assertThat(doc.getName()).isEqualTo("report.docx");
        assertThat(doc.getMimeType()).isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(doc.getSize()).isEqualTo(2048L);
        assertThat(doc.getVersion()).isEqualTo(2);
        assertThat(doc.getStatus()).isEqualTo(DocumentStatus.REJECTED);
        assertThat(doc.getStoragePath()).isEqualTo("/docs/report.docx");
        assertThat(doc.getUploadedAt()).isEqualTo(now);
        assertThat(doc.getCreatedAt()).isEqualTo(now);
        assertThat(doc.getUpdatedAt()).isEqualTo(now);
    }
}
