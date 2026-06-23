package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.FormalNotificationAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FormalNotificationAttachmentJpaRepository extends JpaRepository<FormalNotificationAttachmentEntity, UUID> {

    List<FormalNotificationAttachmentEntity> findByNotificationId(UUID notificationId);
}
