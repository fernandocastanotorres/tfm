package es.tfg.records.infrastructure.audit;

import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity;
import es.tfg.records.infrastructure.persistence.repository.AuditLogJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Async event listener that persists audit events to the database.
 * Decouples audit recording from the request thread for performance.
 */
@Component
public class AuditEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);

    private final AuditLogJpaRepository auditLogRepository;

    public AuditEventListener(AuditLogJpaRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    @EventListener
    public void onAuditEvent(AuditEvent event) {
        try {
            AuditLogEntity entity = new AuditLogEntity();
            entity.setId(UUID.randomUUID());
            entity.setUserId(event.userId());
            entity.setAction(event.action());
            entity.setResourceType(event.resourceType());
            entity.setResourceUuid(event.resourceUuid());
            entity.setClientIp(event.clientIp());
            entity.setAppContext(event.appContext());
            entity.setResult(event.result());
            entity.setDetails(event.details());

            auditLogRepository.save(entity);
            log.debug("Audit event recorded: {} {} by {} -> {}",
                    event.action(), event.resourceType(), event.userId(), event.result());
        } catch (Exception e) {
            log.error("Failed to persist audit event: {}", event, e);
        }
    }
}
