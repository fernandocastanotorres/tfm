# Proposal: Transparency Data, Report Management & Statistics Dashboard

## Intent

The transparency page (`/sede/transparencia`) currently displays 100% mock data, undermining the credibility of the portal. Backoffice operators have no way to upload/manage transparency PDF reports, and the existing dashboard stats are rendered as plain text lists with no visual charts or exportable reports. This change connects transparency to real data, adds PDF report CRUD from backoffice, and delivers a visual statistics dashboard with charts and PDF export.

## Scope

### In Scope
- Backend: `transparency_reports` table migration + CRUD service + file upload endpoints
- Backend: Public read endpoints for transparency metrics and reports (no auth required)
- Backend: Enhanced analytics endpoint extending existing `dashboardReport()` logic
- Backend: PDF export endpoint for statistics (`GET /admin/analytics/export?format=pdf&from=&to=`)
- Frontend: Update `TransparencyService` to call real APIs instead of mock `of(...).pipe(delay())`
- Frontend: New `StatisticsComponent` with Chart.js visual charts
- Backoffice: New transparency reports management section (upload/manage/download PDFs)
- Backoffice: New statistics dashboard with visual charts and PDF export button

### Out of Scope
- Modifying existing procedure/case management logic
- Changes to authentication/authorization
- Mobile app support
- Real-time WebSocket updates
- Citizen-side statistics page (backoffice only for now)

## Capabilities

### New Capabilities
- `transparency-reports`: CRUD + file upload for transparency PDF reports, public read access
- `statistics-dashboard`: Analytics endpoint with enhanced dimensions, visual charts, PDF export
- `transparency-metrics`: Public API for real-time transparency metrics computed from procedure data

### Modified Capabilities
- None (new capabilities only; existing dashboard endpoints remain unchanged)

## Approach

1. **Database**: Flyway migration creating `transparency_reports` table (id, title, year, description, file_path, file_name, file_size, mime_type, published, sort_order, created_at, updated_at)
2. **Backend Service Layer**:
   - `TransparencyReportService` — CRUD + file operations using existing `FileStorageService` with `{baseDir}/transparency/` subdirectory
   - Extend `BackofficeService` with `analyticsReport()` adding monthly aggregation and top-5 procedure types by resolution time
   - `TransparencyMetricsService` — computes live metrics from `procedures` table (total, resolved, pending, avg days, SLA rate)
3. **Backend Endpoints** (in `BackofficeController` + new `TransparencyController`):
   - `GET/POST/PUT/DELETE /admin/transparency/reports` (auth required)
   - `GET /admin/transparency/reports/{id}/download` (stream PDF, auth required)
   - `GET /citizen/public-content/transparency/metrics` (public)
   - `GET /citizen/public-content/transparency/reports` (public, published only)
   - `GET /admin/analytics/export?format=pdf&from=&to=` (auth required)
4. **Frontend**:
   - Install `chart.js` + `ng2-charts` in `front-end/`
   - Update `transparency.service.ts` to use `HttpClient` with real endpoints
   - Create `statistics.component.ts/.html/.css` with line chart (trend), bar chart (by type), doughnut (by status), and summary cards
5. **Backoffice**:
   - Add `/admin/transparencia/informes` route with table + upload form
   - Add `/admin/transparencia/estadisticas` route with charts + date range picker + export button

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/main/java/es/tfg/records/...` | New | TransparencyReportService, TransparencyMetricsService, TransparencyController, DTOs, entity, repository |
| `backend/src/main/resources/db/migration/` | New | Flyway migration for `transparency_reports` table |
| `backend/src/main/java/es/tfg/records/application/service/BackofficeService.java` | Modified | Add `analyticsReport()` method with monthly aggregation |
| `backend/src/main/java/es/tfg/records/entrypoints/controller/BackofficeController.java` | Modified | Add analytics export endpoint |
| `front-end/src/app/application/services/transparency.service.ts` | Modified | Replace mock data with HttpClient calls |
| `front-end/src/app/adapters/components/transparency/` | Modified | Update component to handle real API responses |
| `front-end/src/app/adapters/components/statistics/` | New | Statistics component with charts |
| `front-end/package.json` | Modified | Add chart.js + ng2-charts dependencies |
| `back-office/src/app/adapters/components/transparency-reports/` | New | CRUD management component for PDF reports |
| `back-office/src/app/adapters/components/statistics-dashboard/` | New | Visual statistics dashboard with charts |
| `back-office/src/app/application/services/` | Modified | Add transparency + analytics service methods |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Chart.js bundle size increase | Medium | Use tree-shakable imports, lazy-load statistics route |
| File storage path conflicts with existing cases | Low | Use dedicated `transparency/` subdirectory, separate from case directories |
| Large procedure dataset slows analytics query | Medium | Add date range params (already supported), consider pagination for trend data |
| PDF export without proper library | Low | Use simple HTML-to-PDF via browser print or lightweight library like OpenPDF |

## Rollback Plan

1. Revert the Flyway migration (drop `transparency_reports` table) — use `V2__...` naming so Flyway can rollback
2. Remove new endpoints from `BackofficeController` and `TransparencyController`
3. Delete new service classes, DTOs, entities, repositories
4. Revert `transparency.service.ts` to previous mock-data version
5. Remove `chart.js` + `ng2-charts` from `front-end/package.json`
6. Delete new frontend/backoffice components
7. Remove uploaded files from `{baseDir}/transparency/` directory

## Dependencies

- `chart.js` ^4.x and `ng2-charts` ^5.x (Angular-compatible charting)
- Existing `FileStorageService` for report file storage
- Existing `BackofficeService.dashboardReport()` as foundation for analytics

## Success Criteria

- [ ] Transparency page displays real metrics computed from `procedures` table
- [ ] Transparency page lists downloadable PDF reports from database
- [ ] Backoffice can upload, edit, delete, and toggle visibility of transparency PDF reports
- [ ] Uploaded PDFs are stored securely with path traversal protection
- [ ] Backoffice statistics dashboard shows visual charts (trend, by type, by status, by unit)
- [ ] Statistics dashboard supports date range filtering
- [ ] Statistics dashboard can export report as PDF
- [ ] Public transparency endpoints require no authentication
- [ ] All new endpoints return proper error responses (404, 400, 403)
- [ ] No regression in existing dashboard or procedure endpoints
