package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuditLogJpaRepository extends JpaRepository<AuditLogEntity, UUID> {

    List<AuditLogEntity> findByUserIdOrderByTimestampDesc(String userId);

    List<AuditLogEntity> findByResourceUuidOrderByTimestampDesc(UUID resourceUuid);

    List<AuditLogEntity> findByTimestampAfterOrderByTimestampDesc(Instant since);

    List<AuditLogEntity> findByUserIdAndTimestampAfterOrderByTimestampDesc(String userId, Instant since);
}
