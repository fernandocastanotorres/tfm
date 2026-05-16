package es.tfg.records.tests.mapper;

import es.tfg.records.application.dto.DocumentDetail;
import es.tfg.records.application.dto.DocumentItem;
import es.tfg.records.application.mapper.DocumentMapper;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentMapperTest {

    private UUID docId = UUID.randomUUID();
    private UUID procedureId = UUID.randomUUID();
    private Instant now = Instant.now();

    // ===== toDocumentItem Tests =====

    @Test
    void toDocumentItem_shouldMapDocumentToDocumentItem() {
        // Given
        Document document = new Document(
                docId,
                procedureId,
                "passport.pdf",
                "application/pdf",
                1024L,
                1,
                DocumentStatus.PENDING,
                "/storage/docs/passport.pdf"
        );
        document.setUploadedAt(now);

        // When
        DocumentItem result = DocumentMapper.toDocumentItem(document);

        // Then
        assertThat(result.id()).isEqualTo(docId);
        assertThat(result.name()).isEqualTo("passport.pdf");
        assertThat(result.mimeType()).isEqualTo("application/pdf");
        assertThat(result.size()).isEqualTo(1024L);
        assertThat(result.version()).isEqualTo(1);
        assertThat(result.uploadedAt()).isEqualTo(now);
        assertThat(result.status()).isEqualTo("PENDING");
        assertThat(result.caseId()).isEqualTo(procedureId);
    }

    @Test
    void toDocumentItem_shouldHandleAllDocumentStatuses() {
        DocumentStatus[] statuses = DocumentStatus.values();

        for (DocumentStatus status : statuses) {
            // Given
            Document document = new Document(
                    docId,
                    procedureId,
                    "test.pdf",
                    "application/pdf",
                    100L,
                    1,
                    status,
                    "/path"
            );

            // When
            DocumentItem result = DocumentMapper.toDocumentItem(document);

            // Then
            assertThat(result.status()).isEqualTo(status.name());
        }
    }

    @Test
    void toDocumentItem_shouldHandleLargeFileSize() {
        // Given - 10MB file
        Document document = new Document(
                docId,
                procedureId,
                "large.pdf",
                "application/pdf",
                10_485_760L, // 10MB
                1,
                DocumentStatus.PENDING,
                "/path"
        );

        // When
        DocumentItem result = DocumentMapper.toDocumentItem(document);

        // Then
        assertThat(result.size()).isEqualTo(10_485_760L);
    }

    // ===== toDocumentDetail Tests =====

    @Test
    void toDocumentDetail_shouldMapDocumentToDocumentDetail() {
        // Given
        Document document = new Document(
                docId,
                procedureId,
                "identity_document.pdf",
                "application/pdf",
                2048L,
                2,
                DocumentStatus.PENDING,
                "/storage/docs/identity.pdf"
        );
        document.setUploadedAt(now);

        // When
        DocumentDetail result = DocumentMapper.toDocumentDetail(document);

        // Then
        assertThat(result.id()).isEqualTo(docId);
        assertThat(result.name()).isEqualTo("identity_document.pdf");
        assertThat(result.mimeType()).isEqualTo("application/pdf");
        assertThat(result.size()).isEqualTo(2048L);
        assertThat(result.version()).isEqualTo(2);
        assertThat(result.uploadedAt()).isEqualTo(now);
        assertThat(result.status()).isEqualTo("PENDING");
        assertThat(result.caseId()).isEqualTo(procedureId);
        assertThat(result.versions()).isEmpty(); // Always empty in current impl
    }

    @Test
    void toDocumentDetail_shouldHandleAllStatuses() {
        DocumentStatus[] statuses = DocumentStatus.values();

        for (DocumentStatus status : statuses) {
            // Given
            Document document = new Document(
                    docId,
                    procedureId,
                    "test.pdf",
                    "application/pdf",
                    100L,
                    1,
                    status,
                    "/path"
            );

            // When
            DocumentDetail result = DocumentMapper.toDocumentDetail(document);

            // Then
            assertThat(result.status()).isEqualTo(status.name());
            assertThat(result.versions()).isEmpty();
        }
    }
}