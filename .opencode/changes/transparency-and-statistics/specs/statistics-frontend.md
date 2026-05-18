# Spec: Statistics Dashboard Frontend

## Purpose
Define the requirements for the new statistics dashboard page with visual charts, date range filtering, and PDF export.

## Requirements

### Requirement: Visual statistics dashboard with charts
The statistics page SHALL display multiple chart types powered by Chart.js via ng2-charts.

**Scenario: Dashboard loads with default date range**
- Given a backoffice user navigates to `/admin/transparencia/estadisticas`
- When the component initializes
- Then it calls `GET /admin/analytics/report` (last 30 days by default)
- And renders all charts with the returned data

**Scenario: Summary cards**
- Given analytics data is loaded
- Then the page displays summary cards at the top:
  - Total procedures (number)
  - Pending (number, with color coding: orange)
  - In progress (number, blue)
  - Resolved (number, green)
  - Overdue (number, red)
  - SLA compliance rate (percentage)
  - Average resolution time (hours)

### Requirement: Daily trend line chart
The dashboard SHALL display a line chart showing created vs resolved procedures over time.

**Scenario: Line chart rendering**
- Given dailyTrend data from the API
- Then a line chart displays two datasets:
  - "Created" (blue line)
  - "Resolved" (green line)
- X-axis: dates (formatted as DD/MM)
- Y-axis: count of procedures
- Chart is responsive and fills available width

### Requirement: Procedure type bar chart
The dashboard SHALL display a horizontal bar chart showing procedure distribution by type.

**Scenario: Bar chart rendering**
- Given byProcedureType data from the API
- Then a horizontal bar chart displays each procedure type as a bar
- Bars are sorted by count descending
- Each bar shows the count label
- Maximum 10 bars displayed (top 10)

### Requirement: Status distribution doughnut chart
The dashboard SHALL display a doughnut chart showing case status distribution.

**Scenario: Doughnut chart rendering**
- Given byStatus data from the API
- Then a doughnut chart displays each status as a segment
- Each segment has a distinct color:
  - SUBMITTED: orange
  - IN_REVIEW: blue
  - APPROVED: green
  - REJECTED: red
  - AMENDMENT_REQUIRED: yellow
  - RESUBMITTED: purple
- Legend is displayed beside the chart

### Requirement: Unit distribution bar chart
The dashboard SHALL display a bar chart showing procedure distribution by assigned unit.

**Scenario: Unit bar chart rendering**
- Given byAssignedUnit data from the API
- Then a vertical bar chart displays each unit
- Maximum 8 bars displayed (top 8)
- Bars are sorted by count descending

### Requirement: Date range filter
The dashboard SHALL allow users to select a custom date range.

**Scenario: Apply custom date range**
- Given a user selects from/to dates using a date picker
- When they click "Apply" or the date range changes
- Then the dashboard re-fetches data with `?from=...&to=...`
- And all charts update with the new data
- And summary cards update

**Scenario: Quick range presets**
- Given the date range filter
- Then it provides quick presets:
  - Last 7 days
  - Last 30 days (default)
  - Last 90 days
  - Current year
  - Custom range

### Requirement: PDF export
The dashboard SHALL provide a button to download the statistics as a PDF report.

**Scenario: Export current view as PDF**
- Given analytics data is loaded with a specific date range
- When the user clicks "Export PDF"
- Then the browser downloads the PDF from `GET /admin/analytics/export?format=pdf&from=...&to=...`
- And the filename reflects the date range

### Requirement: Loading and error states
The statistics page SHALL handle loading and error states.

**Scenario: Loading state**
- Given the API call is in progress
- Then chart areas display loading spinners
- And summary cards show placeholder dashes (—)

**Scenario: Error state**
- Given the API call fails
- Then the page displays an error message with a retry button

## Component Structure

### statistics.component.ts
- Injects `HttpClient` or a dedicated `AnalyticsService`
- Manages: `report`, `dateFrom`, `dateTo`, `isLoading`, `hasError`
- Chart data properties for each chart type
- Methods: `loadReport()`, `applyDateRange()`, `exportPdf()`, `setQuickRange()`

### statistics.component.html
- Summary cards row (7 cards)
- Date range filter bar with presets + custom picker + apply button + export button
- Chart grid:
  - Row 1: Daily trend line chart (full width)
  - Row 2: Procedure type bar chart (left 50%) + Status doughnut chart (right 50%)
  - Row 3: Unit distribution bar chart (full width)

### statistics.component.css
- Tailwind CSS utility classes for layout
- Chart containers with fixed minimum heights for responsiveness

## Dependencies
- `chart.js` ^4.x — installed in `front-end/package.json` (or back-office if separate)
- `ng2-charts` ^5.x — Angular wrapper for Chart.js
- Chart.js registration: all controllers, elements, scales, plugins must be registered
