package es.tfg.records.infrastructure.persistence.entity;

import es.tfg.records.domain.model.TaskType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for the procedure_tasks table.
 */
@Entity
@Table(name = "procedure_tasks")
@EntityListeners(AuditingEntityListener.class)
public class ProcedureTaskEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "procedure_type_id", nullable = false)
    private UUID procedureTypeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskType type;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "form_schema", columnDefinition = "TEXT")
    private String formSchema;

    @Column(name = "upload_requirements", columnDefinition = "TEXT")
    private String uploadRequirements;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ProcedureTaskEntity() {
    }

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

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
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

    public String getFormSchema() {
        return formSchema;
    }

    public void setFormSchema(String formSchema) {
        this.formSchema = formSchema;
    }

    public String getUploadRequirements() {
        return uploadRequirements;
    }

    public void setUploadRequirements(String uploadRequirements) {
        this.uploadRequirements = uploadRequirements;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
