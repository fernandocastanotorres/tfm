package es.tfg.records.infrastructure.persistence.adapter;

import es.tfg.records.domain.port.MessageThreadRepository;
import es.tfg.records.infrastructure.persistence.entity.MessageThreadEntity;
import es.tfg.records.infrastructure.persistence.repository.MessageThreadJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * JPA adapter for MessageThreadRepository.
 */
@Repository
public class MessageThreadRepositoryAdapter implements MessageThreadRepository {

    private final MessageThreadJpaRepository jpaRepository;

    public MessageThreadRepositoryAdapter(MessageThreadJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public MessageThreadEntity save(MessageThreadEntity thread) {
        return jpaRepository.save(thread);
    }

    @Override
    public Optional<MessageThreadEntity> findById(UUID id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<MessageThreadEntity> findByProcedureId(UUID procedureId) {
        return jpaRepository.findByProcedureId(procedureId);
    }

    @Override
    public long countByUnreadCountCitizenGreaterThan(int count) {
        return jpaRepository.countByUnreadCountCitizenGreaterThan(count);
    }

    @Override
    public long countByUnreadCountAdminGreaterThan(int count) {
        return jpaRepository.countByUnreadCountAdminGreaterThan(count);
    }
}
