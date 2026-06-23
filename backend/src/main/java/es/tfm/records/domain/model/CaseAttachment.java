package es.tfm.records.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain model representing an attachment linked to a case.
 */
public class CaseAttachment {

    private UUID id;
    private UUID procedureId;
    private String name;
    private String type;
    private String storagePath;
    private Instant uploadedAt;
    private Instant createdAt;

    public CaseAttachment() {
    }

    public CaseAttachment(UUID id, UUID procedureId, String name,
                          String type, String storagePath) {
        this.id = id;
        this.procedureId = procedureId;
        this.name = name;
        this.type = type;
        this.storagePath = storagePath;
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

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
