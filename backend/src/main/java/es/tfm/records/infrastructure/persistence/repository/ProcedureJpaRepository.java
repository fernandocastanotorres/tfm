package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.infrastructure.persistence.entity.ProcedureEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Spring Data JPA repository for ProcedureEntity.
 */
public interface ProcedureJpaRepository extends JpaRepository<ProcedureEntity, UUID> {

    Page<ProcedureEntity> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<ProcedureEntity> findByStatus(CaseStatus status, Pageable pageable);

    java.util.List<ProcedureEntity> findAllByOwnerId(UUID ownerId);

    long countByOwnerId(UUID ownerId);

    boolean existsByOwnerIdAndStatus(UUID ownerId, CaseStatus status);
}
