package es.tfm.records.infrastructure.persistence.adapter;

import es.tfm.records.domain.port.MessageAttachmentRepository;
import es.tfm.records.infrastructure.persistence.entity.MessageAttachmentEntity;
import es.tfm.records.infrastructure.persistence.repository.MessageAttachmentJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA adapter for MessageAttachmentRepository.
 */
@Repository
public class MessageAttachmentRepositoryAdapter implements MessageAttachmentRepository {

    private final MessageAttachmentJpaRepository jpaRepository;

    public MessageAttachmentRepositoryAdapter(MessageAttachmentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public MessageAttachmentEntity save(MessageAttachmentEntity attachment) {
        return jpaRepository.save(attachment);
    }

    @Override
    public Optional<MessageAttachmentEntity> findById(UUID id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<MessageAttachmentEntity> findByMessageId(UUID messageId) {
        return jpaRepository.findByMessageId(messageId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
