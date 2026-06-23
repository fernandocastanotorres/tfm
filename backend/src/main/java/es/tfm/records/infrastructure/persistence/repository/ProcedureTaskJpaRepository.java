package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.ProcedureTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for ProcedureTaskEntity.
 */
public interface ProcedureTaskJpaRepository extends JpaRepository<ProcedureTaskEntity, UUID> {

    List<ProcedureTaskEntity> findByProcedureTypeIdOrderByOrderIndexAsc(UUID procedureTypeId);
}
