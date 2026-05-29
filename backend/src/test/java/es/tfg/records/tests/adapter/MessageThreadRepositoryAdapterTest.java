package es.tfg.records.tests.adapter;

import es.tfg.records.infrastructure.persistence.adapter.MessageThreadRepositoryAdapter;
import es.tfg.records.infrastructure.persistence.entity.MessageThreadEntity;
import es.tfg.records.infrastructure.persistence.repository.MessageThreadJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageThreadRepositoryAdapterTest {

    @Mock
    private MessageThreadJpaRepository jpaRepository;

    @InjectMocks
    private MessageThreadRepositoryAdapter adapter;

    @Test
    void save_shouldSaveAndReturnThread() {
        MessageThreadEntity thread = new MessageThreadEntity();
        thread.setId(UUID.randomUUID());

        when(jpaRepository.save(any(MessageThreadEntity.class))).thenReturn(thread);

        MessageThreadEntity result = adapter.save(thread);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(thread.getId());
        verify(jpaRepository).save(thread);
    }

    @Test
    void findById_shouldReturnThreadWhenFound() {
        UUID id = UUID.randomUUID();
        MessageThreadEntity entity = new MessageThreadEntity();
        entity.setId(id);

        when(jpaRepository.findById(id)).thenReturn(Optional.of(entity));

        Optional<MessageThreadEntity> result = adapter.findById(id);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
    }

    @Test
    void findByProcedureId_shouldReturnThreadWhenFound() {
        UUID procedureId = UUID.randomUUID();
        MessageThreadEntity entity = new MessageThreadEntity();
        entity.setId(UUID.randomUUID());

        when(jpaRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(entity));

        Optional<MessageThreadEntity> result = adapter.findByProcedureId(procedureId);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(entity.getId());
    }

    @Test
    void countByUnreadCountCitizenGreaterThan_shouldReturnCount() {
        int count = 2;
        when(jpaRepository.countByUnreadCountCitizenGreaterThan(count)).thenReturn(10L);

        long result = adapter.countByUnreadCountCitizenGreaterThan(count);

        assertThat(result).isEqualTo(10L);
    }

    @Test
    void countByUnreadCountAdminGreaterThan_shouldReturnCount() {
        int count = 2;
        when(jpaRepository.countByUnreadCountAdminGreaterThan(count)).thenReturn(15L);

        long result = adapter.countByUnreadCountAdminGreaterThan(count);

        assertThat(result).isEqualTo(15L);
    }
}
