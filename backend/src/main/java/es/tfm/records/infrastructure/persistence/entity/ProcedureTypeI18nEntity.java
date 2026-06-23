package es.tfm.records.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "procedure_type_i18n",
        uniqueConstraints = @UniqueConstraint(name = "uk_procedure_type_i18n_locale", columnNames = {"procedure_type_id", "locale"}),
        indexes = @Index(name = "idx_procedure_type_i18n_locale", columnList = "locale")
)
@EntityListeners(AuditingEntityListener.class)
public class ProcedureTypeI18nEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "procedure_type_id", nullable = false)
    private UUID procedureTypeId;

    @Column(nullable = false, length = 10)
    private String locale;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String unit;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProcedureTypeId() {
        return procedureTypeId;
    }

    public void setProcedureTypeId(UUID procedureTypeId) {
        this.procedureTypeId = procedureTypeId;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
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

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
