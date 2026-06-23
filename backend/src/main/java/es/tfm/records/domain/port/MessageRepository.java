package es.tfm.records.domain.port;

import es.tfm.records.infrastructure.persistence.entity.MessageEntity;

import java.util.List;
import java.util.UUID;

/**
 * Domain port for message persistence.
 */
public interface MessageRepository {

    MessageEntity save(MessageEntity message);

    List<MessageEntity> findByThreadIdOrderByCreatedAtAsc(UUID threadId);

    List<MessageEntity> findByThreadIdOrderByCreatedAtDesc(UUID threadId, int limit);

    long countByThreadId(UUID threadId);

    long countByThreadIdAndReadFalse(UUID threadId);
}
