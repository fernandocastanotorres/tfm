package es.tfm.records.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "public_content_entries")
public class PublicContentEntryEntity {

    @Id
    private UUID id;

    @Column(name = "translation_group_id", nullable = false)
    private UUID translationGroupId;

    @Column(name = "parent_group_id")
    private UUID parentGroupId;

    @Column(name = "entry_kind", nullable = false, length = 32)
    private String entryKind;

    @Column(nullable = false, length = 16)
    private String locale;

    @Column(name = "category_code", length = 64)
    private String categoryCode;

    @Column(name = "value_type", length = 32)
    private String valueType;

    @Column(name = "title_text", nullable = false, length = 512)
    private String titleText;

    @Column(name = "body_text", columnDefinition = "TEXT")
    private String bodyText;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "external_url", length = 1024)
    private String externalUrl;

    @Column(name = "download_url", length = 1024)
    private String downloadUrl;

    @Column(name = "related_procedure", length = 128)
    private String relatedProcedure;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTranslationGroupId() { return translationGroupId; }
    public void setTranslationGroupId(UUID translationGroupId) { this.translationGroupId = translationGroupId; }
    public UUID getParentGroupId() { return parentGroupId; }
    public void setParentGroupId(UUID parentGroupId) { this.parentGroupId = parentGroupId; }
    public String getEntryKind() { return entryKind; }
    public void setEntryKind(String entryKind) { this.entryKind = entryKind; }
    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
    public String getValueType() { return valueType; }
    public void setValueType(String valueType) { this.valueType = valueType; }
    public String getTitleText() { return titleText; }
    public void setTitleText(String titleText) { this.titleText = titleText; }
    public String getBodyText() { return bodyText; }
    public void setBodyText(String bodyText) { this.bodyText = bodyText; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
    public String getRelatedProcedure() { return relatedProcedure; }
    public void setRelatedProcedure(String relatedProcedure) { this.relatedProcedure = relatedProcedure; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
