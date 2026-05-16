package es.tfg.records.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain model representing a timeline event in a case's lifecycle.
 */
public class CaseTimelineEvent {

    private UUID id;
    private UUID procedureId;
    private String title;
    private String description;
    private Instant date;
    private Instant createdAt;

    public CaseTimelineEvent() {
    }

    public CaseTimelineEvent(UUID id, UUID procedureId, String title,
                             String description, Instant date) {
        this.id = id;
        this.procedureId = procedureId;
        this.title = title;
        this.description = description;
        this.date = date;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
