package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.TransparencyReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TransparencyReportJpaRepository extends JpaRepository<TransparencyReportEntity, UUID> {

    List<TransparencyReportEntity> findByPublishedTrueOrderBySortOrderAscYearDesc();

    List<TransparencyReportEntity> findAllByOrderBySortOrderAscYearDesc();
}
