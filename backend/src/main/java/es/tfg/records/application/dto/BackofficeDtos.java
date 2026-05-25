package es.tfg.records.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
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
            String priority,
            List<String> csvCodes
    ) {}

    public record AdminCaseDetail(
            UUID id,
            UUID procedureTypeId,
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

    public record CaseWorkflowGraph(
            UUID caseId,
            String currentStatus,
            List<CaseWorkflowNode> nodes,
            List<CaseWorkflowTransition> transitions
    ) {}

    public record CaseWorkflowNode(
            String key,
            String label,
            String category,
            int order,
            boolean visited,
            boolean current,
            boolean reachable
    ) {}

    public record CaseWorkflowTransition(
            String from,
            String to,
            String label,
            boolean visited,
            boolean candidate
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

    public record DashboardReportSummary(
            long totalCases,
            long pendingCases,
            long inProgressCases,
            long resolvedCases,
            long overdueCases,
            double slaComplianceRate,
            double averageResolutionHours
    ) {}

    public record DashboardDistributionItem(
            String key,
            String label,
            long count
    ) {}

    public record DashboardDailyTrendPoint(
            LocalDate day,
            long createdCases,
            long resolvedCases
    ) {}

    public record DashboardReport(
            DashboardReportSummary summary,
            List<DashboardDistributionItem> byStatus,
            List<DashboardDistributionItem> byProcedureType,
            List<DashboardDistributionItem> byAssignedUnit,
            List<DashboardDailyTrendPoint> dailyTrend
    ) {}

    public record EniMetadataEntry(
            String resourceType,
            UUID resourceId,
            Instant updatedAt,
            Map<String, Object> metadata
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
            @NotBlank String email,
            @NotBlank String password,
            List<String> roles,
            boolean isActive
    ) {}

    public record UpdateUserRequest(
            @NotBlank String email,
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
            String processKey,
            String assignedUnit,
            String unitCode,
            int deadlineDays,
            BigDecimal feeAmount,
            Instant createdAt,
            Instant updatedAt,
            List<ProcedureTaskConfig> tasks,
            List<FormSchemaField> formSchema
    ) {}

    public record ProcedureRequest(
            @NotBlank String title,
            String description,
            @NotNull String category,
            @NotNull String status,
            String processKey,
            @NotNull String assignedUnit,
            String unitCode,
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

    public record ProcedureTranslation(
            UUID id,
            UUID procedureTypeId,
            String locale,
            String title,
            String description,
            String unit,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record ProcedureTranslationRequest(
            String locale,
            String title,
            String description,
            String unit
    ) {}

    public record FormSchemaField(
            String id,
            String label,
            String type,
            boolean required,
            List<String> options
    ) {}

    public record FieldI18nEntry(
            UUID id,
            UUID procedureTypeId,
            int taskOrderIndex,
            String taskTitle,
            String fieldId,
            String fieldName,
            String locale,
            String name,
            String placeholder,
            List<FieldOptionEntry> options,
            Instant updatedAt
    ) {}

    public record FieldOptionEntry(
            String value,
            String label
    ) {}

    public record FieldI18nUpsertRequest(
            int taskOrderIndex,
            String fieldId,
            String locale,
            String name,
            String placeholder,
            List<FieldOptionEntry> options
    ) {}

    public record FieldI18nGroup(
            int taskOrderIndex,
            String taskTitle,
            String taskType,
            List<FieldI18nEntry> fields
    ) {}
}
