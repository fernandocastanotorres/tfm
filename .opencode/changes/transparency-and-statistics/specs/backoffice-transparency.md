# Spec: Backoffice Transparency Reports Management

## Purpose
Define the requirements for the backoffice section that allows administrators to manage transparency PDF reports (CRUD operations).

## Requirements

### Requirement: List transparency reports in a table
The backoffice SHALL display all transparency reports in a sortable table.

**Scenario: View reports list**
- Given an authenticated backoffice user navigates to `/admin/transparencia/informes`
- When the page loads
- Then it calls `GET /admin/transparency/reports`
- And displays a table with columns: Title, Year, Published, Sort Order, File Size, Created, Actions
- And rows are sorted by sort_order ascending, then year descending

**Scenario: Published status indicator**
- Given a report in the list
- Then it displays a visual badge:
  - Green "Published" badge if published = true
  - Gray "Draft" badge if published = false

### Requirement: Upload a new transparency report
The backoffice SHALL provide a form to upload a new PDF report.

**Scenario: Upload form**
- Given a backoffice user clicks "New Report"
- Then a form/dialog appears with fields:
  - Title (text input, required)
  - Year (number input, required, min 2000, max current year + 1)
  - Description (textarea, optional)
  - PDF File (file input, required, accepts .pdf only)
  - Sort Order (number input, optional, default 0)
  - Published (toggle/checkbox, default false)
- When the user submits the form
- Then a POST multipart request is sent to `/admin/transparency/reports`
- And on success, the table refreshes and a success toast is shown
- And on error, an error message is displayed

**Scenario: File validation**
- Given the file input
- Then it only accepts `.pdf` files
- And displays the selected filename and size before upload
- And rejects files larger than 50MB with an inline error

### Requirement: Edit a transparency report
The backoffice SHALL allow editing report metadata.

**Scenario: Edit form**
- Given a backoffice user clicks "Edit" on a report
- Then an edit form/dialog appears pre-filled with current values
- Fields: Title, Year, Description, Sort Order, Published (no file field)
- When the user submits
- Then a PUT request is sent to `/admin/transparency/reports/{id}`
- And on success, the table refreshes

### Requirement: Replace the PDF file
The backoffice SHALL allow replacing the uploaded PDF without changing other metadata.

**Scenario: Replace file**
- Given a backoffice user clicks "Replace File" on a report
- Then a file picker appears (PDF only)
- When a file is selected and confirmed
- Then a POST request is sent to `/admin/transparency/reports/{id}/file` with multipart data
- And on success, the table updates the file size and a success toast is shown

### Requirement: Toggle published status
The backoffice SHALL allow toggling a report's published status directly from the table.

**Scenario: Toggle publish**
- Given a report in the list
- When a user clicks the published toggle/badge
- Then a PUT request updates only the `published` field
- And the badge updates immediately (optimistic update)
- And on error, the badge reverts

### Requirement: Delete a transparency report
The backoffice SHALL allow deleting reports with confirmation.

**Scenario: Delete with confirmation**
- Given a backoffice user clicks "Delete" on a report
- Then a confirmation dialog appears: "Are you sure you want to delete '{title}'? This action cannot be undone."
- When the user confirms
- Then a DELETE request is sent to `/admin/transparency/reports/{id}`
- And on success, the row is removed from the table
- And a success toast is shown

### Requirement: Preview/download the report
The backoffice SHALL allow previewing or downloading the uploaded PDF.

**Scenario: Download from backoffice**
- Given a report in the list
- When a user clicks "Download"
- Then the browser downloads the file from `/admin/transparency/reports/{id}/download`

## Component Structure

### transparency-reports.component.ts
- Injects `HttpClient` or `TransparencyReportsService`
- Manages: `reports[]`, `isLoading`, `showForm`, `editingReport`, `formErrors`
- Methods: `loadReports()`, `openNewForm()`, `openEditForm(report)`, `saveReport()`, `deleteReport(id)`, `togglePublished(report)`, `replaceFile(id, file)`

### transparency-reports.component.html
- Page header with title and "New Report" button
- Data table with sortable columns and action buttons per row
- Upload/edit form as a modal or slide-over panel
- Confirmation dialog for delete

### transparency-reports.service.ts (back-office)
- `list(): Observable<TransparencyReportDto[]>`
- `create(formData: FormData): Observable<TransparencyReportDto>`
- `update(id: string, data: UpdateReportRequest): Observable<TransparencyReportDto>`
- `replaceFile(id: string, file: File): Observable<TransparencyReportDto>`
- `delete(id: string): Observable<void>`
- `download(id: string): void` — triggers browser download via anchor or window.open

## Routing
- Route: `/admin/transparencia/informes`
- Added to backoffice navigation sidebar under "Transparencia" section
