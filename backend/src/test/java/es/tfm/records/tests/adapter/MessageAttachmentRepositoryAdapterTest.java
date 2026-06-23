package es.tfm.records.tests.adapter;

import es.tfm.records.infrastructure.persistence.adapter.MessageAttachmentRepositoryAdapter;
import es.tfm.records.infrastructure.persistence.entity.MessageAttachmentEntity;
import es.tfm.records.infrastructure.persistence.repository.MessageAttachmentJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageAttachmentRepositoryAdapterTest {

    @Mock
    private MessageAttachmentJpaRepository jpaRepository;

    @InjectMocks
    private MessageAttachmentRepositoryAdapter adapter;

    @Test
    void save_shouldSaveAndReturnAttachment() {
        MessageAttachmentEntity attachment = new MessageAttachmentEntity();
        attachment.setId(UUID.randomUUID());
        attachment.setName("test.pdf");

        when(jpaRepository.save(any(MessageAttachmentEntity.class))).thenReturn(attachment);

        MessageAttachmentEntity result = adapter.save(attachment);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("test.pdf");
        verify(jpaRepository).save(attachment);
    }

    @Test
    void findById_shouldReturnAttachmentWhenFound() {
        UUID id = UUID.randomUUID();
        MessageAttachmentEntity entity = new MessageAttachmentEntity();
        entity.setId(id);

        when(jpaRepository.findById(id)).thenReturn(Optional.of(entity));

        Optional<MessageAttachmentEntity> result = adapter.findById(id);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
    }

    @Test
    void findByMessageId_shouldReturnAttachments() {
        UUID messageId = UUID.randomUUID();
        MessageAttachmentEntity attachment = new MessageAttachmentEntity();
        attachment.setId(UUID.randomUUID());

        when(jpaRepository.findByMessageId(messageId)).thenReturn(List.of(attachment));

        List<MessageAttachmentEntity> result = adapter.findByMessageId(messageId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isNotNull();
    }

    @Test
    void deleteById_shouldCallJpaRepository() {
        UUID id = UUID.randomUUID();
        doNothing().when(jpaRepository).deleteById(id);

        adapter.deleteById(id);

        verify(jpaRepository).deleteById(id);
    }
}
