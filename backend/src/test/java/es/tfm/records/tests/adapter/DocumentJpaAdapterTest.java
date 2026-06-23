package es.tfm.records.tests.adapter;

import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.domain.model.Document;
import es.tfm.records.infrastructure.persistence.adapter.DocumentJpaAdapter;
import es.tfm.records.infrastructure.persistence.entity.DocumentEntity;
import es.tfm.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfm.records.infrastructure.persistence.repository.DocumentJpaRepository;
import es.tfm.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentJpaAdapterTest {

    @Mock
    private DocumentJpaRepository jpaRepository;

    @Mock
    private ProcedureJpaRepository procedureJpaRepository;

    @InjectMocks
    private DocumentJpaAdapter adapter;

    @Test
    void findByProcedureId_shouldReturnDocuments() {
        UUID procedureId = UUID.randomUUID();
        DocumentEntity entity = new DocumentEntity();
        entity.setId(UUID.randomUUID());
        entity.setName("Test Doc");

        when(jpaRepository.findByProcedureId(procedureId)).thenReturn(List.of(entity));

        List<Document> result = adapter.findByProcedureId(procedureId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(entity.getId());
    }

    @Test
    void findById_shouldReturnDocumentWhenFound() {
        UUID id = UUID.randomUUID();
        DocumentEntity entity = new DocumentEntity();
        entity.setId(id);
        entity.setName("Test Doc");

        when(jpaRepository.findById(id)).thenReturn(Optional.of(entity));

        Optional<Document> result = adapter.findById(id);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
    }

    @Test
    void save_shouldSaveAndReturnDocument() {
        UUID docId = UUID.randomUUID();
        UUID procId = UUID.randomUUID();
        Document document = new Document();
        document.setId(docId);
        document.setProcedureId(procId);
        document.setName("Test Doc");

        ProcedureEntity procedureEntity = new ProcedureEntity();
        procedureEntity.setId(procId);

        DocumentEntity savedEntity = new DocumentEntity();
        savedEntity.setId(docId);
        savedEntity.setName("Test Doc");
        savedEntity.setProcedure(procedureEntity);

        when(procedureJpaRepository.findById(procId)).thenReturn(Optional.of(procedureEntity));
        when(jpaRepository.save(any(DocumentEntity.class))).thenReturn(savedEntity);

        Document result = adapter.save(document);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(docId);
        verify(procedureJpaRepository).findById(procId);
        verify(jpaRepository).save(any(DocumentEntity.class));
    }

    @Test
    void save_shouldThrowResourceNotFoundExceptionWhenProcedureNotFound() {
        UUID docId = UUID.randomUUID();
        UUID procId = UUID.randomUUID();
        Document document = new Document();
        document.setId(docId);
        document.setProcedureId(procId);

        when(procedureJpaRepository.findById(procId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adapter.save(document))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("PROC")
                .hasMessageContaining(procId.toString());
    }
}
