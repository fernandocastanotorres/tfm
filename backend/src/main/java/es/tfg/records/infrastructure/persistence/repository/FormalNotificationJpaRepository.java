package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.domain.model.FormalNotificationStatus;
import es.tfg.records.infrastructure.persistence.entity.FormalNotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface FormalNotificationJpaRepository extends JpaRepository<FormalNotificationEntity, UUID> {

    List<FormalNotificationEntity> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);

    long countByCitizenIdAndStatusIn(UUID citizenId, Collection<FormalNotificationStatus> statuses);

    List<FormalNotificationEntity> findByStatusInAndExpiresAtBefore(Collection<FormalNotificationStatus> statuses, Instant cutoff);

    org.springframework.data.domain.Page<FormalNotificationEntity> findByStatus(FormalNotificationStatus status, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<FormalNotificationEntity> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
}
