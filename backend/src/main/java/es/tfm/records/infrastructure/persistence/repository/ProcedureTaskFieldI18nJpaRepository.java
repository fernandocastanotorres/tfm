package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.ProcedureTaskFieldI18nEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for procedure task field i18n translations.
 */
public interface ProcedureTaskFieldI18nJpaRepository extends JpaRepository<ProcedureTaskFieldI18nEntity, UUID> {

    Optional<ProcedureTaskFieldI18nEntity> findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
            UUID procedureTypeId, int taskOrderIndex, String fieldId, String locale);

    List<ProcedureTaskFieldI18nEntity> findByProcedureTypeIdAndLocale(UUID procedureTypeId, String locale);

    List<ProcedureTaskFieldI18nEntity> findByProcedureTypeId(UUID procedureTypeId);
}
