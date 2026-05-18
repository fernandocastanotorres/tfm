# Design: Transparency Data, Report Management & Statistics Dashboard

## Technical Approach

Connect the transparency page (`/sede/transparencia`) to real data by adding a `transparency_reports` table, a CRUD service with file upload, public read endpoints, an enhanced analytics endpoint extending `BackofficeService.dashboardReport()`, and Angular components with Chart.js visualizations. The design follows the existing hexagonal architecture (domain/application/infrastructure/entrypoints) and Angular adapter/application/infrastructure layers.

References: proposal.md, specs/transparency-api.md, specs/statistics-api.md, specs/transparency-frontend.md, specs/statistics-frontend.md, specs/backoffice-transparency.md, specs/backoffice-statistics.md.

---

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| DTO location | New `TransparencyDtos.java` file | Add to `PublicContentDtos.java` or `BackofficeDtos.java` | Keeps transparency domain isolated; follows SRP; existing DTO files are already large |
| Controller placement | New `TransparencyController` for admin + extend `PublicContentController` for public | All in `BackofficeController` | Public endpoints belong with other public content; admin CRUD is a separate concern |
| File storage | Extend `FileStorageService` with `store(subdir, file)` overload | New dedicated service | Reuses existing UUID naming, path traversal protection, and extension extraction |
| Analytics extension | New `analyticsReport()` method in `BackofficeService` | Separate `AnalyticsService` class | Reuses existing `dashboardReport()` logic, avoids duplication of date-range resolution and filtering |
| Chart library | `chart.js` 4.x + `ng2-charts` 4.x | D3.js, ApexCharts | ng2-charts 4.x is the Angular 16-compatible version; Chart.js 4 supports tree-shaking |
| PDF export | Server-side HTML-to-PDF via OpenPDF | Client-side html2canvas + jsPDF | Server-side keeps PDF generation deterministic; OpenPDF is lightweight and already JVM-native |
| Frontend service pattern | Dedicated `TransparencyReportsService` (back-office) + refactor `TransparencyService` (front-end) | Single shared service | Back-office needs auth interceptor + multipart; front-end needs public endpoints; different concerns |

---

## 1. Database Schema

### Flyway Migration: `V2__create_transparency_reports.sql`

```sql
CREATE TABLE transparency_reports (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    year        INTEGER      NOT NULL CHECK (year >= 2000),
    description TEXT,
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_size   BIGINT       NOT NULL CHECK (file_size > 0),
    mime_type   VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    published   BOOLEAN      NOT NULL DEFAULT false,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transparency_reports_published_sort
    ON transparency_reports (published, sort_order ASC, year DESC)
    WHERE published = true;

CREATE INDEX idx_transparency_reports_year
    ON transparency_reports (year DESC);
```

### Entity: `TransparencyReportEntity`

```
File: backend/src/main/java/es/tfg/records/infrastructure/persistence/entity/TransparencyReportEntity.java
```

- JPA entity with `@Entity`, `@Table(name = "transparency_reports")`
- Uses `Instant` for `createdAt`/`updatedAt` (mapped via `@Column` with `TIMESTAMP`)
- Standard getters/setters following existing entity pattern (see `PublicContentEntryEntity`)
- `@PrePersist` and `@PreUpdate` hooks for timestamp management

### Repository: `TransparencyReportJpaRepository`

```
File: backend/src/main/java/es/tfg/records/infrastructure/persistence/repository/TransparencyReportJpaRepository.java
```

```java
public interface TransparencyReportJpaRepository extends JpaRepository<TransparencyReportEntity, UUID> {
    List<TransparencyReportEntity> findByPublishedTrueOrderBySortOrderAscYearDesc();
    List<TransparencyReportEntity> findAllByOrderBySortOrderAscYearDesc();
}
```

---

## 2. API Design

### 2.1 Transparency Reports (Admin)

**Controller**: `TransparencyController` at `@RequestMapping("/admin/transparency/reports")`

| Method | Path | Auth | Request | Response | Status |
|--------|------|------|---------|----------|--------|
| POST | `/admin/transparency/reports` | ROLE_TRAMITADOR, ROLE_ADMIN | `multipart/form-data`: file (PDF), title, year, description?, sortOrder?, published? | `TransparencyReportDto` | 201 |
| GET | `/admin/transparency/reports` | ROLE_TRAMITADOR, ROLE_ADMIN | — | `TransparencyReportDto[]` | 200 |
| PUT | `/admin/transparency/reports/{id}` | ROLE_TRAMITADOR, ROLE_ADMIN | JSON: `UpdateReportRequest` | `TransparencyReportDto` | 200 |
| POST | `/admin/transparency/reports/{id}/file` | ROLE_TRAMITADOR, ROLE_ADMIN | `multipart/form-data`: file (PDF) | `TransparencyReportDto` | 200 |
| DELETE | `/admin/transparency/reports/{id}` | ROLE_TRAMITADOR, ROLE_ADMIN | — | — | 204 |
| GET | `/admin/transparency/reports/{id}/download` | ROLE_TRAMITADOR, ROLE_ADMIN | — | PDF stream | 200 |

### 2.2 Transparency Reports (Public)

**Controller**: Extend `PublicContentController` at `@RequestMapping("/citizen/public-content/transparency")`

| Method | Path | Auth | Response | Status |
|--------|------|------|----------|--------|
| GET | `/citizen/public-content/transparency/reports` | None | `PublicTransparencyReportDto[]` | 200 |
| GET | `/citizen/public-content/transparency/reports/{id}/download` | None (published only) | PDF stream | 200/404 |
| GET | `/citizen/public-content/transparency/metrics` | None | `TransparencyMetricsDto` | 200 |

### 2.3 Analytics

**Controller**: Extend `BackofficeController`

| Method | Path | Auth | Query Params | Response | Status |
|--------|------|------|-------------|----------|--------|
| GET | `/admin/analytics/report` | ROLE_TRAMITADOR, ROLE_ADMIN | `from?`, `to?` (ISO date) | `AnalyticsReport` | 200 |
| GET | `/admin/analytics/export` | ROLE_TRAMITADOR, ROLE_ADMIN | `format=pdf`, `from?`, `to?` | PDF binary | 200 |

### 2.4 DTO Definitions

**`TransparencyDtos.java`** — new file:

```java
public final class TransparencyDtos {
    private TransparencyDtos() {}

    // Admin-facing DTO (includes file_path)
    public record TransparencyReportDto(
        UUID id, String title, int year, String description,
        String filePath, String fileName, long fileSize,
        String mimeType, boolean published, int sortOrder,
        Instant createdAt, Instant updatedAt
    ) {}

    // Public-facing DTO (excludes file_path)
    public record PublicTransparencyReportDto(
        UUID id, String title, int year, String description,
        String fileName, long fileSize, Instant createdAt
    ) {}

    // Multipart create request — handled via @RequestPart
    // Metadata update request
    public record UpdateReportRequest(
        String title, int year, String description,
        Integer sortOrder, Boolean published
    ) {}

    // Public metrics
    public record TransparencyMetricsDto(
        long totalProcedures, long resolvedProcedures,
        long pendingProcedures, double avgResolutionDays,
        double slaComplianceRate, double digitalProceduresPct
    ) {}

    // Analytics report (extends existing DashboardReport)
    public record AnalyticsReport(
        BackofficeDtos.DashboardReportSummary summary,
        List<BackofficeDtos.DashboardDistributionItem> byStatus,
        List<BackofficeDtos.DashboardDistributionItem> byProcedureType,
        List<BackofficeDtos.DashboardDistributionItem> byAssignedUnit,
        List<BackofficeDtos.DashboardDailyTrendPoint> dailyTrend,
        List<MonthlyTrendPoint> monthlyTrend,
        List<ProcedureTypeMetric> procedureTypeMetrics,
        List<UnitSlaBreakdown> unitSlaBreakdown
    ) {}

    public record MonthlyTrendPoint(
        String month,          // "YYYY-MM"
        long createdCases,
        long resolvedCases,
        double avgResolutionHours
    ) {}

    public record ProcedureTypeMetric(
        String procedureType,
        long totalResolved,
        double avgResolutionHours,
        double medianResolutionHours,
        double slaComplianceRate
    ) {}

    public record UnitSlaBreakdown(
        String unit,
        long totalCases,
        long resolvedWithinSla,
        long totalResolved,
        double slaComplianceRate
    ) {}
}
```

---

## 3. File Storage

### Storage Layout

```
{baseDir}/                    # e.g. ./data/documents
└── transparency/             # Dedicated subdirectory
    ├── {uuid-1}.pdf          # Stored with UUID filename
    ├── {uuid-2}.pdf
    └── ...
```

### FileStorageService Extension

Add overloaded methods to `FileStorageService`:

```java
// Store in a named subdirectory (e.g. "transparency")
public String store(String subDirectory, MultipartFile file)

// Open stream by relative path (for download)
public InputStream openStream(String relativePath)

// Delete by relative path
public void delete(String relativePath)

// Exists check by relative path
public boolean exists(String relativePath)
```

All methods enforce path traversal protection via `normalize()` + `startsWith(baseDirectory)` check, matching existing pattern.

### File Validation Rules

| Rule | Value | Error Code |
|------|-------|------------|
| Allowed MIME types | `application/pdf` only | `INVALID_FILE_TYPE` |
| Max file size | 50 MB | `FILE_TOO_LARGE` |
| Filename sanitization | Strip `..`, `/`, `\` | `INVALID_FILENAME` |
| File must not be empty | `file.getSize() > 0` | `EMPTY_FILE` |

Multipart size limit must be raised in `application.yml`:
```yaml
spring.servlet.multipart:
  max-file-size: 50MB
  max-request-size: 55MB
```

---

## 4. Security

### Path Traversal Protection

All file operations use the existing `resolveFilePath` pattern:
```java
Path targetPath = baseDirectory.resolve(subDirectory).resolve(filename).normalize();
if (!targetPath.startsWith(baseDirectory)) {
    throw new ConflictException("STORAGE", "Invalid file path: path traversal detected");
}
```

### Access Control

- **Admin endpoints** (`/admin/transparency/reports/**`): Already covered by `BACKOFFICE_ENDPOINTS` in `SecurityConfig` — requires `ROLE_TRAMITADOR` or `ROLE_ADMIN`
- **Public endpoints** (`/citizen/public-content/transparency/**`): Already covered by the existing `permitAll()` rule for `/citizen/public-content/**`
- **Download of unpublished reports**: Returns 404 (not 403) to avoid revealing existence

### Spring Security Update

Add public transparency download to explicit permit list (defense in depth):
```java
.requestMatchers(HttpMethod.GET, "/citizen/public-content/transparency/**").permitAll()
```

---

## 5. Charting Integration

### Dependencies (Angular 16 compatible)

Both `front-end/` and `back-office/` need:
```json
"chart.js": "^4.4.0",
"ng2-charts": "^4.1.1"
```

### Chart.js Registration

In each app's `app.module.ts`, register Chart.js components:
```typescript
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
```

### Chart Specifications

| Chart | Type | Data Source | Datasets | Colors |
|-------|------|------------|----------|--------|
| Daily Trend | Line | `dailyTrend` | Created (blue #3B82F6), Resolved (green #10B981) | Solid lines, filled=false |
| Procedure Types | Horizontal Bar | `byProcedureType` (top 10) | Single dataset | Distinct Tailwind palette |
| Status Distribution | Doughnut | `byStatus` | Single dataset | SUBMIT:orange, REVIEW:blue, APPROVED:green, REJECTED:red, AMEND:yellow, RESUB:purple |
| Unit Distribution | Vertical Bar | `byAssignedUnit` (top 8) | Single dataset | Blue shades |

### ng2-charts Configuration Pattern

Each chart uses `BaseChartDirective` with:
- `[data]`: ChartData object (labels + datasets)
- `[options]`: ChartOptions (responsive, plugins, scales)
- `[type]`: Chart type constant
- `[legend]="true"` for doughnut and bar charts

---

## 6. Component Hierarchy

### Frontend (Citizen)

```
front-end/src/app/
├── application/
│   ├── models/
│   │   └── sede.models.ts          # Modify: TransparencyMetric, TransparencyReport interfaces
│   └── services/
│       └── transparency.service.ts  # Modify: Replace mock with HttpClient
└── adapters/components/
    └── transparency/
        ├── transparency.component.ts   # Modify: Add error state, retry
        ├── transparency.component.html # Modify: Loading skeleton, error UI
        └── transparency.component.css  # Modify: Skeleton animation
```

### Backoffice (Admin)

```
back-office/src/app/
├── application/
│   ├── models/
│   │   └── backoffice.models.ts      # Add: TransparencyReportDto, AnalyticsReport, etc.
│   └── services/
│       ├── transparency-reports.service.ts  # New: CRUD + multipart
│       └── analytics.service.ts             # New: getReport(), exportPdf()
└── adapters/components/
    ├── transparency-reports/         # New: CRUD management
    │   ├── transparency-reports.component.ts
    │   ├── transparency-reports.component.html
    │   └── transparency-reports.component.css
    └── statistics-dashboard/         # New: Visual charts
        ├── statistics-dashboard.component.ts
        ├── statistics-dashboard.component.html
        └── statistics-dashboard.component.css
```

### Backend

```
backend/src/main/java/es/tfg/records/
├── application/
│   ├── dto/
│   │   └── TransparencyDtos.java              # New: All transparency + analytics DTOs
│   └── service/
│       ├── TransparencyReportService.java      # New: CRUD + file ops
│       └── TransparencyMetricsService.java     # New: Live metrics from procedures
├── entrypoints/
│   ├── controller/
│   │   └── TransparencyController.java         # New: Admin CRUD endpoints
│   └── advice/
│       └── GlobalExceptionHandler.java         # Modify: Add multipart max-size handler
└── infrastructure/
    ├── persistence/
    │   ├── entity/
    │   │   └── TransparencyReportEntity.java   # New: JPA entity
    │   └── repository/
    │       └── TransparencyReportJpaRepository.java  # New
    └── storage/
        └── FileStorageService.java             # Modify: Add subdir overloads
```

---

## 7. Data Flow Diagrams

### 7.1 Upload Transparency Report (Admin)

```
Backoffice UI ──→ TransparencyReportsService ──→ POST /admin/transparency/reports (multipart)
                      │                                    │
                      │                              TransparencyController
                      │                                    │
                      │                        TransparencyReportService
                      │                          ├─ Validate file (MIME, size)
                      │                          ├─ FileStorageService.store("transparency", file)
                      │                          ├─ Create entity + save to DB
                      │                          └─ Return DTO
                      │                                    │
                      ←────────────────────────────────────┘
                  201 + TransparencyReportDto
```

### 7.2 Public Transparency Page Load

```
Citizen Browser ──→ TransparencyComponent.ngOnInit()
                         │
                         ├──→ GET /citizen/public-content/transparency/metrics
                         │         └─ TransparencyMetricsService
                         │              └─ Query procedures table (live computation)
                         │
                         └──→ GET /citizen/public-content/transparency/reports
                                   └─ TransparencyReportService.findByPublishedTrue()
                                        └─ Return PublicTransparencyReportDto[]
```

### 7.3 Statistics Dashboard Load

```
Backoffice UI ──→ StatisticsDashboardComponent.loadReport()
                       │
                       └──→ GET /admin/analytics/report?from=&to=
                                 └─ BackofficeService.analyticsReport()
                                      ├─ Reuse dashboardReport() logic (summary, distributions, dailyTrend)
                                      ├─ Compute monthlyTrend (group by YYYY-MM)
                                      ├─ Compute procedureTypeMetrics (avg/median resolution, SLA)
                                      └─ Compute unitSlaBreakdown (SLA per unit)
                                 └─ Return AnalyticsReport
```

---

## 8. Error Handling

All errors follow the existing `ErrorResponse` canonical format:

```json
{
  "timestamp": "2026-05-17T10:30:00Z",
  "status": 400,
  "code": "TRANSPARENCY-400-INVALID_FILE_TYPE",
  "message": "Only PDF files are accepted",
  "path": "/api/v1/admin/transparency/reports",
  "correlationId": "abc-123",
  "details": []
}
```

### Error Code Registry

| Code | HTTP | Scenario |
|------|------|----------|
| `TRANSPARENCY-400-INVALID_FILE_TYPE` | 400 | Non-PDF upload |
| `TRANSPARENCY-400-FILE_TOO_LARGE` | 400 | File > 50MB |
| `TRANSPARENCY-400-INVALID_FILENAME` | 400 | Path traversal attempt |
| `TRANSPARENCY-400-EMPTY_FILE` | 400 | Zero-byte upload |
| `TRANSPARENCY-404-REPORT_NOT_FOUND` | 404 | Report ID does not exist |
| `TRANSPARENCY-500-STORAGE_ERROR` | 500 | File system write failure |

### GlobalExceptionHandler Addition

Add handler for `MaxUploadSizeExceededException`:
```java
@ExceptionHandler(MaxUploadSizeExceededException.class)
public ResponseEntity<ErrorResponse> handleMaxUploadSize(HttpServletRequest request) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
        buildErrorResponse(400, "TRANSPARENCY-400-FILE_TOO_LARGE",
            "File exceeds maximum size of 50MB", request.getRequestURI(), null));
}
```

---

## 9. Migration Strategy

### Phase 1: Backend Foundation
1. Create Flyway migration `V2__create_transparency_reports.sql`
2. Create `TransparencyReportEntity` + `TransparencyReportJpaRepository`
3. Create `TransparencyDtos.java` with all DTO records
4. Extend `FileStorageService` with subdirectory support
5. Create `TransparencyReportService` with CRUD + file operations
6. Create `TransparencyMetricsService` for live metrics
7. Create `TransparencyController` (admin CRUD)
8. Extend `PublicContentController` (public read)
9. Extend `BackofficeService` with `analyticsReport()`
10. Extend `BackofficeController` with analytics endpoints
11. Raise multipart limits in `application.yml`

### Phase 2: Frontend (Citizen)
1. Update `sede.models.ts` — align `TransparencyMetric` and `TransparencyReport` with backend DTOs
2. Refactor `transparency.service.ts` — replace `of().pipe(delay())` with `HttpClient` calls
3. Update `transparency.component.ts` — add loading/error states, retry logic
4. Update `transparency.component.html` — add loading skeleton, error message with retry button

### Phase 3: Backoffice
1. Install `chart.js` + `ng2-charts` in both `front-end/` and `back-office/`
2. Add models to `backoffice.models.ts`
3. Create `transparency-reports.service.ts` (back-office)
4. Create `analytics.service.ts` (back-office)
5. Create `transparency-reports` component (CRUD table + upload form)
6. Create `statistics-dashboard` component (charts + date range + PDF export)
7. Add routes to `app-routing.module.ts`:
   - `/admin/transparencia/informes`
   - `/admin/transparencia/estadisticas`
8. Add nav items to `backoffice-layout.component.ts`

### Phase 4: Verification
1. Test all endpoints with Swagger UI
2. Verify public endpoints work without auth
3. Verify file upload validation (wrong type, oversized, path traversal)
4. Verify charts render with real data
5. Verify PDF export downloads correctly

### Rollback
- Drop `transparency_reports` table (revert Flyway)
- Remove new controllers, services, DTOs, entities, repositories
- Revert `transparency.service.ts` to mock version
- Remove chart.js dependencies
- Delete uploaded files from `{baseDir}/transparency/`

---

## 10. Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `TransparencyReportService` CRUD logic | Mock repository + FileStorageService |
| Unit | `TransparencyMetricsService` computation | Mock procedure data, verify calculations |
| Unit | `BackofficeService.analyticsReport()` extensions | Verify monthlyTrend, procedureTypeMetrics, unitSlaBreakdown |
| Unit | File validation logic | Test MIME check, size check, path traversal |
| Integration | `TransparencyController` endpoints | `@WebMvcTest` with MockMvc, multipart requests |
| Integration | Public endpoints (no auth) | Verify permitAll works, unpublished reports return 404 |
| Integration | File storage round-trip | Upload → DB record → download → delete |
| E2E | Frontend transparency page loads real data | Cypress/Playwright against running app |
| E2E | Backoffice upload + table refresh | Full CRUD flow |

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `backend/.../V2__create_transparency_reports.sql` | Create | Flyway migration for table + indexes |
| `backend/.../TransparencyReportEntity.java` | Create | JPA entity |
| `backend/.../TransparencyReportJpaRepository.java` | Create | Spring Data repository |
| `backend/.../TransparencyDtos.java` | Create | All transparency + analytics DTO records |
| `backend/.../TransparencyReportService.java` | Create | CRUD + file operations service |
| `backend/.../TransparencyMetricsService.java` | Create | Live metrics computation service |
| `backend/.../TransparencyController.java` | Create | Admin CRUD REST controller |
| `backend/.../PublicContentController.java` | Modify | Add public transparency endpoints |
| `backend/.../BackofficeService.java` | Modify | Add `analyticsReport()` method |
| `backend/.../BackofficeController.java` | Modify | Add analytics export endpoint |
| `backend/.../FileStorageService.java` | Modify | Add subdirectory overloads |
| `backend/.../SecurityConfig.java` | Modify | Add explicit public transparency rule |
| `backend/.../GlobalExceptionHandler.java` | Modify | Add MaxUploadSizeExceededException handler |
| `backend/src/main/resources/application.yml` | Modify | Raise multipart limits to 50MB |
| `front-end/.../sede.models.ts` | Modify | Align TransparencyMetric/Report interfaces |
| `front-end/.../transparency.service.ts` | Modify | Replace mock with HttpClient |
| `front-end/.../transparency.component.ts` | Modify | Add error/retry state |
| `front-end/.../transparency.component.html` | Modify | Add loading skeleton, error UI |
| `front-end/package.json` | Modify | Add chart.js + ng2-charts |
| `back-office/.../backoffice.models.ts` | Modify | Add transparency + analytics interfaces |
| `back-office/.../transparency-reports.service.ts` | Create | CRUD service with multipart |
| `back-office/.../analytics.service.ts` | Create | Analytics + PDF export service |
| `back-office/.../transparency-reports/` | Create | CRUD management component (3 files) |
| `back-office/.../statistics-dashboard/` | Create | Statistics dashboard component (3 files) |
| `back-office/.../app-routing.module.ts` | Modify | Add /admin/transparencia routes |
| `back-office/.../backoffice-layout.component.ts` | Modify | Add nav items |
| `back-office/package.json` | Modify | Add chart.js + ng2-charts |

**Total**: 10 new files, 15 modified files, 0 deleted files.

---

## Open Questions

- [ ] **PDF export library**: OpenPDF is lightweight but has limited chart rendering. Should we use a template-based approach (HTML table + text) or explore a headless browser approach (Puppeteer) for chart-inclusive PDFs?
- [ ] **Metrics computation performance**: `TransparencyMetricsService` queries all procedures. For large datasets (>100K), should we add materialized views or caching?
- [ ] **i18n for public metrics**: Should metric labels come from the backend (server-side constants) or remain as i18n keys resolved client-side? Current spec suggests direct strings from API.
- [ ] **Chart.js bundle size**: Lazy-loading the statistics route is recommended. Should we also split chart.js into a separate chunk?
