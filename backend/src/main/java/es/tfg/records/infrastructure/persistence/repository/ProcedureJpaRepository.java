package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Spring Data JPA repository for ProcedureEntity.
 */
public interface ProcedureJpaRepository extends JpaRepository<ProcedureEntity, UUID> {

    Page<ProcedureEntity> findByOwnerId(UUID ownerId, Pageable pageable);

    long countByOwnerId(UUID ownerId);

    boolean existsByOwnerIdAndStatus(UUID ownerId, CaseStatus status);
}
