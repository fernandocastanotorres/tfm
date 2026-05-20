package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.MessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for messages.
 */
public interface MessageJpaRepository extends JpaRepository<MessageEntity, UUID> {

    List<MessageEntity> findByThreadIdOrderByCreatedAtAsc(UUID threadId);

    List<MessageEntity> findByThreadIdOrderByCreatedAtDesc(UUID threadId, Pageable pageable);

    long countByThreadId(UUID threadId);

    long countByThreadIdAndReadFalse(UUID threadId);
}
