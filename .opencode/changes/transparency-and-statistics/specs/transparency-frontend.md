# Spec: Transparency Frontend Page

## Purpose
Define the requirements for updating the citizen-facing transparency page to consume real API data instead of mock data.

## Requirements

### Requirement: Display real transparency metrics
The transparency page SHALL display metrics computed from the actual procedures database.

**Scenario: Load metrics on page visit**
- Given a citizen visits `/sede/transparencia`
- When the component initializes
- Then it calls `GET /citizen/public-content/transparency/metrics`
- And displays: total procedures, resolved procedures, pending procedures, average resolution days, SLA compliance rate, digital procedures percentage
- And shows a loading state during the API call
- And shows an error state if the call fails

**Scenario: Metrics display format**
- Given metrics are loaded
- Then each metric card displays: label (i18n), value, unit (if applicable), trend indicator
- And values are formatted with locale-aware number formatting (e.g., 12.458 for Spanish)

### Requirement: Display downloadable transparency reports
The transparency page SHALL list published transparency reports with download links.

**Scenario: Load reports on page visit**
- Given a citizen visits `/sede/transparencia`
- When the component initializes
- Then it calls `GET /citizen/public-content/transparency/reports`
- And displays reports sorted by year descending, then sort_order ascending

**Scenario: Download a report**
- Given reports are loaded
- When a citizen clicks the download button on a report
- Then the browser initiates a download from `/citizen/public-content/transparency/reports/{id}/download`
- And the file is saved with the original filename

**Scenario: No reports available**
- Given the API returns an empty array
- Then the page displays a message: "No hay informes disponibles actualmente" (i18n)

### Requirement: Service migration from mock to real API
The `TransparencyService` SHALL be refactored to use HttpClient instead of mock observables.

**Scenario: Service uses HttpClient**
- Given the existing `TransparencyService`
- When refactored
- Then `getMetrics()` calls `HttpClient.get<TransparencyMetric[]>('/citizen/public-content/transparency/metrics')`
- And `getReports()` calls `HttpClient.get<TransparencyReport[]>('/citizen/public-content/transparency/reports')`
- And the mock data arrays are removed
- And the `delay(300)` operator is removed

### Requirement: Model alignment
The frontend models SHALL align with the backend DTOs.

**Scenario: TransparencyMetric model**
- The model SHALL have: id, label, value, unit, trend (matching backend response)
- The `labelKey` and `descriptionKey` pattern SHALL be replaced with direct `label` strings from the API
- OR the service SHALL map backend fields to i18n keys if labels are server-side constants

**Scenario: TransparencyReport model**
- The model SHALL have: id, title, year, description, fileName, fileSize, createdAt
- The `titleKey` and `descriptionKey` pattern SHALL be replaced with direct strings
- The `downloadUrl` SHALL be computed as `/citizen/public-content/transparency/reports/{id}/download`

### Requirement: Loading and error states
The transparency page SHALL handle loading and error states gracefully.

**Scenario: Loading state**
- Given the API calls are in progress
- Then the page displays a spinner or loading skeleton
- And the `isLoading` flag is true

**Scenario: Error state**
- Given the API call fails (network error, 500, etc.)
- Then the page displays a user-friendly error message
- And provides a "retry" button that re-triggers the API call

## Component Structure

### transparency.component.ts
- Uses `TransparencyService` (refactored)
- Manages `metrics`, `reports`, `isLoading`, `hasError` state
- Computes `downloadUrl` for each report

### transparency.service.ts
- Injects `HttpClient`
- `getMetrics(): Observable<TransparencyMetric[]>` — calls public API
- `getReports(): Observable<TransparencyReport[]>` — calls public API
- No mock data, no `of().pipe(delay())`
