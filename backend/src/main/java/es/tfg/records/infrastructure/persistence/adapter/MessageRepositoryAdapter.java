package es.tfg.records.infrastructure.persistence.adapter;

import es.tfg.records.domain.port.MessageRepository;
import es.tfg.records.infrastructure.persistence.entity.MessageEntity;
import es.tfg.records.infrastructure.persistence.repository.MessageJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * JPA adapter for MessageRepository.
 */
@Repository
public class MessageRepositoryAdapter implements MessageRepository {

    private final MessageJpaRepository jpaRepository;

    public MessageRepositoryAdapter(MessageJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public MessageEntity save(MessageEntity message) {
        return jpaRepository.save(message);
    }

    @Override
    public List<MessageEntity> findByThreadIdOrderByCreatedAtAsc(UUID threadId) {
        return jpaRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    @Override
    public List<MessageEntity> findByThreadIdOrderByCreatedAtDesc(UUID threadId, int limit) {
        return jpaRepository.findByThreadIdOrderByCreatedAtDesc(threadId, PageRequest.of(0, limit));
    }

    @Override
    public long countByThreadId(UUID threadId) {
        return jpaRepository.countByThreadId(threadId);
    }

    @Override
    public long countByThreadIdAndReadFalse(UUID threadId) {
        return jpaRepository.countByThreadIdAndReadFalse(threadId);
    }
}
