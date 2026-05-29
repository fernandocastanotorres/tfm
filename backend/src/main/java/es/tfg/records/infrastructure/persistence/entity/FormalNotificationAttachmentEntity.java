package es.tfg.records.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "formal_notification_attachments")
@EntityListeners(AuditingEntityListener.class)
public class FormalNotificationAttachmentEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "notification_id", nullable = false)
    private FormalNotificationEntity notification;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "size", nullable = false)
    private long size;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public FormalNotificationEntity getNotification() { return notification; }
    public void setNotification(FormalNotificationEntity notification) { this.notification = notification; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }
    public Instant getCreatedAt() { return createdAt; }
}
