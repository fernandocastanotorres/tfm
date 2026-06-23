package es.tfm.records.domain.port;

import es.tfm.records.infrastructure.persistence.entity.MessageAttachmentEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Domain port for message attachment persistence.
 */
public interface MessageAttachmentRepository {

    MessageAttachmentEntity save(MessageAttachmentEntity attachment);

    Optional<MessageAttachmentEntity> findById(UUID id);

    List<MessageAttachmentEntity> findByMessageId(UUID messageId);

    void deleteById(UUID id);
}
