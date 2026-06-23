package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for DocumentEntity.
 */
public interface DocumentJpaRepository extends JpaRepository<DocumentEntity, UUID> {

    List<DocumentEntity> findByProcedureId(UUID procedureId);
}
