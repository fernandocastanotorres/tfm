# Spec: Transparency Reports API

## Purpose
Define the API contract for managing transparency PDF reports from the backoffice and serving them publicly.

## Requirements

### Requirement: Backoffice can create transparency reports with file upload
The system SHALL allow authenticated backoffice users to upload a PDF report with metadata (title, year, description, sort_order, published flag).

**Scenario: Upload a new transparency report**
- Given an authenticated backoffice user
- When they POST a multipart request to `/admin/transparency/reports` with a PDF file and form fields
- Then the system stores the file in `{baseDir}/transparency/` with a UUID-based filename
- And creates a database record in `transparency_reports`
- And returns `201 Created` with the created report's JSON representation

**Scenario: Reject non-PDF file upload**
- Given an authenticated backoffice user
- When they POST a multipart request with a non-PDF file (e.g., .docx, .png)
- Then the system returns `400 Bad Request` with error code `INVALID_FILE_TYPE`

**Scenario: Reject oversized file**
- Given an authenticated backoffice user
- When they POST a multipart request with a file larger than 50MB
- Then the system returns `400 Bad Request` with error code `FILE_TOO_LARGE`

### Requirement: Backoffice can list all transparency reports
The system SHALL return all transparency reports (published and unpublished) sorted by `sort_order` ascending, then `year` descending.

**Scenario: List all reports**
- Given an authenticated backoffice user
- When they GET `/admin/transparency/reports`
- Then the system returns `200 OK` with an array of all reports including unpublished ones

### Requirement: Backoffice can update a transparency report
The system SHALL allow updating metadata (title, year, description, sort_order, published) without re-uploading the file.

**Scenario: Update report metadata**
- Given an authenticated backoffice user and an existing report
- When they PUT `/admin/transparency/reports/{id}` with JSON body
- Then the system updates the record and returns `200 OK` with the updated report

**Scenario: Update report with new file**
- Given an authenticated backoffice user and an existing report
- When they POST `/admin/transparency/reports/{id}/file` with a new PDF
- Then the system replaces the stored file, updates file_size and file_name
- And deletes the old file from storage
- And returns `200 OK`

### Requirement: Backoffice can delete a transparency report
The system SHALL delete both the database record and the stored file.

**Scenario: Delete a report**
- Given an authenticated backoffice user and an existing report
- When they DELETE `/admin/transparency/reports/{id}`
- Then the system removes the file from `{baseDir}/transparency/`
- And deletes the database record
- And returns `204 No Content`

**Scenario: Delete non-existent report**
- Given an authenticated backoffice user
- When they DELETE `/admin/transparency/reports/{non-existent-uuid}`
- Then the system returns `404 Not Found` with error code `REPORT_NOT_FOUND`

### Requirement: Public access to published transparency reports
The system SHALL serve only published transparency reports to unauthenticated users.

**Scenario: List published reports**
- Given any user (authenticated or not)
- When they GET `/citizen/public-content/transparency/reports`
- Then the system returns `200 OK` with only reports where `published = true`
- And the response includes: id, title, year, description, file_name, file_size, created_at

**Scenario: Download a published report**
- Given any user
- When they GET `/citizen/public-content/transparency/reports/{id}/download`
- And the report is published
- Then the system streams the PDF file with `Content-Type: application/pdf`
- And sets `Content-Disposition: attachment; filename="{original_filename}"`

**Scenario: Reject download of unpublished report**
- Given any unauthenticated user
- When they GET `/citizen/public-content/transparency/reports/{id}/download`
- And the report is not published
- Then the system returns `404 Not Found` (does not reveal existence of unpublished reports)

### Requirement: Path traversal protection
The system SHALL prevent path traversal attacks on all file operations for transparency reports.

**Scenario: Reject path traversal in filename**
- Given a malicious actor
- When they attempt to upload a file with filename `../../../etc/passwd`
- Then the system normalizes the path and rejects the request
- And returns `400 Bad Request` with error code `INVALID_FILENAME`

## Data Model

### transparency_reports table
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | VARCHAR(255) | NOT NULL |
| year | INTEGER | NOT NULL |
| description | TEXT | NULL |
| file_path | VARCHAR(500) | NOT NULL, relative to baseDir |
| file_name | VARCHAR(255) | NOT NULL, original filename |
| file_size | BIGINT | NOT NULL, bytes |
| mime_type | VARCHAR(100) | NOT NULL, DEFAULT 'application/pdf' |
| published | BOOLEAN | NOT NULL, DEFAULT false |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## API Endpoints

### POST /admin/transparency/reports
- **Auth**: Required (ROLE_TRAMITADOR or ROLE_ADMIN)
- **Content-Type**: `multipart/form-data`
- **Fields**: `file` (PDF), `title` (string), `year` (integer), `description` (string, optional), `sortOrder` (integer, optional), `published` (boolean, optional)
- **Response**: `201` with TransparencyReportDto

### GET /admin/transparency/reports
- **Auth**: Required
- **Response**: `200` with `TransparencyReportDto[]`

### PUT /admin/transparency/reports/{id}
- **Auth**: Required
- **Body**: JSON with title, year, description, sortOrder, published
- **Response**: `200` with updated TransparencyReportDto

### POST /admin/transparency/reports/{id}/file
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Fields**: `file` (PDF)
- **Response**: `200` with updated TransparencyReportDto

### DELETE /admin/transparency/reports/{id}
- **Auth**: Required
- **Response**: `204 No Content`

### GET /citizen/public-content/transparency/reports
- **Auth**: Not required
- **Response**: `200` with `PublicTransparencyReportDto[]` (excludes file_path, includes file_size)

### GET /citizen/public-content/transparency/reports/{id}/download
- **Auth**: Not required (only for published reports)
- **Response**: `200` with PDF stream, or `404` if unpublished/not found
