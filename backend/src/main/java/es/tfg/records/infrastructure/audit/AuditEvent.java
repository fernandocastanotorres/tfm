package es.tfg.records.infrastructure.audit;

import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;

import java.util.UUID;

/**
 * Immutable record representing a security audit event to be published
 * via Spring's ApplicationEvent mechanism for async persistence.
 */
public record AuditEvent(
        String userId,
        AuditAction action,
        String resourceType,
        UUID resourceUuid,
        String clientIp,
        String appContext,
        AuditResult result,
        String details
) {

    public static AuditEventBuilder builder() {
        return new AuditEventBuilder();
    }

    public static class AuditEventBuilder {
        private String userId;
        private AuditAction action;
        private String resourceType;
        private UUID resourceUuid;
        private String clientIp;
        private String appContext;
        private AuditResult result;
        private String details;

        public AuditEventBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public AuditEventBuilder action(AuditAction action) {
            this.action = action;
            return this;
        }

        public AuditEventBuilder resourceType(String resourceType) {
            this.resourceType = resourceType;
            return this;
        }

        public AuditEventBuilder resourceUuid(UUID resourceUuid) {
            this.resourceUuid = resourceUuid;
            return this;
        }

        public AuditEventBuilder clientIp(String clientIp) {
            this.clientIp = clientIp;
            return this;
        }

        public AuditEventBuilder appContext(String appContext) {
            this.appContext = appContext;
            return this;
        }

        public AuditEventBuilder result(AuditResult result) {
            this.result = result;
            return this;
        }

        public AuditEventBuilder details(String details) {
            this.details = details;
            return this;
        }

        public AuditEvent build() {
            return new AuditEvent(userId, action, resourceType, resourceUuid,
                    clientIp, appContext, result, details);
        }
    }
}
