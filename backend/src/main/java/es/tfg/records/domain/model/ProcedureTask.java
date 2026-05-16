package es.tfg.records.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain model representing a task definition within a procedure type workflow.
 */
public class ProcedureTask {

    private UUID id;
    private UUID procedureTypeId;
    private TaskType type;
    private int orderIndex;
    private String title;
    private String description;
    private String formSchema;
    private String uploadRequirements;
    private Instant createdAt;
    private Instant updatedAt;

    public ProcedureTask() {
    }

    public ProcedureTask(UUID id, UUID procedureTypeId, TaskType type, int orderIndex,
                         String title, String description) {
        this.id = id;
        this.procedureTypeId = procedureTypeId;
        this.type = type;
        this.orderIndex = orderIndex;
        this.title = title;
        this.description = description;
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
