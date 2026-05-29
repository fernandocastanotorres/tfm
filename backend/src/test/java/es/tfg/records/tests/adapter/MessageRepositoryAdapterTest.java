package es.tfg.records.tests.adapter;

import es.tfg.records.infrastructure.persistence.adapter.MessageRepositoryAdapter;
import es.tfg.records.infrastructure.persistence.entity.MessageEntity;
import es.tfg.records.infrastructure.persistence.repository.MessageJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageRepositoryAdapterTest {

    @Mock
    private MessageJpaRepository jpaRepository;

    @InjectMocks
    private MessageRepositoryAdapter adapter;

    @Test
    void save_shouldSaveAndReturnMessage() {
        MessageEntity message = new MessageEntity();
        message.setId(UUID.randomUUID());
        message.setContent("Hello");

        when(jpaRepository.save(any(MessageEntity.class))).thenReturn(message);

        MessageEntity result = adapter.save(message);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Hello");
        verify(jpaRepository).save(message);
    }

    @Test
    void findByThreadIdOrderByCreatedAtAsc_shouldReturnMessages() {
        UUID threadId = UUID.randomUUID();
        MessageEntity message = new MessageEntity();
        message.setId(UUID.randomUUID());

        when(jpaRepository.findByThreadIdOrderByCreatedAtAsc(threadId)).thenReturn(List.of(message));

        List<MessageEntity> result = adapter.findByThreadIdOrderByCreatedAtAsc(threadId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(message.getId());
    }

    @Test
    void findByThreadIdOrderByCreatedAtDesc_shouldReturnLimitedMessages() {
        UUID threadId = UUID.randomUUID();
        int limit = 10;
        MessageEntity message = new MessageEntity();
        message.setId(UUID.randomUUID());

        when(jpaRepository.findByThreadIdOrderByCreatedAtDesc(eq(threadId), any(PageRequest.class)))
                .thenReturn(List.of(message));

        List<MessageEntity> result = adapter.findByThreadIdOrderByCreatedAtDesc(threadId, limit);

        assertThat(result).hasSize(1);
        verify(jpaRepository).findByThreadIdOrderByCreatedAtDesc(eq(threadId), any(PageRequest.class));
    }

    @Test
    void countByThreadId_shouldReturnCount() {
        UUID threadId = UUID.randomUUID();
        when(jpaRepository.countByThreadId(threadId)).thenReturn(5L);

        long count = adapter.countByThreadId(threadId);

        assertThat(count).isEqualTo(5L);
    }

    @Test
    void countByThreadIdAndReadFalse_shouldReturnCount() {
        UUID threadId = UUID.randomUUID();
        when(jpaRepository.countByThreadIdAndReadFalse(threadId)).thenReturn(3L);

        long count = adapter.countByThreadIdAndReadFalse(threadId);

        assertThat(count).isEqualTo(3L);
    }
}
