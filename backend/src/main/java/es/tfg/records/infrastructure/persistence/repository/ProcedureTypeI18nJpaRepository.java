package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeI18nEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProcedureTypeI18nJpaRepository extends JpaRepository<ProcedureTypeI18nEntity, UUID> {

    Optional<ProcedureTypeI18nEntity> findByProcedureTypeIdAndLocale(UUID procedureTypeId, String locale);

    List<ProcedureTypeI18nEntity> findByProcedureTypeIdOrderByLocaleAsc(UUID procedureTypeId);
}
