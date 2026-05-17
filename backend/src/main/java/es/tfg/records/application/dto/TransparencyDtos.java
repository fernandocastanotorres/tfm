package es.tfg.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TransparencyDtos {

    private TransparencyDtos() {
    }

    @Schema(description = "Admin-facing transparency report with file path")
    public record TransparencyReportDto(
            UUID id,
            String title,
            int year,
            String description,
            String filePath,
            String fileName,
            long fileSize,
            String mimeType,
            boolean published,
            int sortOrder,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    @Schema(description = "Public-facing transparency report (no file path)")
    public record PublicTransparencyReportDto(
            UUID id,
            String title,
            int year,
            String description,
            String fileName,
            long fileSize,
            Instant createdAt
    ) {
    }

    @Schema(description = "Metadata update request for transparency report")
    public record UpdateReportRequest(
            String title,
            Integer year,
            String description,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Public transparency metrics")
    public record TransparencyMetricsDto(
            long totalProcedures,
            long resolvedProcedures,
            long pendingProcedures,
            double avgResolutionDays,
            double slaComplianceRate,
            double digitalProceduresPct
    ) {
    }

    @Schema(description = "Analytics report with extended metrics")
    public record AnalyticsReport(
            BackofficeDtos.DashboardReportSummary summary,
            List<BackofficeDtos.DashboardDistributionItem> byStatus,
            List<BackofficeDtos.DashboardDistributionItem> byProcedureType,
            List<BackofficeDtos.DashboardDistributionItem> byAssignedUnit,
            List<BackofficeDtos.DashboardDailyTrendPoint> dailyTrend,
            List<MonthlyTrendPoint> monthlyTrend,
            List<ProcedureTypeMetric> procedureTypeMetrics,
            List<UnitSlaBreakdown> unitSlaBreakdown
    ) {
    }

    @Schema(description = "Monthly trend data point")
    public record MonthlyTrendPoint(
            String month,
            long createdCases,
            long resolvedCases,
            double avgResolutionHours
    ) {
    }

    @Schema(description = "Per-procedure-type performance metric")
    public record ProcedureTypeMetric(
            String procedureType,
            long totalResolved,
            double avgResolutionHours,
            double medianResolutionHours,
            double slaComplianceRate
    ) {
    }

    @Schema(description = "Per-unit SLA compliance breakdown")
    public record UnitSlaBreakdown(
            String unit,
            long totalCases,
            long resolvedWithinSla,
            long totalResolved,
            double slaComplianceRate
    ) {
    }
}
