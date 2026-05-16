package es.tfg.records.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO contract used by the private backoffice UI.
 */
public final class BackofficeDtos {

    private BackofficeDtos() {
    }

    public record AdminCaseItem(
            UUID id,
            String procedureType,
            String status,
            Instant createdAt,
            Instant lastUpdated,
            String title,
            String description,
            String assignedUnit,
            String assignedTo,
            String citizenName,
            String currentTask,
            String priority
    ) {}

    public record AdminCaseDetail(
            UUID id,
            String procedureType,
            String status,
            Instant createdAt,
            Instant lastUpdated,
            String title,
            String description,
            String currentTask,
            String assignedUnit,
            String assignedTo,
            String citizenName,
            String citizenEmail,
            List<CaseTimelineEventDto> timeline,
            List<CaseAttachmentDto> attachments,
            Map<String, Object> formData
    ) {}

    public record PendingTask(
            String id,
            UUID caseId,
            String caseTitle,
            String taskName,
            String taskType,
            String assignedTo,
            Instant dueDate,
            Instant createdAt,
            String priority
    ) {}

    public record TaskResolutionRequest(
            String action,
            String notes,
            Map<String, Object> formData,
            UUID assigneeId
    ) {}

    public record DashboardStats(
            long totalCases,
            long pendingCases,
            long casesInProgress,
            long completedToday,
            long overdueCases,
            String avgResolutionTime
    ) {}

    public record BackofficeUser(
            UUID id,
            String email,
            List<String> roles,
            Instant createdAt,
            Instant lastLogin,
            boolean isActive
    ) {}

    public record CreateUserRequest(
            String email,
            String password,
            List<String> roles,
            boolean isActive
    ) {}

    public record UpdateUserRequest(
            String email,
            List<String> roles,
            boolean isActive
    ) {}

    public record UserStatusRequest(boolean isActive) {}

    public record ManagedProcedure(
            UUID id,
            String title,
            String description,
            String category,
            String status,
            String assignedUnit,
            int deadlineDays,
            BigDecimal feeAmount,
            Instant createdAt,
            Instant updatedAt,
            List<ProcedureTaskConfig> tasks,
            List<FormSchemaField> formSchema
    ) {}

    public record ProcedureRequest(
            String title,
            String description,
            String category,
            String status,
            String assignedUnit,
            int deadlineDays,
            BigDecimal feeAmount,
            List<ProcedureTaskConfig> tasks,
            List<FormSchemaField> formSchema
    ) {}

    public record ProcedureTaskConfig(
            UUID id,
            String title,
            String type,
            String description,
            int orderIndex,
            String assignedRole
    ) {}

    public record FormSchemaField(
            String id,
            String label,
            String type,
            boolean required,
            List<String> options
    ) {}
}
