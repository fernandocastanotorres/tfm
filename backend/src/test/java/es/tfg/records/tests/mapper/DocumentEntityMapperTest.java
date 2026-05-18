package es.tfg.records.tests.mapper;

import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.infrastructure.persistence.entity.DocumentEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.mapper.DocumentEntityMapper;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentEntityMapperTest {

    @Test
    void toDomain_shouldMapEntityToDomain() {
        UUID docId = UUID.randomUUID();
        UUID procId = UUID.randomUUID();
        Instant now = Instant.now();

        ProcedureEntity procedure = new ProcedureEntity();
        procedure.setId(procId);

        DocumentEntity entity = new DocumentEntity();
        entity.setId(docId);
        entity.setProcedure(procedure);
        entity.setName("test.pdf");
        entity.setMimeType("application/pdf");
        entity.setSize(1024L);
        entity.setVersion(2);
        entity.setStatus(DocumentStatus.PENDING);
        entity.setStoragePath("uploads/test.pdf");
        entity.setUploadedAt(now);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        Document domain = DocumentEntityMapper.toDomain(entity);

        assertThat(domain.getId()).isEqualTo(docId);
        assertThat(domain.getProcedureId()).isEqualTo(procId);
        assertThat(domain.getName()).isEqualTo("test.pdf");
        assertThat(domain.getMimeType()).isEqualTo("application/pdf");
        assertThat(domain.getSize()).isEqualTo(1024L);
        assertThat(domain.getVersion()).isEqualTo(2);
        assertThat(domain.getStatus()).isEqualTo(DocumentStatus.PENDING);
        assertThat(domain.getStoragePath()).isEqualTo("uploads/test.pdf");
        assertThat(domain.getUploadedAt()).isEqualTo(now);
    }

    @Test
    void toDomain_shouldHandleNullProcedure() {
        DocumentEntity entity = new DocumentEntity();
        entity.setId(UUID.randomUUID());
        entity.setProcedure(null);
        entity.setName("test.pdf");

        Document domain = DocumentEntityMapper.toDomain(entity);

        assertThat(domain.getProcedureId()).isNull();
    }

    @Test
    void toDomain_shouldReturnNullForNullEntity() {
        assertThat(DocumentEntityMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_shouldMapDomainToEntity() {
        UUID docId = UUID.randomUUID();
        UUID procId = UUID.randomUUID();
        Instant now = Instant.now();

        ProcedureEntity procedure = new ProcedureEntity();
        procedure.setId(procId);

        Document domain = new Document();
        domain.setId(docId);
        domain.setName("report.pdf");
        domain.setMimeType("application/pdf");
        domain.setSize(2048L);
        domain.setVersion(1);
        domain.setStatus(DocumentStatus.PENDING);
        domain.setStoragePath("uploads/report.pdf");
        domain.setUploadedAt(now);

        DocumentEntity entity = DocumentEntityMapper.toEntity(domain, procedure);

        assertThat(entity.getId()).isEqualTo(docId);
        assertThat(entity.getProcedure()).isEqualTo(procedure);
        assertThat(entity.getName()).isEqualTo("report.pdf");
        assertThat(entity.getMimeType()).isEqualTo("application/pdf");
        assertThat(entity.getSize()).isEqualTo(2048L);
        assertThat(entity.getVersion()).isEqualTo(1);
        assertThat(entity.getStatus()).isEqualTo(DocumentStatus.PENDING);
        assertThat(entity.getStoragePath()).isEqualTo("uploads/report.pdf");
    }

    @Test
    void toEntity_shouldDefaultStatusToPendingWhenNull() {
        Document domain = new Document();
        domain.setId(UUID.randomUUID());
        domain.setName("test.pdf");
        domain.setStatus(null);

        DocumentEntity entity = DocumentEntityMapper.toEntity(domain, new ProcedureEntity());

        assertThat(entity.getStatus()).isEqualTo(DocumentStatus.PENDING);
    }

    @Test
    void toEntity_shouldReturnNullForNullDomain() {
        assertThat(DocumentEntityMapper.toEntity(null, new ProcedureEntity())).isNull();
    }

    @Test
    void toDomainList_shouldMapListOfEntities() {
        DocumentEntity e1 = new DocumentEntity();
        e1.setId(UUID.randomUUID());
        e1.setName("doc1.pdf");

        DocumentEntity e2 = new DocumentEntity();
        e2.setId(UUID.randomUUID());
        e2.setName("doc2.pdf");

        List<Document> domains = DocumentEntityMapper.toDomainList(List.of(e1, e2));

        assertThat(domains).hasSize(2);
        assertThat(domains.get(0).getName()).isEqualTo("doc1.pdf");
        assertThat(domains.get(1).getName()).isEqualTo("doc2.pdf");
    }

    @Test
    void toDomainList_shouldReturnEmptyListForNull() {
        assertThat(DocumentEntityMapper.toDomainList(null)).isEmpty();
    }
}
