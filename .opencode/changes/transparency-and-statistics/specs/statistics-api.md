# Spec: Statistics & Analytics API

## Purpose
Define the API contract for enhanced statistics/analytics endpoints that power the visual dashboard and PDF export.

## Requirements

### Requirement: Enhanced analytics report with monthly aggregation
The system SHALL provide an analytics endpoint that extends the existing `dashboardReport()` with monthly aggregation data suitable for charting.

**Scenario: Get analytics report with default date range**
- Given an authenticated backoffice user
- When they GET `/admin/analytics/report` without date params
- Then the system returns data for the last 30 days
- Including: summary, byStatus, byProcedureType, byAssignedUnit, dailyTrend, monthlyTrend

**Scenario: Get analytics report with custom date range**
- Given an authenticated backoffice user
- When they GET `/admin/analytics/report?from=2025-01-01&to=2025-12-31`
- Then the system returns data for the specified range
- And swaps from/to if from > to (same behavior as existing dashboardReport)

**Scenario: Monthly trend aggregation**
- Given procedures with various creation and resolution dates
- When the monthlyTrend is computed
- Then each month contains: month (YYYY-MM), createdCases, resolvedCases, avgResolutionHours
- And months are ordered chronologically

### Requirement: Procedure type resolution metrics
The system SHALL compute per-procedure-type resolution statistics.

**Scenario: Resolution time by procedure type**
- Given resolved procedures of multiple types
- When the endpoint computes procedureTypeMetrics
- Then each entry contains: procedureType, totalResolved, avgResolutionHours, medianResolutionHours, slaComplianceRate
- And entries are sorted by totalResolved descending

### Requirement: SLA compliance breakdown
The system SHALL provide SLA compliance data by assigned unit.

**Scenario: SLA by unit**
- Given procedures assigned to different units
- When the endpoint computes unitSlaBreakdown
- Then each entry contains: unit, totalCases, resolvedWithinSla, totalResolved, slaComplianceRate
- And entries are sorted by slaComplianceRate ascending (worst first)

### Requirement: PDF export of statistics
The system SHALL generate a downloadable PDF report of the analytics data.

**Scenario: Export analytics as PDF**
- Given an authenticated backoffice user
- When they GET `/admin/analytics/export?format=pdf&from=2025-01-01&to=2025-06-30`
- Then the system generates a PDF containing:
  - Summary cards (total, pending, resolved, overdue, SLA rate, avg hours)
  - Status distribution chart
  - Procedure type distribution chart
  - Daily trend chart
  - Top procedure types by resolution time
- And returns `200 OK` with `Content-Type: application/pdf`
- And `Content-Disposition: attachment; filename="statistics-report-2025-01-01-to-2025-06-30.pdf"`

**Scenario: Export with default date range**
- Given an authenticated backoffice user
- When they GET `/admin/analytics/export?format=pdf` without date params
- Then the system uses the last 30 days as the date range
- And the filename reflects the actual date range used

### Requirement: Reuse existing dashboard logic
The analytics endpoint SHALL build upon the existing `BackofficeService.dashboardReport()` method to avoid code duplication.

**Scenario: Consistent summary data**
- Given the same date range
- When both `/admin/dashboard/report` and `/admin/analytics/report` are called
- Then the summary section of both responses contains identical values

## Data Model

### AnalyticsReport DTO
```
AnalyticsReport {
  summary: DashboardReportSummary        // Reuse existing DTO
  byStatus: DashboardDistributionItem[]  // Reuse existing DTO
  byProcedureType: DashboardDistributionItem[]  // Reuse existing DTO
  byAssignedUnit: DashboardDistributionItem[]   // Reuse existing DTO
  dailyTrend: DashboardDailyTrendPoint[]        // Reuse existing DTO
  monthlyTrend: MonthlyTrendPoint[]             // NEW
  procedureTypeMetrics: ProcedureTypeMetric[]   // NEW
  unitSlaBreakdown: UnitSlaBreakdown[]          // NEW
}

MonthlyTrendPoint {
  month: string          // "YYYY-MM"
  createdCases: long
  resolvedCases: long
  avgResolutionHours: double
}

ProcedureTypeMetric {
  procedureType: string
  totalResolved: long
  avgResolutionHours: double
  medianResolutionHours: double
  slaComplianceRate: double
}

UnitSlaBreakdown {
  unit: string
  totalCases: long
  resolvedWithinSla: long
  totalResolved: long
  slaComplianceRate: double
}
```

## API Endpoints

### GET /admin/analytics/report
- **Auth**: Required (ROLE_TRAMITADOR or ROLE_ADMIN)
- **Query Params**: `from` (ISO date, optional), `to` (ISO date, optional)
- **Response**: `200` with AnalyticsReport

### GET /admin/analytics/export
- **Auth**: Required (ROLE_TRAMITADOR or ROLE_ADMIN)
- **Query Params**: `format` (string, required, currently only "pdf"), `from` (ISO date, optional), `to` (ISO date, optional)
- **Response**: `200` with PDF binary stream
- **Headers**: `Content-Type: application/pdf`, `Content-Disposition: attachment`
