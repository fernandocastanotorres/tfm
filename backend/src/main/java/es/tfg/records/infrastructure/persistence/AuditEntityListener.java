package es.tfg.records.infrastructure.persistence;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;

/**
 * JPA entity listener that auto-populates createdAt and updatedAt timestamps.
 * Applied via @EntityListeners on entity classes.
 */
public class AuditEntityListener {

    private static final Logger log = LoggerFactory.getLogger(AuditEntityListener.class);

    @PrePersist
    public void prePersist(Object entity) {
        try {
            var createdAtField = entity.getClass().getDeclaredField("createdAt");
            createdAtField.setAccessible(true);
            if (createdAtField.get(entity) == null) {
                createdAtField.set(entity, Instant.now());
            }

            var updatedAtField = entity.getClass().getDeclaredField("updatedAt");
            updatedAtField.setAccessible(true);
            updatedAtField.set(entity, Instant.now());
        } catch (NoSuchFieldException | IllegalAccessException e) {
            log.debug("AuditEntityListener: entity {} does not have audit fields", entity.getClass().getSimpleName());
        }
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        try {
            var updatedAtField = entity.getClass().getDeclaredField("updatedAt");
            updatedAtField.setAccessible(true);
            updatedAtField.set(entity, Instant.now());
        } catch (NoSuchFieldException | IllegalAccessException e) {
            log.debug("AuditEntityListener: entity {} does not have updatedAt field", entity.getClass().getSimpleName());
        }
    }
}
