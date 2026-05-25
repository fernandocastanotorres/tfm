package es.tfg.records.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Domain model representing a procedure type in the catalog (e.g., license, registry).
 */
public class ProcedureType {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal feeAmount;
    private int deadlineDays;
    private String status;
    private String unit;
    private String unitCode;
    private String processKey;
    private List<ProcedureTask> tasks;
    private Instant createdAt;
    private Instant updatedAt;

    public ProcedureType() {
    }

    public ProcedureType(UUID id, String title, String description, BigDecimal feeAmount,
                         int deadlineDays, String status, String unit) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.feeAmount = feeAmount;
        this.deadlineDays = deadlineDays;
        this.status = status;
        this.unit = unit;
        this.processKey = "simpleCitizenProcedure";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public BigDecimal getFeeAmount() {
        return feeAmount;
    }

    public void setFeeAmount(BigDecimal feeAmount) {
        this.feeAmount = feeAmount;
    }

    public int getDeadlineDays() {
        return deadlineDays;
    }

    public void setDeadlineDays(int deadlineDays) {
        this.deadlineDays = deadlineDays;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public List<ProcedureTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<ProcedureTask> tasks) {
        this.tasks = tasks;
    }

    public String getUnitCode() {
        return unitCode;
    }

    public void setUnitCode(String unitCode) {
        this.unitCode = unitCode;
    }

    public String getProcessKey() {
        return processKey;
    }

    public void setProcessKey(String processKey) {
        this.processKey = processKey;
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
