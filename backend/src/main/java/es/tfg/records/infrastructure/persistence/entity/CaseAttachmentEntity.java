package es.tfg.records.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the case_attachments table.
 */
@Entity
@Table(name = "case_attachments")
@EntityListeners(AuditingEntityListener.class)
public class CaseAttachmentEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "procedure_id", nullable = false)
    private UUID procedureId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public CaseAttachmentEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProcedureId() {
        return procedureId;
    }

    public void setProcedureId(UUID procedureId) {
        this.procedureId = procedureId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
