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
    private String originalStoragePath;
    private String signedStoragePath;
    private String originalMimeType;
    private String signedMimeType;
    private Long originalSize;
    private Long signedSize;
    private String entryNumber;
    private String exitNumber;
    private boolean generated;
    private Instant uploadedAt;
    private Instant signedAt;
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

    public String getOriginalStoragePath() {
        return originalStoragePath;
    }

    public void setOriginalStoragePath(String originalStoragePath) {
        this.originalStoragePath = originalStoragePath;
    }

    public String getSignedStoragePath() {
        return signedStoragePath;
    }

    public void setSignedStoragePath(String signedStoragePath) {
        this.signedStoragePath = signedStoragePath;
    }

    public String getOriginalMimeType() {
        return originalMimeType;
    }

    public void setOriginalMimeType(String originalMimeType) {
        this.originalMimeType = originalMimeType;
    }

    public String getSignedMimeType() {
        return signedMimeType;
    }

    public void setSignedMimeType(String signedMimeType) {
        this.signedMimeType = signedMimeType;
    }

    public Long getOriginalSize() {
        return originalSize;
    }

    public void setOriginalSize(Long originalSize) {
        this.originalSize = originalSize;
    }

    public Long getSignedSize() {
        return signedSize;
    }

    public void setSignedSize(Long signedSize) {
        this.signedSize = signedSize;
    }

    public String getEntryNumber() {
        return entryNumber;
    }

    public void setEntryNumber(String entryNumber) {
        this.entryNumber = entryNumber;
    }

    public String getExitNumber() {
        return exitNumber;
    }

    public void setExitNumber(String exitNumber) {
        this.exitNumber = exitNumber;
    }

    public boolean isGenerated() {
        return generated;
    }

    public void setGenerated(boolean generated) {
        this.generated = generated;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Instant getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(Instant signedAt) {
        this.signedAt = signedAt;
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
