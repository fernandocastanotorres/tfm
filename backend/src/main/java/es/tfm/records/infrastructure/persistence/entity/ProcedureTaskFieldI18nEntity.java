package es.tfm.records.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity storing i18n translations for dynamic form field display text.
 * Each row holds the localized name, placeholder, and option labels for a
 * specific field within a procedure task.
 */
@Entity
@Table(
        name = "procedure_task_field_i18n",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_field_i18n",
                columnNames = {"procedure_type_id", "task_order_index", "field_id", "locale"}
        ),
        indexes = @Index(name = "idx_field_i18n_locale", columnList = "locale")
)
@EntityListeners(AuditingEntityListener.class)
public class ProcedureTaskFieldI18nEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "procedure_type_id", nullable = false)
    private UUID procedureTypeId;

    @Column(name = "task_order_index", nullable = false)
    private int taskOrderIndex;

    @Column(name = "field_id", nullable = false, length = 100)
    private String fieldId;

    @Column(nullable = false, length = 10)
    private String locale;

    @Column(length = 255)
    private String name;

    @Column(length = 255)
    private String placeholder;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

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

    public int getTaskOrderIndex() {
        return taskOrderIndex;
    }

    public void setTaskOrderIndex(int taskOrderIndex) {
        this.taskOrderIndex = taskOrderIndex;
    }

    public String getFieldId() {
        return fieldId;
    }

    public void setFieldId(String fieldId) {
        this.fieldId = fieldId;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPlaceholder() {
        return placeholder;
    }

    public void setPlaceholder(String placeholder) {
        this.placeholder = placeholder;
    }

    public String getOptionsJson() {
        return optionsJson;
    }

    public void setOptionsJson(String optionsJson) {
        this.optionsJson = optionsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
