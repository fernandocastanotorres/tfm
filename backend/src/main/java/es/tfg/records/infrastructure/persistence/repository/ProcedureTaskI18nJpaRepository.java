package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskI18nEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProcedureTaskI18nJpaRepository extends JpaRepository<ProcedureTaskI18nEntity, UUID> {

    Optional<ProcedureTaskI18nEntity> findByProcedureTypeIdAndTaskOrderIndexAndLocale(
            UUID procedureTypeId, int taskOrderIndex, String locale);

    List<ProcedureTaskI18nEntity> findByProcedureTypeIdAndLocale(UUID procedureTypeId, String locale);

    List<ProcedureTaskI18nEntity> findByProcedureTypeId(UUID procedureTypeId);

    void deleteByProcedureTypeIdAndTaskOrderIndexAndLocale(UUID procedureTypeId, int taskOrderIndex, String locale);
}