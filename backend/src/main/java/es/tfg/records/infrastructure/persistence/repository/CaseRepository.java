package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.CaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseRepository extends JpaRepository<CaseEntity, Long> {
    // Métodos adicionales de consulta si son necesarios
}