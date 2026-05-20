package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.MessageAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for message attachments.
 */
public interface MessageAttachmentJpaRepository extends JpaRepository<MessageAttachmentEntity, UUID> {

    List<MessageAttachmentEntity> findByMessageId(UUID messageId);
}
