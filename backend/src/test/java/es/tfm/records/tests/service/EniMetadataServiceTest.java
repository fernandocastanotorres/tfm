package es.tfm.records.tests.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import es.tfm.records.application.dto.BackofficeDtos;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.service.EniMetadataService;
import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.Document;
import es.tfm.records.domain.model.DocumentStatus;
import es.tfm.records.domain.model.Procedure;
import es.tfm.records.infrastructure.persistence.entity.EniMetadataEntity;
import es.tfm.records.infrastructure.persistence.repository.EniMetadataJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EniMetadataServiceTest {

    @Mock
    private EniMetadataJpaRepository eniMetadataRepository;

    private EniMetadataService eniMetadataService;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        eniMetadataService = new EniMetadataService(eniMetadataRepository, objectMapper);
    }

    @Test
    void upsertProcedureMetadata_shouldPersistSerializedSnapshot() {
        Procedure procedure = new Procedure();
        procedure.setId(UUID.randomUUID());
        procedure.setOwnerId(UUID.randomUUID());
        procedure.setProcedureTypeId(UUID.randomUUID());
        procedure.setStatus(CaseStatus.SUBMITTED);
        procedure.setTitle("Case A");
        procedure.setCreatedAt(Instant.now());
        procedure.setUpdatedAt(Instant.now());

        when(eniMetadataRepository.findByResourceTypeAndResourceId("PROCEDURE", procedure.getId()))
                .thenReturn(Optional.empty());

        eniMetadataService.upsertProcedureMetadata(procedure);

        ArgumentCaptor<EniMetadataEntity> captor = ArgumentCaptor.forClass(EniMetadataEntity.class);
        verify(eniMetadataRepository).save(captor.capture());
        assertThat(captor.getValue().getResourceType()).isEqualTo("PROCEDURE");
        assertThat(captor.getValue().getMetadataJson()).contains("\"status\":\"SUBMITTED\"");
    }

    @Test
    void upsertDocumentMetadata_shouldPersistSerializedSnapshot() {
        Document document = new Document();
        document.setId(UUID.randomUUID());
        document.setProcedureId(UUID.randomUUID());
        document.setName("a.pdf");
        document.setMimeType("application/pdf");
        document.setSize(10);
        document.setVersion(1);
        document.setStatus(DocumentStatus.PENDING);
        document.setUploadedAt(Instant.now());
        document.setCreatedAt(Instant.now());
        document.setUpdatedAt(Instant.now());

        when(eniMetadataRepository.findByResourceTypeAndResourceId("DOCUMENT", document.getId()))
                .thenReturn(Optional.empty());

        eniMetadataService.upsertDocumentMetadata(document);

        ArgumentCaptor<EniMetadataEntity> captor = ArgumentCaptor.forClass(EniMetadataEntity.class);
        verify(eniMetadataRepository).save(captor.capture());
        assertThat(captor.getValue().getResourceType()).isEqualTo("DOCUMENT");
        assertThat(captor.getValue().getMetadataJson()).contains("\"name\":\"a.pdf\"");
    }

    @Test
    void getProcedureMetadata_shouldReturnDto() {
        UUID procedureId = UUID.randomUUID();
        EniMetadataEntity entity = new EniMetadataEntity();
        entity.setId(UUID.randomUUID());
        entity.setResourceType("PROCEDURE");
        entity.setResourceId(procedureId);
        entity.setMetadataJson("{\"status\":\"SUBMITTED\"}");

        when(eniMetadataRepository.findByResourceTypeAndResourceId("PROCEDURE", procedureId))
                .thenReturn(Optional.of(entity));

        BackofficeDtos.EniMetadataEntry result = eniMetadataService.getProcedureMetadata(procedureId);
        assertThat(result.resourceType()).isEqualTo("PROCEDURE");
        assertThat(result.metadata()).containsEntry("status", "SUBMITTED");
    }

    @Test
    void getDocumentMetadata_shouldThrowWhenNotFound() {
        UUID documentId = UUID.randomUUID();
        when(eniMetadataRepository.findByResourceTypeAndResourceId("DOCUMENT", documentId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> eniMetadataService.getDocumentMetadata(documentId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
