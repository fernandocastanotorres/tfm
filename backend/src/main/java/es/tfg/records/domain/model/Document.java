package es.tfg.records.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain model representing a document attached to a procedure.
 */
public class Document {

    private UUID id;
    private UUID procedureId;
    private String name;
    private String mimeType;
    private long size;
    private int version;
    private DocumentStatus status;
    private String storagePath;
    private Instant uploadedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public Document() {
    }

    public Document(UUID id, UUID procedureId, String name, String mimeType,
                    long size, int version, DocumentStatus status, String storagePath) {
        this.id = id;
        this.procedureId = procedureId;
        this.name = name;
        this.mimeType = mimeType;
        this.size = size;
        this.version = version;
        this.status = status;
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

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
