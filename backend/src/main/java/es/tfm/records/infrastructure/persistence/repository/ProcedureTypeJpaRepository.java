package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for ProcedureTypeEntity.
 */
public interface ProcedureTypeJpaRepository extends JpaRepository<ProcedureTypeEntity, UUID> {

    List<ProcedureTypeEntity> findByStatus(String status);
}
