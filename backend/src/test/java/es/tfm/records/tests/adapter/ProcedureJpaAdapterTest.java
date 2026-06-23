package es.tfm.records.tests.adapter;

import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.Procedure;
import es.tfm.records.infrastructure.persistence.adapter.ProcedureJpaAdapter;
import es.tfm.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfm.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcedureJpaAdapterTest {

    @Mock
    private ProcedureJpaRepository jpaRepository;

    @InjectMocks
    private ProcedureJpaAdapter adapter;

    @Test
    void findByOwnerId_shouldReturnPagedProcedures() {
        UUID ownerId = UUID.randomUUID();
        ProcedureEntity entity = new ProcedureEntity();
        entity.setId(UUID.randomUUID());
        entity.setOwnerId(ownerId);
        entity.setTitle("Test Procedure");
        entity.setStatus(CaseStatus.DRAFT);

        Page<ProcedureEntity> page = new PageImpl<>(List.of(entity));
        when(jpaRepository.findByOwnerId(eq(ownerId), any(Pageable.class))).thenReturn(page);

        List<Procedure> result = adapter.findByOwnerId(ownerId, 0, 10);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(entity.getId());
        assertThat(result.get(0).getTitle()).isEqualTo("Test Procedure");
    }

    @Test
    void countByOwnerId_shouldReturnCount() {
        UUID ownerId = UUID.randomUUID();
        when(jpaRepository.countByOwnerId(ownerId)).thenReturn(5L);

        long count = adapter.countByOwnerId(ownerId);

        assertThat(count).isEqualTo(5L);
    }

    @Test
    void findById_shouldReturnProcedureWhenFound() {
        UUID id = UUID.randomUUID();
        ProcedureEntity entity = new ProcedureEntity();
        entity.setId(id);
        entity.setTitle("Test Procedure");

        when(jpaRepository.findById(id)).thenReturn(Optional.of(entity));

        Optional<Procedure> result = adapter.findById(id);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
    }

    @Test
    void findById_shouldReturnEmptyWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(jpaRepository.findById(id)).thenReturn(Optional.empty());

        Optional<Procedure> result = adapter.findById(id);

        assertThat(result).isEmpty();
    }

    @Test
    void save_shouldSaveAndReturnProcedure() {
        Procedure procedure = new Procedure();
        procedure.setId(UUID.randomUUID());
        procedure.setTitle("New Procedure");
        procedure.setOwnerId(UUID.randomUUID());

        ProcedureEntity entity = new ProcedureEntity();
        entity.setId(procedure.getId());
        entity.setTitle("New Procedure");

        when(jpaRepository.save(any(ProcedureEntity.class))).thenReturn(entity);

        Procedure result = adapter.save(procedure);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(entity.getId());
        verify(jpaRepository).save(any(ProcedureEntity.class));
    }

    @Test
    void existsById_shouldReturnTrueWhenExists() {
        UUID id = UUID.randomUUID();
        when(jpaRepository.existsById(id)).thenReturn(true);

        boolean exists = adapter.existsById(id);

        assertThat(exists).isTrue();
    }

    @Test
    void existsById_shouldReturnFalseWhenNotExists() {
        UUID id = UUID.randomUUID();
        when(jpaRepository.existsById(id)).thenReturn(false);

        boolean exists = adapter.existsById(id);

        assertThat(exists).isFalse();
    }
}
