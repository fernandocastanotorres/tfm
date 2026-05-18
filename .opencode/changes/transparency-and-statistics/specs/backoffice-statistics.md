# Spec: Backoffice Statistics Dashboard

## Purpose
Define the requirements for the backoffice statistics dashboard page with visual charts, date range filtering, and PDF export capability.

## Requirements

### Requirement: Dashboard page with visual charts
The backoffice SHALL provide a dedicated statistics page with interactive charts.

**Scenario: Navigate to statistics dashboard**
- Given an authenticated backoffice user
- When they navigate to `/admin/transparencia/estadisticas`
- Then the page loads with a date range filter, summary cards, and chart grid

**Scenario: Default date range**
- Given the page loads for the first time
- Then the date range defaults to the last 30 days
- And the "Last 30 days" quick preset is highlighted

### Requirement: Summary cards row
The dashboard SHALL display key metrics as summary cards at the top.

**Scenario: Render summary cards**
- Given analytics data is loaded
- Then 7 summary cards are displayed:
  1. Total Procedures — plain number
  2. Pending — orange text/border
  3. In Progress — blue text/border
  4. Resolved — green text/border
  5. Overdue — red text/border
  6. SLA Compliance — percentage with color (green if >80%, orange if 50-80%, red if <50%)
  7. Avg Resolution — hours with 1 decimal place

### Requirement: Daily trend chart
The dashboard SHALL display a line chart of daily procedure creation and resolution.

**Scenario: Render trend chart**
- Given dailyTrend data exists
- Then a line chart is rendered with:
  - Two datasets: "Created" (blue, solid line) and "Resolved" (green, solid line)
  - X-axis labels formatted as DD/MM
  - Y-axis starting at 0
  - Tooltip showing both values on hover
  - Legend above the chart
- Given no data for the range
- Then the chart displays "No data available for this period"

### Requirement: Procedure type distribution chart
The dashboard SHALL display a horizontal bar chart of procedures by type.

**Scenario: Render type chart**
- Given byProcedureType data exists
- Then a horizontal bar chart is rendered with:
  - One bar per procedure type
  - Bars colored with distinct shades
  - Count label at the end of each bar
  - Maximum 10 types shown
- Given fewer than 3 types
- Then all types are shown

### Requirement: Status distribution chart
The dashboard SHALL display a doughnut chart of case status distribution.

**Scenario: Render status chart**
- Given byStatus data exists
- Then a doughnut chart is rendered with:
  - One segment per status
  - Color coding matching the summary cards
  - Legend on the right side
  - Percentage labels on segments (if large enough)

### Requirement: Unit distribution chart
The dashboard SHALL display a vertical bar chart of procedures by assigned unit.

**Scenario: Render unit chart**
- Given byAssignedUnit data exists
- Then a vertical bar chart is rendered with:
  - One bar per unit
  - Bars sorted by count descending
  - Maximum 8 units shown
  - X-axis labels rotated 45 degrees if needed

### Requirement: Date range filtering
The dashboard SHALL provide date range controls.

**Scenario: Quick range presets**
- Given the date range control bar
- Then it displays buttons for:
  - "Last 7 days"
  - "Last 30 days" (default, highlighted)
  - "Last 90 days"
  - "Current year"
  - "Custom"
- When a preset is clicked
- Then the date range updates and data reloads

**Scenario: Custom date range**
- Given the user clicks "Custom"
- Then two date pickers appear (From, To)
- When both dates are set and "Apply" is clicked
- Then data reloads with the custom range
- If From > To, the dates are automatically swapped

### Requirement: PDF export
The dashboard SHALL provide a PDF export button.

**Scenario: Export to PDF**
- Given analytics data is loaded
- When the user clicks "Export PDF"
- Then a GET request is made to `/admin/analytics/export?format=pdf&from=...&to=...`
- And the browser downloads the PDF file
- And a loading spinner is shown during the request

### Requirement: Responsive layout
The dashboard SHALL adapt to different screen sizes.

**Scenario: Desktop layout**
- Given a screen width >= 1024px
- Then charts display in a 2-column grid (trend full-width, type + status side-by-side, unit full-width)

**Scenario: Tablet layout**
- Given a screen width between 768px and 1023px
- Then charts display in a single column stack

**Scenario: Mobile layout**
- Given a screen width < 768px
- Then summary cards scroll horizontally
- And charts stack vertically with reduced heights

## Component Structure

### statistics-dashboard.component.ts
- Located at `back-office/src/app/adapters/components/statistics-dashboard/`
- Injects `HttpClient` or `AnalyticsService`
- Manages chart data objects compatible with ng2-charts
- Methods: `loadReport()`, `applyPreset(preset)`, `applyCustomRange()`, `exportPdf()`

### statistics-dashboard.component.html
- Header: "Estadísticas" + Export PDF button
- Date range bar: preset buttons + custom date pickers + Apply button
- Summary cards row (7 cards, horizontal scroll on mobile)
- Chart grid:
  - Trend line chart (full width, min-height 300px)
  - Type bar chart (col-span-1, min-height 280px)
  - Status doughnut chart (col-span-1, min-height 280px)
  - Unit bar chart (full width, min-height 280px)

### analytics.service.ts (back-office)
- `getReport(from?: string, to?: string): Observable<AnalyticsReport>`
- `exportPdf(from?: string, to?: string): Observable<Blob>` — returns blob for download

## Routing
- Route: `/admin/transparencia/estadisticas`
- Added to backoffice navigation sidebar under "Transparencia" section, alongside "Informes"

## Dependencies
- `chart.js` — must be registered in the back-office Angular module or standalone bootstrap
- `ng2-charts` — provides `BaseChartDirective` for Angular integration
- Chart.js plugins: tooltip, legend, title (all registered globally or per-component)
