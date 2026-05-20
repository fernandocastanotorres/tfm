package es.tfg.records.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the security_audit_log table.
 * Stores immutable audit events for ENS Medium Level compliance.
 */
@Entity
@Table(name = "security_audit_log")
@EntityListeners(AuditingEntityListener.class)
public class AuditLogEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @Column(length = 36)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false)
    private AuditAction action;

    @Column(nullable = false, length = 50, updatable = false)
    private String resourceType;

    @Column(updatable = false)
    private UUID resourceUuid;

    @Column(nullable = false, length = 45, updatable = false)
    private String clientIp;

    @Column(nullable = false, length = 30, updatable = false)
    private String appContext;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, updatable = false)
    private AuditResult result;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String details;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    public AuditLogEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public UUID getResourceUuid() {
        return resourceUuid;
    }

    public void setResourceUuid(UUID resourceUuid) {
        this.resourceUuid = resourceUuid;
    }

    public String getClientIp() {
        return clientIp;
    }

    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }

    public String getAppContext() {
        return appContext;
    }

    public void setAppContext(String appContext) {
        this.appContext = appContext;
    }

    public AuditResult getResult() {
        return result;
    }

    public void setResult(AuditResult result) {
        this.result = result;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public enum AuditAction {
        LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, SIGN, LOCKOUT, RATE_LIMITED
    }

    public enum AuditResult {
        SUCCESS, FAILURE
    }
}
