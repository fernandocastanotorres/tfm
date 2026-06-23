# Tasks: Transparency Data, Report Management & Statistics Dashboard

## Phase 1: Database & Backend Foundation

### 1.1 Create Flyway migration for transparency_reports table

**Description**: Create the database migration that adds the `transparency_reports` table with all required columns, constraints, and indexes.

**File to create**: `backend/src/main/resources/db/migration/V2__create_transparency_reports.sql`

**SQL content**:
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

**Dependencies**: None (first task)

---

### 1.2 Create TransparencyReportEntity JPA entity

**Description**: Create the JPA entity mapping to the `transparency_reports` table, following the existing entity pattern (see `PublicContentEntryEntity`).

**File to create**: `backend/src/main/java/es/tfm/records/infrastructure/persistence/entity/TransparencyReportEntity.java`

**Key details**:
- `@Entity`, `@Table(name = "transparency_reports")`
- Fields: `id` (UUID, `@Id`), `title`, `year`, `description`, `filePath`, `fileName`, `fileSize`, `mimeType`, `published`, `sortOrder`, `createdAt`, `updatedAt`
- Use `@Column` with explicit names matching SQL columns (snake_case)
- Use `Instant` for `createdAt`/`updatedAt`
- Add `@PrePersist` method to set `createdAt` and `updatedAt` to `Instant.now()` if null
- Add `@PreUpdate` method to set `updatedAt` to `Instant.now()`
- Standard getters/setters following existing pattern

**Dependencies**: 1.1 (migration must exist for JPA validation)

---

### 1.3 Create TransparencyReportJpaRepository

**Description**: Create the Spring Data JPA repository interface with custom query methods.

**File to create**: `backend/src/main/java/es/tfm/records/infrastructure/persistence/repository/TransparencyReportJpaRepository.java`

**Method signatures**:
```java
public interface TransparencyReportJpaRepository extends JpaRepository<TransparencyReportEntity, UUID> {
    List<TransparencyReportEntity> findByPublishedTrueOrderBySortOrderAscYearDesc();
    List<TransparencyReportEntity> findAllByOrderBySortOrderAscYearDesc();
}
```

**Dependencies**: 1.2

---

### 1.4 Create TransparencyDtos.java with all DTO records

**Description**: Create a new DTO file containing all transparency and analytics DTO records.

**File to create**: `backend/src/main/java/es/tfm/records/application/dto/TransparencyDtos.java`

**Records to define**:
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

**Dependencies**: None (pure DTO, no runtime deps)

---

### 1.5 Extend FileStorageService with subdirectory support

**Description**: Add overloaded methods to `FileStorageService` that accept a subdirectory parameter instead of a case UUID.

**File to modify**: `backend/src/main/java/es/tfm/records/infrastructure/storage/FileStorageService.java`

**Methods to add**:
```java
// Store in a named subdirectory (e.g. "transparency")
public String store(String subDirectory, MultipartFile file)

// Open stream by relative path (for download)
public InputStream openStreamByPath(String relativePath)

// Delete by relative path
public void deleteByPath(String relativePath)

// Exists check by relative path
public boolean existsByPath(String relativePath)
```

**Implementation notes**:
- `store(subDirectory, file)`: Creates `{baseDirectory}/{subDirectory}/` if needed, generates UUID filename, copies file, returns stored filename
- All methods enforce path traversal: `normalize()` + `startsWith(baseDirectory)` check
- Follow the existing `store(UUID, MultipartFile)` pattern closely
- `openStreamByPath` throws `ResourceNotFoundException("DOC", relativePath)` on failure
- `deleteByPath` throws `ConflictException("STORAGE", ...)` on failure

**Dependencies**: None (modifies existing file, no new deps)

---

### 1.6 Raise multipart limits in application.yml

**Description**: Increase file upload size limits to support 50MB PDF uploads.

**File to modify**: `backend/src/main/resources/application.yml`

**Change**:
```yaml
spring.servlet.multipart:
  max-file-size: 50MB
  max-request-size: 55MB
```
(currently 10MB / 10MB)

**Dependencies**: None

---

## Phase 2: Backend Services

### 2.1 Create TransparencyReportService

**Description**: Create the application service handling CRUD operations and file management for transparency reports.

**File to create**: `backend/src/main/java/es/tfm/records/application/service/TransparencyReportService.java`

**Method signatures**:
```java
@Service
public class TransparencyReportService {

    // Constructor injection: TransparencyReportJpaRepository, FileStorageService

    @Transactional
    TransparencyReportDto createReport(String title, int year, String description,
                                        MultipartFile file, int sortOrder, boolean published);

    @Transactional(readOnly = true)
    List<TransparencyReportDto> listAllReports();

    @Transactional(readOnly = true)
    List<PublicTransparencyReportDto> listPublishedReports();

    @Transactional
    TransparencyReportDto updateReport(UUID id, TransparencyDtos.UpdateReportRequest request);

    @Transactional
    TransparencyReportDto replaceFile(UUID id, MultipartFile file);

    @Transactional
    void deleteReport(UUID id);

    InputStream downloadReport(UUID id);

    InputStream downloadPublishedReport(UUID id); // 404 if unpublished
}
```

**Key logic**:
- `createReport`: Validate file (PDF only, not empty, <=50MB), call `fileStorageService.store("transparency", file)`, create entity, save, return DTO
- `replaceFile`: Find existing report, delete old file via `fileStorageService.deleteByPath()`, store new file, update entity fields, save
- `deleteReport`: Find report, delete file via `fileStorageService.deleteByPath()`, delete entity
- `downloadPublishedReport`: Find report, if `!published` throw `ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND")` (hides existence), return stream
- File validation: MIME type must be `application/pdf`, size > 0 and <= 50MB
- Error codes: `TRANSPARENCY-400-INVALID_FILE_TYPE`, `TRANSPARENCY-400-FILE_TOO_LARGE`, `TRANSPARENCY-400-EMPTY_FILE`, `TRANSPARENCY-404-REPORT_NOT_FOUND`

**Dependencies**: 1.2, 1.3, 1.4, 1.5

---

### 2.2 Create TransparencyMetricsService

**Description**: Create the service that computes live transparency metrics from the `procedures` table.

**File to create**: `backend/src/main/java/es/tfm/records/application/service/TransparencyMetricsService.java`

**Method signature**:
```java
@Service
public class TransparencyMetricsService {

    // Constructor injection: ProcedureJpaRepository, ProcedureTypeJpaRepository

    @Transactional(readOnly = true)
    TransparencyMetricsDto computeMetrics();
}
```

**Computation logic**:
- `totalProcedures`: count of all procedures
- `resolvedProcedures`: count where status = APPROVED or REJECTED
- `pendingProcedures`: count where status = SUBMITTED
- `avgResolutionDays`: average days between submittedAt/createdAt and updatedAt for resolved procedures
- `slaComplianceRate`: percentage of resolved procedures that met their SLA deadline (reuse `isWithinSla` logic from `BackofficeService`)
- `digitalProceduresPct`: percentage of procedures created through digital channel (if tracked; otherwise compute as 100.0 or derive from existing data)

**Dependencies**: 1.4

---

### 2.3 Extend BackofficeService with analyticsReport()

**Description**: Add a new method to `BackofficeService` that extends `dashboardReport()` with monthly aggregation, procedure type metrics, and unit SLA breakdown.

**File to modify**: `backend/src/main/java/es/tfm/records/application/service/BackofficeService.java`

**Method signature**:
```java
@Transactional(readOnly = true)
public TransparencyDtos.AnalyticsReport analyticsReport(LocalDate from, LocalDate to)
```

**Implementation**:
1. Reuse `dashboardReport(from, to)` to get the base `DashboardReport`
2. Compute `monthlyTrend`: Group procedures by `YYYY-MM` format, count created and resolved per month, compute avg resolution hours per month
3. Compute `procedureTypeMetrics`: For each procedure type, compute totalResolved, avgResolutionHours, medianResolutionHours, slaComplianceRate — sorted by totalResolved descending
4. Compute `unitSlaBreakdown`: For each assigned unit, compute totalCases, resolvedWithinSla, totalResolved, slaComplianceRate — sorted by slaComplianceRate ascending (worst first)
5. Return new `AnalyticsReport` combining existing DashboardReport fields with new computed fields

**Helper methods to add**:
- `computeMonthlyTrend(List<ProcedureEntity>, LocalDate, LocalDate, Map<UUID, ProcedureTypeEntity>)`
- `computeProcedureTypeMetrics(List<ProcedureEntity>, Map<UUID, ProcedureTypeEntity>)`
- `computeUnitSlaBreakdown(List<ProcedureEntity>, Map<UUID, ProcedureTypeEntity>)`
- `median(List<Double>)` — for median resolution time calculation

**Dependencies**: 1.4, Phase 1 complete

---

## Phase 3: Backend Controllers

### 3.1 Create TransparencyController (admin CRUD endpoints)

**Description**: Create a new REST controller for admin transparency report management.

**File to create**: `backend/src/main/java/es/tfm/records/entrypoints/controller/TransparencyController.java`

**Endpoints**:
```java
@RestController
@RequestMapping("/admin/transparency/reports")
@Tag(name = "Transparency Reports", description = "Admin CRUD for transparency PDF reports")
@SecurityRequirement(name = "bearerAuth")
public class TransparencyController {

    // Constructor: TransparencyReportService

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create transparency report with PDF upload")
    ResponseEntity<TransparencyReportDto> createReport(
        @RequestPart("file") MultipartFile file,
        @RequestPart("title") String title,
        @RequestPart("year") int year,
        @RequestPart(value = "description", required = false) String description,
        @RequestPart(value = "sortOrder", required = false) Integer sortOrder,
        @RequestPart(value = "published", required = false) Boolean published);

    @GetMapping
    @Operation(summary = "List all transparency reports (admin)")
    ResponseEntity<List<TransparencyReportDto>> listReports();

    @PutMapping("/{id}")
    @Operation(summary = "Update report metadata")
    ResponseEntity<TransparencyReportDto> updateReport(
        @PathVariable UUID id,
        @RequestBody TransparencyDtos.UpdateReportRequest request);

    @PostMapping(value = "/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace report PDF file")
    ResponseEntity<TransparencyReportDto> replaceFile(
        @PathVariable UUID id,
        @RequestPart("file") MultipartFile file);

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transparency report")
    ResponseEntity<Void> deleteReport(@PathVariable UUID id);

    @GetMapping("/{id}/download")
    @Operation(summary = "Download report PDF (admin)")
    ResponseEntity<InputStreamResource> downloadReport(@PathVariable UUID id);
}
```

**Download response**: Use `InputStreamResource` with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="{original_filename}"`

**Dependencies**: 2.1, 1.4

---

### 3.2 Extend PublicContentController with public transparency endpoints

**Description**: Add public read endpoints for transparency reports and metrics to the existing `PublicContentController`.

**File to modify**: `backend/src/main/java/es/tfm/records/entrypoints/controller/PublicContentController.java`

**Endpoints to add**:
```java
// Inject: TransparencyReportService, TransparencyMetricsService

@GetMapping("/transparency/reports")
@Operation(summary = "List published transparency reports (public)")
ResponseEntity<List<PublicTransparencyReportDto>> listPublishedReports();

@GetMapping("/transparency/reports/{id}/download")
@Operation(summary = "Download published report (public)")
ResponseEntity<InputStreamResource> downloadPublishedReport(@PathVariable UUID id);

@GetMapping("/transparency/metrics")
@Operation(summary = "Get transparency metrics (public)")
ResponseEntity<TransparencyMetricsDto> getMetrics();
```

**Security note**: These are under `/citizen/public-content/**` which is already `permitAll()` in `SecurityConfig`.

**Dependencies**: 2.1, 2.2

---

### 3.3 Extend BackofficeController with analytics endpoints

**Description**: Add analytics report and PDF export endpoints to the existing `BackofficeController`.

**File to modify**: `backend/src/main/java/es/tfm/records/entrypoints/controller/BackofficeController.java`

**Endpoints to add**:
```java
// Inject: (already has backofficeService)

@GetMapping("/analytics/report")
@Operation(summary = "Get enhanced analytics report")
ResponseEntity<TransparencyDtos.AnalyticsReport> analyticsReport(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to);

@GetMapping("/analytics/export")
@Operation(summary = "Export analytics as PDF")
ResponseEntity<byte[]> exportAnalyticsPdf(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to);
```

**PDF export note**: For now, return a simple text-based PDF or placeholder. The OpenPDF implementation can be deferred. Return `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="statistics-report-{from}-to-{to}.pdf"`.

**Dependencies**: 2.3

---

### 3.4 Add MaxUploadSizeExceededException handler to GlobalExceptionHandler

**Description**: Add a handler for Spring's `MaxUploadSizeExceededException` to return a proper error response when file uploads exceed the limit.

**File to modify**: `backend/src/main/java/es/tfm/records/entrypoints/advice/GlobalExceptionHandler.java`

**Handler to add**:
```java
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ExceptionHandler(MaxUploadSizeExceededException.class)
public ResponseEntity<ErrorResponse> handleMaxUploadSize(HttpServletRequest request) {
    ErrorResponse response = buildErrorResponse(
            400,
            "TRANSPARENCY-400-FILE_TOO_LARGE",
            "File exceeds maximum size of 50MB",
            request.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
}
```

**Dependencies**: None

---

### 3.5 Add explicit public transparency rule to SecurityConfig

**Description**: Add defense-in-depth explicit permit rule for public transparency endpoints.

**File to modify**: `backend/src/main/java/es/tfm/records/infrastructure/config/SecurityConfig.java`

**Change**: The existing `.requestMatchers(HttpMethod.GET, "/citizen/public-content/**").permitAll()` already covers this. No change needed, but verify the rule exists (it does at line 90).

**Dependencies**: None (verification only)

---

## Phase 4: Frontend Transparency (Citizen)

### 4.1 Update sede.models.ts — align TransparencyMetric and TransparencyReport interfaces

**Description**: Update the frontend models to match the backend DTOs.

**File to modify**: `front-end/src/app/application/models/sede.models.ts`

**New interfaces**:
```typescript
export interface TransparencyMetric {
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface TransparencyReport {
  id: string;
  title: string;
  year: number;
  description: string | null;
  fileName: string;
  fileSize: number;
  createdAt: string;
}
```

**Changes from old model**:
- `TransparencyMetric`: Remove `id` and `labelKey`; add direct `label` string
- `TransparencyReport`: Remove `titleKey`, `descriptionKey`, `downloadUrl`; add `title`, `description`, `fileName`, `fileSize`, `createdAt`

**Dependencies**: None (frontend-only, can be done in parallel with backend)

---

### 4.2 Refactor TransparencyService — replace mock with HttpClient

**Description**: Replace the mock data service with real HTTP calls to the public API.

**File to modify**: `front-end/src/app/application/services/transparency.service.ts`

**New implementation**:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransparencyMetric, TransparencyReport } from '../models/sede.models';

@Injectable({ providedIn: 'root' })
export class TransparencyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/citizen/public-content/transparency';

  getMetrics(): Observable<TransparencyMetric> {
    return this.http.get<TransparencyMetric>(`${this.baseUrl}/metrics`);
  }

  getReports(): Observable<TransparencyReport[]> {
    return this.http.get<TransparencyReport[]>(`${this.baseUrl}/reports`);
  }
}
```

**Notes**:
- Remove all mock data arrays
- Remove `of` and `delay` imports
- `getMetrics()` returns a single object (not array) since backend returns `TransparencyMetricsDto`

**Dependencies**: 4.1

---

### 4.3 Update TransparencyComponent — add error/retry state

**Description**: Update the component to handle loading, error, and retry states.

**File to modify**: `front-end/src/app/adapters/components/transparency/transparency.component.ts`

**Changes**:
- Add `hasError: boolean = false` property
- Add `retry()` method that re-calls `loadData()`
- Update `ngOnInit()` to set `hasError = true` on error
- The service now returns a single `TransparencyMetric` object, not an array — update component to handle this (or wrap in array for display)

**Dependencies**: 4.2

---

### 4.4 Update TransparencyComponent template — add loading skeleton and error UI

**Description**: Update the HTML template to show loading skeletons and error messages with retry button.

**File to modify**: `front-end/src/app/adapters/components/transparency/transparency.component.html`

**Changes**:
- Add loading skeleton (CSS-animated placeholder cards) when `isLoading === true`
- Add error message with retry button when `hasError === true`
- Update metric cards to use direct `label` instead of `labelKey | translate`
- Update report list to use `title`, `description`, `fileName`, `fileSize` directly
- Compute download URL in template: `/api/v1/citizen/public-content/transparency/reports/{{report.id}}/download`
- Add "No hay informes disponibles actualmente" message when reports array is empty

**File to modify**: `front-end/src/app/adapters/components/transparency/transparency.component.css`

**Changes**:
- Add skeleton animation CSS (pulse/shimmer effect)

**Dependencies**: 4.3

---

## Phase 5: Backoffice Transparency

### 5.1 Install chart.js + ng2-charts in both Angular apps

**Description**: Install charting dependencies in both `front-end/` and `back-office/`.

**Commands to run**:
```bash
cd front-end && npm install chart.js@^4.4.0 ng2-charts@^4.1.1
cd back-office && npm install chart.js@^4.4.0 ng2-charts@^4.1.1
```

**Files modified**: `front-end/package.json`, `back-office/package.json`

**Dependencies**: None

---

### 5.2 Register Chart.js in back-office app module

**Description**: Register Chart.js components in the back-office Angular module.

**File to modify**: `back-office/src/app/app.module.ts`

**Changes**:
```typescript
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Add NgChartsModule to imports array
```

**Dependencies**: 5.1

---

### 5.3 Add transparency + analytics models to backoffice.models.ts

**Description**: Add TypeScript interfaces for the new backend DTOs.

**File to modify**: `back-office/src/app/application/models/backoffice.models.ts`

**Interfaces to add**:
```typescript
export interface TransparencyReportDto {
  id: string;
  title: string;
  year: number;
  description: string | null;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReportRequest {
  title: string;
  year: number;
  description?: string;
  sortOrder?: number;
  published?: boolean;
}

export interface MonthlyTrendPoint {
  month: string;
  createdCases: number;
  resolvedCases: number;
  avgResolutionHours: number;
}

export interface ProcedureTypeMetric {
  procedureType: string;
  totalResolved: number;
  avgResolutionHours: number;
  medianResolutionHours: number;
  slaComplianceRate: number;
}

export interface UnitSlaBreakdown {
  unit: string;
  totalCases: number;
  resolvedWithinSla: number;
  totalResolved: number;
  slaComplianceRate: number;
}

export interface AnalyticsReport {
  summary: DashboardReportSummary;
  byStatus: DashboardDistributionItem[];
  byProcedureType: DashboardDistributionItem[];
  byAssignedUnit: DashboardDistributionItem[];
  dailyTrend: DashboardDailyTrendPoint[];
  monthlyTrend: MonthlyTrendPoint[];
  procedureTypeMetrics: ProcedureTypeMetric[];
  unitSlaBreakdown: UnitSlaBreakdown[];
}
```

**Dependencies**: 5.1

---

### 5.4 Create TransparencyReportsService (back-office)

**Description**: Create the back-office service for CRUD operations on transparency reports with multipart support.

**File to create**: `back-office/src/app/application/services/transparency-reports.service.ts`

**Method signatures**:
```typescript
@Injectable({ providedIn: 'root' })
export class TransparencyReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/admin/transparency/reports';

  list(): Observable<TransparencyReportDto[]>;
  create(formData: FormData): Observable<TransparencyReportDto>;
  update(id: string, data: UpdateReportRequest): Observable<TransparencyReportDto>;
  replaceFile(id: string, file: File): Observable<TransparencyReportDto>;
  delete(id: string): Observable<void>;
  download(id: string): void;  // triggers browser download via window.open
}
```

**Dependencies**: 5.3

---

### 5.5 Create AnalyticsService (back-office)

**Description**: Create the back-office service for analytics report and PDF export.

**File to create**: `back-office/src/app/application/services/analytics.service.ts`

**Method signatures**:
```typescript
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/admin/analytics';

  getReport(from?: string, to?: string): Observable<AnalyticsReport>;
  exportPdf(from?: string, to?: string): Observable<Blob>;
}
```

**Dependencies**: 5.3

---

### 5.6 Create transparency-reports component (CRUD management)

**Description**: Create the backoffice component for managing transparency PDF reports.

**Files to create**:
- `back-office/src/app/adapters/components/transparency-reports/transparency-reports.component.ts`
- `back-office/src/app/adapters/components/transparency-reports/transparency-reports.component.html`
- `back-office/src/app/adapters/components/transparency-reports/transparency-reports.component.css`

**Component class**:
```typescript
@Component({
  selector: 'bo-transparency-reports',
  templateUrl: './transparency-reports.component.html',
  styleUrls: ['./transparency-reports.component.css']
})
export class TransparencyReportsComponent implements OnInit {
  reports: TransparencyReportDto[] = [];
  isLoading = false;
  showForm = false;
  editingReport: TransparencyReportDto | null = null;
  formErrors: string | null = null;

  // Methods: loadReports(), openNewForm(), openEditForm(report),
  //          saveReport(), deleteReport(id), togglePublished(report),
  //          replaceFile(id, file), downloadReport(id)
}
```

**Template features**:
- Page header with "Informes de Transparencia" title and "Nuevo Informe" button
- Data table with columns: Title, Year, Published (badge), Sort Order, File Size, Created, Actions
- Published badge: green "Publicado" if true, gray "Borrador" if false
- Action buttons per row: Edit, Replace File, Download, Delete, Toggle Published
- Upload/edit form as modal or slide-over with fields: Title (required), Year (number, min 2000), Description (textarea), PDF File (file input, .pdf only), Sort Order (number, default 0), Published (toggle)
- Confirmation dialog for delete: "Are you sure you want to delete '{title}'?"
- Success/error toasts using SweetAlert2 (already available)

**Dependencies**: 5.4, 5.3

---

### 5.7 Add transparency routes to back-office routing

**Description**: Add routes for transparency reports and statistics under the "Transparencia" section.

**File to modify**: `back-office/src/app/app-routing.module.ts`

**Routes to add** (under the `tramitadorGuard` protected area, not requiring admin):
```typescript
{ path: 'transparencia/informes', component: TransparencyReportsComponent, title: 'Informes de Transparencia' },
{ path: 'transparencia/estadisticas', component: StatisticsDashboardComponent, title: 'Estadisticas' },
```

**Import statements**: Add imports for `TransparencyReportsComponent` and `StatisticsDashboardComponent`.

**Dependencies**: 5.6, 6.3 (statistics component must exist)

---

### 5.8 Add transparency nav items to backoffice layout

**Description**: Add navigation items for transparency section to the sidebar.

**File to modify**: `back-office/src/app/adapters/components/backoffice-layout/backoffice-layout.component.ts`

**Nav items to add**:
```typescript
{ label: 'Transparencia', icon: 'transparency', route: '/transparencia/informes' },
// Or as a section with sub-items:
// { label: 'Informes', icon: 'description', route: '/transparencia/informes' },
// { label: 'Estadisticas', icon: 'bar_chart', route: '/transparencia/estadisticas' },
```

**Dependencies**: 5.7

---

## Phase 6: Frontend Statistics (Citizen — if applicable)

**Note**: Per the proposal, the statistics dashboard is backoffice-only. The citizen transparency page only shows metrics cards (Phase 4). This phase covers the charting library registration for the front-end in case it's needed later.

### 6.1 Register Chart.js in front-end app module

**Description**: Register Chart.js components in the front-end Angular module (for potential future use).

**File to modify**: `front-end/src/app/app.module.ts`

**Changes**:
```typescript
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Add NgChartsModule to imports array
```

**Dependencies**: 5.1

---

## Phase 7: Backoffice Statistics

### 7.1 Create statistics-dashboard component

**Description**: Create the backoffice statistics dashboard component with visual charts.

**Files to create**:
- `back-office/src/app/adapters/components/statistics-dashboard/statistics-dashboard.component.ts`
- `back-office/src/app/adapters/components/statistics-dashboard/statistics-dashboard.component.html`
- `back-office/src/app/adapters/components/statistics-dashboard/statistics-dashboard.component.css`

**Component class**:
```typescript
@Component({
  selector: 'bo-statistics-dashboard',
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.css']
})
export class StatisticsDashboardComponent implements OnInit {
  report: AnalyticsReport | null = null;
  dateFrom: string | null = null;
  dateTo: string | null = null;
  isLoading = false;
  hasError = false;
  selectedPreset = '30days';

  // Chart data properties (ng2-charts format)
  trendLineChartData: ChartData<'line'>;
  trendLineChartOptions: ChartOptions<'line'>;
  typeBarChartData: ChartData<'bar'>;
  typeBarChartOptions: ChartOptions<'bar'>;
  statusDoughnutChartData: ChartData<'doughnut'>;
  statusDoughnutChartOptions: ChartOptions<'doughnut'>;
  unitBarChartData: ChartData<'bar'>;
  unitBarChartOptions: ChartOptions<'bar'>;

  // Methods: ngOnInit(), loadReport(), applyPreset(preset),
  //          applyCustomRange(), exportPdf(), setQuickRange()
}
```

**Template layout**:
- Header: "Estadisticas" title + "Export PDF" button
- Date range bar: Preset buttons (7 days, 30 days, 90 days, Current year, Custom) + custom date pickers (From, To) + Apply button
- Summary cards row (7 cards): Total, Pending (orange), In Progress (blue), Resolved (green), Overdue (red), SLA Compliance (color-coded), Avg Resolution (hours)
- Chart grid:
  - Row 1: Daily trend line chart (full width, min-height 300px)
  - Row 2: Procedure type horizontal bar chart (col-span-1, min-height 280px) + Status doughnut chart (col-span-1, min-height 280px)
  - Row 3: Unit distribution vertical bar chart (full width, min-height 280px)

**Chart configurations**:
- **Trend line**: `type: 'line'`, datasets: "Created" (blue #3B82F6), "Resolved" (green #10B981), x-axis DD/MM format, y-axis starts at 0
- **Type bar**: `type: 'bar'`, `indexAxis: 'y'` (horizontal), top 10 types, distinct Tailwind palette colors
- **Status doughnut**: `type: 'doughnut'`, colors matching status (SUBMITTED:orange, IN_REVIEW:blue, APPROVED:green, REJECTED:red, AMENDMENT_REQUIRED:yellow, RESUBMITTED:purple), legend on right
- **Unit bar**: `type: 'bar'`, top 8 units, blue shades, x-axis labels rotated 45 degrees if needed

**CSS**: Use Tailwind utility classes for layout (grid, flex, gap), chart containers with `min-height` for responsiveness

**Dependencies**: 5.2, 5.5, 5.3

---

### 7.2 Implement PDF export in back-office

**Description**: Wire up the PDF export button in the statistics dashboard to call the backend export endpoint.

**Implementation in `statistics-dashboard.component.ts`**:
```typescript
exportPdf(): void {
  this.analyticsService.exportPdf(this.dateFrom, this.dateTo).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistics-report-${this.dateFrom || 'all'}-to-${this.dateTo || 'now'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => { /* show error toast */ }
  });
}
```

**Dependencies**: 7.1, 3.3

---

## Phase 8: Testing & Verification

### 8.1 Unit tests for TransparencyReportService

**Description**: Write JUnit 5 unit tests for the transparency report CRUD service.

**File to create**: `backend/src/test/java/es/tfm/records/tests/service/TransparencyReportServiceTest.java`

**Test cases**:
- `createReport_shouldStoreFileAndReturnDto` — mock MultipartFile (PDF), verify store called, entity saved
- `createReport_shouldRejectNonPdf` — mock MultipartFile with text/plain MIME, expect exception
- `createReport_shouldRejectEmptyFile` — mock MultipartFile with size 0, expect exception
- `listAllReports_shouldReturnAllSorted` — seed mock data, verify sort order
- `listPublishedReports_shouldReturnOnlyPublished` — seed mix of published/unpublished
- `updateReport_shouldUpdateMetadata` — update title/year, verify saved
- `deleteReport_shouldDeleteFileAndEntity` — verify both storage delete and repository delete called
- `downloadPublishedReport_should404ForUnpublished` — verify ResourceNotFoundException thrown

**Dependencies**: 2.1, 2.2

---

### 8.2 Unit tests for TransparencyMetricsService

**Description**: Write JUnit 5 unit tests for the metrics computation service.

**File to create**: `backend/src/test/java/es/tfm/records/tests/service/TransparencyMetricsServiceTest.java`

**Test cases**:
- `computeMetrics_shouldReturnCorrectCounts` — mock procedures with various statuses, verify counts
- `computeMetrics_shouldComputeAvgResolutionDays` — mock resolved procedures with known dates
- `computeMetrics_shouldComputeSlaCompliance` — mock procedures with known SLA outcomes

**Dependencies**: 2.2

---

### 8.3 Unit tests for BackofficeService.analyticsReport()

**Description**: Write JUnit 5 unit tests for the analytics extension method.

**File to create**: `backend/src/test/java/es/tfm/records/tests/service/BackofficeServiceAnalyticsTest.java`

**Test cases**:
- `analyticsReport_shouldIncludeMonthlyTrend` — verify monthly aggregation
- `analyticsReport_shouldIncludeProcedureTypeMetrics` — verify per-type resolution stats
- `analyticsReport_shouldIncludeUnitSlaBreakdown` — verify per-unit SLA data
- `analyticsReport_shouldSwapDatesIfFromAfterTo` — verify date swap logic
- `analyticsReport_shouldDefaultToLast30Days` — verify default range

**Dependencies**: 2.3

---

### 8.4 Integration tests for TransparencyController

**Description**: Write `@WebMvcTest` integration tests for the transparency admin endpoints.

**File to create**: `backend/src/test/java/es/tfm/records/tests/controller/TransparencyControllerTest.java`

**Test cases**:
- `createReport_shouldReturn201` — multipart POST with mock PDF
- `listReports_shouldReturn200` — GET all reports
- `updateReport_shouldReturn200` — PUT with JSON body
- `deleteReport_shouldReturn204` — DELETE existing report
- `deleteNonExistentReport_shouldReturn404` — DELETE with unknown UUID
- `downloadReport_shouldStreamPdf` — GET download, verify Content-Type and Content-Disposition

**Dependencies**: 3.1

---

### 8.5 Integration tests for public transparency endpoints

**Description**: Write `@WebMvcTest` tests for public transparency endpoints.

**File to create**: `backend/src/test/java/es/tfm/records/tests/controller/PublicTransparencyControllerTest.java`

**Test cases**:
- `listPublishedReports_shouldReturn200` — GET public reports
- `getMetrics_shouldReturn200` — GET public metrics
- `downloadPublishedReport_should404ForUnpublished` — verify unpublished reports return 404

**Dependencies**: 3.2

---

### 8.6 Frontend unit tests — TransparencyService

**Description**: Write Angular TestBed unit tests for the refactored transparency service.

**File to create**: `front-end/src/app/application/services/transparency.service.spec.ts`

**Test cases**:
- `getMetrics should call HttpClient with correct URL`
- `getReports should call HttpClient with correct URL`

**Dependencies**: 4.2

---

### 8.7 Frontend unit tests — Backoffice services

**Description**: Write Angular TestBed unit tests for the new back-office services.

**Files to create**:
- `back-office/src/app/application/services/transparency-reports.service.spec.ts`
- `back-office/src/app/application/services/analytics.service.spec.ts`

**Test cases** (per service):
- Each method calls HttpClient with correct URL, method, and params

**Dependencies**: 5.4, 5.5

---

### 8.8 Manual verification checklist

**Description**: Run through the manual verification scenarios.

**Steps**:
1. Start backend + frontend + back-office
2. Verify public transparency page loads real metrics (not mock data)
3. Verify public transparency page lists downloadable PDF reports
4. Verify backoffice can upload a PDF report (multipart form)
5. Verify backoffice can edit report metadata
6. Verify backoffice can delete a report (with confirmation)
7. Verify backoffice can toggle published status
8. Verify backoffice statistics dashboard shows charts with real data
9. Verify date range filtering works on statistics dashboard
10. Verify PDF export downloads a file
11. Verify public endpoints work without authentication (use curl/Postman)
12. Verify file upload validation: wrong MIME type rejected, oversized file rejected
13. Verify no regression in existing dashboard or procedure endpoints

**Dependencies**: All phases complete

---

## Dependency Graph Summary

```
Phase 1 (DB/Foundation)
  1.1 ──→ 1.2 ──→ 1.3 ──→ 2.1 ──→ 3.1
  1.4 ────────────────────→ 2.1, 2.2, 2.3, 3.1, 3.3
  1.5 ────────────────────→ 2.1
  1.6 ────────────────────→ (config, no deps)

Phase 2 (Services)
  2.1 ──→ 3.1, 3.2, 5.4, 8.1, 8.4
  2.2 ──→ 3.2, 8.2
  2.3 ──→ 3.3, 8.3

Phase 3 (Controllers)
  3.1 ──→ 8.4
  3.2 ──→ 8.5
  3.3 ──→ 7.2, 8.4

Phase 4 (Frontend Transparency)
  4.1 ──→ 4.2 ──→ 4.3 ──→ 4.4
  4.2 ──→ 8.6

Phase 5 (Backoffice Transparency)
  5.1 ──→ 5.2, 5.3, 6.1
  5.3 ──→ 5.4, 5.5, 5.6
  5.4 ──→ 5.6, 8.7
  5.5 ──→ 7.1, 8.7
  5.6 ──→ 5.7
  5.7 ──→ 5.8

Phase 6 (Frontend Charting)
  6.1 ──→ (standalone registration)

Phase 7 (Backoffice Statistics)
  7.1 ──→ 7.2
  7.1 depends on: 5.2, 5.5, 5.3

Phase 8 (Testing)
  8.1-8.5: Backend tests (depend on respective services/controllers)
  8.6-8.7: Frontend tests (depend on respective services)
  8.8: Manual verification (depends on ALL phases)
```

## Recommended Execution Order

For a single implementer working sequentially:

1. **1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6** (DB & Foundation — can be done in one session)
2. **2.1 → 2.2 → 2.3** (Services — build on foundation)
3. **3.1 → 3.2 → 3.3 → 3.4** (Controllers — wire up services)
4. **4.1 → 4.2 → 4.3 → 4.4** (Frontend Transparency — citizen-facing)
5. **5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 5.7 → 5.8** (Backoffice Transparency — CRUD UI)
6. **7.1 → 7.2** (Backoffice Statistics — charts dashboard)
7. **8.1 → 8.2 → 8.3 → 8.4 → 8.5 → 8.6 → 8.7 → 8.8** (Testing — verify everything)
