package es.tfg.records.domain.port;

import es.tfg.records.infrastructure.persistence.entity.MessageThreadEntity;

import java.util.Optional;
import java.util.UUID;

/**
 * Domain port for message thread persistence.
 */
public interface MessageThreadRepository {

    MessageThreadEntity save(MessageThreadEntity thread);

    Optional<MessageThreadEntity> findById(UUID id);

    Optional<MessageThreadEntity> findByProcedureId(UUID procedureId);

    long countByUnreadCountCitizenGreaterThan(int count);

    long countByUnreadCountAdminGreaterThan(int count);
}
