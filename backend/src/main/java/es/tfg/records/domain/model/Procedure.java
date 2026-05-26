package es.tfg.records.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain model representing a case (expediente) — a citizen's procedure instance.
 */
public class Procedure {

    private UUID id;
    private UUID procedureTypeId;
    private UUID ownerId;
    private String title;
    private CaseStatus status;
    private String formData;
    private String assignedUnit;
    private String unitCode;
    private String processInstanceId;
    private Instant submittedAt;
    private String recordNumber;
    private String entryNumber;
    private Instant createdAt;
    private Instant updatedAt;

    public Procedure() {
    }

    public Procedure(UUID id, UUID procedureTypeId, UUID ownerId, String title,
                     CaseStatus status, String formData, String assignedUnit,
                     Instant submittedAt) {
        this.id = id;
        this.procedureTypeId = procedureTypeId;
        this.ownerId = ownerId;
        this.title = title;
        this.status = status;
        this.formData = formData;
        this.assignedUnit = assignedUnit;
        this.submittedAt = submittedAt;
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

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public String getFormData() {
        return formData;
    }

    public void setFormData(String formData) {
        this.formData = formData;
    }

    public String getAssignedUnit() {
        return assignedUnit;
    }

    public void setAssignedUnit(String assignedUnit) {
        this.assignedUnit = assignedUnit;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public String getUnitCode() {
        return unitCode;
    }

    public void setUnitCode(String unitCode) {
        this.unitCode = unitCode;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getRecordNumber() {
        return recordNumber;
    }

    public void setRecordNumber(String recordNumber) {
        this.recordNumber = recordNumber;
    }

    public String getEntryNumber() {
        return entryNumber;
    }

    public void setEntryNumber(String entryNumber) {
        this.entryNumber = entryNumber;
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
