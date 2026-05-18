package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.CaseTimelineEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseTimelineEventJpaRepository extends JpaRepository<CaseTimelineEventEntity, UUID> {

    List<CaseTimelineEventEntity> findByProcedureIdOrderByDateAsc(UUID procedureId);
}
