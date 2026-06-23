package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.MessageThreadEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for message threads.
 */
public interface MessageThreadJpaRepository extends JpaRepository<MessageThreadEntity, UUID> {

    Optional<MessageThreadEntity> findByProcedureId(UUID procedureId);

    long countByUnreadCountCitizenGreaterThan(int count);

    long countByUnreadCountAdminGreaterThan(int count);
}
