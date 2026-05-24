package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.dto.PublicContentDtos;
import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.application.service.BackofficeService;
import es.tfg.records.application.service.DocumentDownloadVariant;
import es.tfg.records.application.service.DocumentService;
import es.tfg.records.application.service.EniMetadataService;
import es.tfg.records.application.service.PublicContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@Tag(name = "Backoffice", description = "Private backoffice dashboard, task, user and procedure management")
@SecurityRequirement(name = "bearerAuth")
public class BackofficeController {

    private final BackofficeService backofficeService;
    private final EniMetadataService eniMetadataService;
    private final PublicContentService publicContentService;
    private final DocumentService documentService;

    public BackofficeController(BackofficeService backofficeService,
                                EniMetadataService eniMetadataService,
                                PublicContentService publicContentService,
                                DocumentService documentService) {
        this.backofficeService = backofficeService;
        this.eniMetadataService = eniMetadataService;
        this.publicContentService = publicContentService;
        this.documentService = documentService;
    }

    @GetMapping("/public-content/legislation")
    @Operation(summary = "List legislation entries for public pages")
    public ResponseEntity<List<PublicContentDtos.LegislationEntry>> listLegislationAdmin() {
        return ResponseEntity.ok(publicContentService.listLegislationAdmin());
    }

    @PostMapping("/public-content/legislation")
    @Operation(summary = "Create legislation entry")
    public ResponseEntity<PublicContentDtos.LegislationEntry> createLegislationAdmin(@RequestBody PublicContentDtos.LegislationUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createLegislation(request));
    }

    @PutMapping("/public-content/legislation/{id}")
    @Operation(summary = "Update legislation entry")
    public ResponseEntity<PublicContentDtos.LegislationEntry> updateLegislationAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.LegislationUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateLegislation(id, request));
    }

    @GetMapping("/public-content/legislation/{id}/translations")
    @Operation(summary = "List legislation translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.LegislationEntry>> listLegislationTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listLegislationTranslations(id));
    }

    @DeleteMapping("/public-content/legislation/{id}")
    @Operation(summary = "Delete legislation entry")
    public ResponseEntity<Void> deleteLegislationAdmin(@PathVariable UUID id) {
        publicContentService.deleteLegislation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/faq/categories")
    @Operation(summary = "List FAQ categories for public pages")
    public ResponseEntity<List<PublicContentDtos.FaqCategoryEntry>> listFaqCategoriesAdmin() {
        return ResponseEntity.ok(publicContentService.listFaqCategoriesAdmin());
    }

    @PostMapping("/public-content/faq/categories")
    @Operation(summary = "Create FAQ category")
    public ResponseEntity<PublicContentDtos.FaqCategoryEntry> createFaqCategoryAdmin(@RequestBody PublicContentDtos.FaqCategoryUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createFaqCategory(request));
    }

    @PutMapping("/public-content/faq/categories/{id}")
    @Operation(summary = "Update FAQ category")
    public ResponseEntity<PublicContentDtos.FaqCategoryEntry> updateFaqCategoryAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.FaqCategoryUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateFaqCategory(id, request));
    }

    @GetMapping("/public-content/faq/categories/{id}/translations")
    @Operation(summary = "List FAQ category translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.FaqCategoryEntry>> listFaqCategoryTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listFaqCategoryTranslations(id));
    }

    @DeleteMapping("/public-content/faq/categories/{id}")
    @Operation(summary = "Delete FAQ category")
    public ResponseEntity<Void> deleteFaqCategoryAdmin(@PathVariable UUID id) {
        publicContentService.deleteFaqCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/faq")
    @Operation(summary = "List FAQ entries for public pages")
    public ResponseEntity<List<PublicContentDtos.FaqEntry>> listFaqAdmin() {
        return ResponseEntity.ok(publicContentService.listFaqAdmin());
    }

    @PostMapping("/public-content/faq")
    @Operation(summary = "Create FAQ entry")
    public ResponseEntity<PublicContentDtos.FaqEntry> createFaqAdmin(@RequestBody PublicContentDtos.FaqUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createFaq(request));
    }

    @PutMapping("/public-content/faq/{id}")
    @Operation(summary = "Update FAQ entry")
    public ResponseEntity<PublicContentDtos.FaqEntry> updateFaqAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.FaqUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateFaq(id, request));
    }

    @GetMapping("/public-content/faq/{id}/translations")
    @Operation(summary = "List FAQ translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.FaqEntry>> listFaqTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listFaqTranslations(id));
    }

    @DeleteMapping("/public-content/faq/{id}")
    @Operation(summary = "Delete FAQ entry")
    public ResponseEntity<Void> deleteFaqAdmin(@PathVariable UUID id) {
        publicContentService.deleteFaq(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/calendar")
    @Operation(summary = "List calendar entries for public pages")
    public ResponseEntity<List<PublicContentDtos.CalendarEntry>> listCalendarAdmin() {
        return ResponseEntity.ok(publicContentService.listCalendarAdmin());
    }

    @PostMapping("/public-content/calendar")
    @Operation(summary = "Create calendar entry")
    public ResponseEntity<PublicContentDtos.CalendarEntry> createCalendarAdmin(@RequestBody PublicContentDtos.CalendarUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createCalendar(request));
    }

    @PutMapping("/public-content/calendar/{id}")
    @Operation(summary = "Update calendar entry")
    public ResponseEntity<PublicContentDtos.CalendarEntry> updateCalendarAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.CalendarUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateCalendar(id, request));
    }

    @GetMapping("/public-content/calendar/{id}/translations")
    @Operation(summary = "List calendar translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.CalendarEntry>> listCalendarTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listCalendarTranslations(id));
    }

    @DeleteMapping("/public-content/calendar/{id}")
    @Operation(summary = "Delete calendar entry")
    public ResponseEntity<Void> deleteCalendarAdmin(@PathVariable UUID id) {
        publicContentService.deleteCalendar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/institutional")
    @Operation(summary = "List institutional info entries for public pages")
    public ResponseEntity<List<PublicContentDtos.InstitutionalEntry>> listInstitutionalAdmin() {
        return ResponseEntity.ok(publicContentService.listInstitutionalAdmin());
    }

    @PostMapping("/public-content/institutional")
    @Operation(summary = "Create institutional info entry")
    public ResponseEntity<PublicContentDtos.InstitutionalEntry> createInstitutionalAdmin(@RequestBody PublicContentDtos.InstitutionalUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createInstitutional(request));
    }

    @PutMapping("/public-content/institutional/{id}")
    @Operation(summary = "Update institutional info entry")
    public ResponseEntity<PublicContentDtos.InstitutionalEntry> updateInstitutionalAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.InstitutionalUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateInstitutional(id, request));
    }

    @GetMapping("/public-content/institutional/{id}/translations")
    @Operation(summary = "List institutional translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.InstitutionalEntry>> listInstitutionalTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listInstitutionalTranslations(id));
    }

    @DeleteMapping("/public-content/institutional/{id}")
    @Operation(summary = "Delete institutional info entry")
    public ResponseEntity<Void> deleteInstitutionalAdmin(@PathVariable UUID id) {
        publicContentService.deleteInstitutional(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/organisms")
    @Operation(summary = "List organism entries for public pages")
    public ResponseEntity<List<PublicContentDtos.OrganismEntry>> listOrganismsAdmin() {
        return ResponseEntity.ok(publicContentService.listOrganismsAdmin());
    }

    @GetMapping("/public-content/organism-categories")
    @Operation(summary = "List organism categories for public pages")
    public ResponseEntity<List<PublicContentDtos.FaqCategoryEntry>> listOrganismCategoriesAdmin() {
        return ResponseEntity.ok(publicContentService.listOrganismCategoriesAdmin());
    }

    @PostMapping("/public-content/organisms")
    @Operation(summary = "Create organism entry")
    public ResponseEntity<PublicContentDtos.OrganismEntry> createOrganismAdmin(@RequestBody PublicContentDtos.OrganismUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createOrganism(request));
    }

    @PutMapping("/public-content/organisms/{id}")
    @Operation(summary = "Update organism entry")
    public ResponseEntity<PublicContentDtos.OrganismEntry> updateOrganismAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.OrganismUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateOrganism(id, request));
    }

    @GetMapping("/public-content/organisms/{id}/translations")
    @Operation(summary = "List organism translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.OrganismEntry>> listOrganismTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listOrganismTranslations(id));
    }

    @DeleteMapping("/public-content/organisms/{id}")
    @Operation(summary = "Delete organism entry")
    public ResponseEntity<Void> deleteOrganismAdmin(@PathVariable UUID id) {
        publicContentService.deleteOrganism(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/resources")
    @Operation(summary = "List resource entries for public pages")
    public ResponseEntity<List<PublicContentDtos.ResourceEntry>> listResourcesAdmin() {
        return ResponseEntity.ok(publicContentService.listResourcesAdmin());
    }

    @PostMapping("/public-content/resources")
    @Operation(summary = "Create resource entry")
    public ResponseEntity<PublicContentDtos.ResourceEntry> createResourceAdmin(@RequestBody PublicContentDtos.ResourceUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicContentService.createResource(request));
    }

    @PutMapping("/public-content/resources/{id}")
    @Operation(summary = "Update resource entry")
    public ResponseEntity<PublicContentDtos.ResourceEntry> updateResourceAdmin(
            @PathVariable UUID id,
            @RequestBody PublicContentDtos.ResourceUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.updateResource(id, request));
    }

    @GetMapping("/public-content/resources/{id}/translations")
    @Operation(summary = "List resource translations by content UUID")
    public ResponseEntity<List<PublicContentDtos.ResourceEntry>> listResourceTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(publicContentService.listResourceTranslations(id));
    }

    @DeleteMapping("/public-content/resources/{id}")
    @Operation(summary = "Delete resource entry")
    public ResponseEntity<Void> deleteResourceAdmin(@PathVariable UUID id) {
        publicContentService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public-content/theme")
    @Operation(summary = "Get configurable sede theme palette")
    public ResponseEntity<PublicContentDtos.ThemeCatalog> getThemePaletteAdmin() {
        return ResponseEntity.ok(publicContentService.getThemePaletteAdmin());
    }

    @PutMapping("/public-content/theme")
    @Operation(summary = "Save configurable sede theme palette")
    public ResponseEntity<PublicContentDtos.ThemeCatalog> saveThemePaletteAdmin(@RequestBody PublicContentDtos.ThemePaletteUpsertRequest request) {
        return ResponseEntity.ok(publicContentService.saveThemePalette(request));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get backoffice dashboard stats")
    public ResponseEntity<BackofficeDtos.DashboardStats> dashboardStats() {
        return ResponseEntity.ok(backofficeService.dashboardStats());
    }

    @GetMapping("/dashboard/report")
    @Operation(summary = "Get backoffice dashboard report")
    public ResponseEntity<BackofficeDtos.DashboardReport> dashboardReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(backofficeService.dashboardReport(from, to));
    }

    @GetMapping("/analytics/report")
    @Operation(summary = "Get extended analytics report with monthly trends and SLA breakdowns")
    public ResponseEntity<TransparencyDtos.AnalyticsReport> analyticsReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(backofficeService.analyticsReport(from, to));
    }

    @GetMapping("/analytics/export")
    @Operation(summary = "Export analytics report as PDF")
    public ResponseEntity<Resource> exportAnalyticsPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] pdfBytes = backofficeService.exportAnalyticsPdf(from, to);
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);
        String filename = "informe-estadisticas-" + (from != null ? from.toString() : "inicio") + "-" + (to != null ? to.toString() : "fin") + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    @GetMapping("/eni/metadata/procedures/{id}")
    @Operation(summary = "Get ENI metadata for procedure")
    public ResponseEntity<BackofficeDtos.EniMetadataEntry> getProcedureEniMetadata(@PathVariable UUID id) {
        return ResponseEntity.ok(eniMetadataService.getProcedureMetadata(id));
    }

    @GetMapping("/eni/metadata/documents/{id}")
    @Operation(summary = "Get ENI metadata for document")
    public ResponseEntity<BackofficeDtos.EniMetadataEntry> getDocumentEniMetadata(@PathVariable UUID id) {
        return ResponseEntity.ok(eniMetadataService.getDocumentMetadata(id));
    }

    @GetMapping("/tasks/pending")
    @Operation(summary = "Get pending backoffice tasks")
    public ResponseEntity<List<BackofficeDtos.PendingTask>> pendingTasks() {
        return ResponseEntity.ok(backofficeService.pendingTasks());
    }

    @GetMapping("/users")
    @Operation(summary = "List backoffice users")
    public ResponseEntity<List<BackofficeDtos.BackofficeUser>> listUsers() {
        return ResponseEntity.ok(backofficeService.listUsers());
    }

    @PostMapping("/users")
    @Operation(summary = "Create backoffice user")
    public ResponseEntity<BackofficeDtos.BackofficeUser> createUser(@RequestBody BackofficeDtos.CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backofficeService.createUser(request));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update backoffice user")
    public ResponseEntity<BackofficeDtos.BackofficeUser> updateUser(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.UpdateUserRequest request) {
        return ResponseEntity.ok(backofficeService.updateUser(id, request));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate backoffice user")
    public ResponseEntity<BackofficeDtos.BackofficeUser> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.UserStatusRequest request) {
        return ResponseEntity.ok(backofficeService.toggleUserStatus(id, request.isActive()));
    }

    @GetMapping("/procedure-types")
    @Operation(summary = "List managed procedure types")
    public ResponseEntity<List<BackofficeDtos.ManagedProcedure>> listProcedureTypes() {
        return ResponseEntity.ok(backofficeService.listProcedures());
    }

    @PostMapping("/procedure-types")
    @Operation(summary = "Create managed procedure type")
    public ResponseEntity<BackofficeDtos.ManagedProcedure> createProcedureType(@RequestBody BackofficeDtos.ProcedureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backofficeService.createProcedure(request));
    }

    @PutMapping("/procedure-types/{id}")
    @Operation(summary = "Update managed procedure type")
    public ResponseEntity<BackofficeDtos.ManagedProcedure> updateProcedureType(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.ProcedureRequest request) {
        return ResponseEntity.ok(backofficeService.updateProcedure(id, request));
    }

    @PatchMapping("/procedure-types/{id}/status")
    @Operation(summary = "Update managed procedure type status")
    public ResponseEntity<BackofficeDtos.ManagedProcedure> updateProcedureTypeStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(backofficeService.toggleProcedureStatus(id, request.getOrDefault("status", "DRAFT")));
    }

    @GetMapping("/procedure-types/{id}/translations")
    @Operation(summary = "List managed procedure translations by locale")
    public ResponseEntity<List<BackofficeDtos.ProcedureTranslation>> listProcedureTypeTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(backofficeService.listProcedureTranslations(id));
    }

    @PutMapping("/procedure-types/{id}/translations")
    @Operation(summary = "Create or update managed procedure translation")
    public ResponseEntity<BackofficeDtos.ProcedureTranslation> upsertProcedureTypeTranslation(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.ProcedureTranslationRequest request) {
        return ResponseEntity.ok(backofficeService.upsertProcedureTranslation(id, request));
    }

    @GetMapping("/procedure-types/{id}/field-i18n")
    @Operation(summary = "List all form field translations for a procedure type, grouped by task")
    public ResponseEntity<List<BackofficeDtos.FieldI18nGroup>> listFieldTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(backofficeService.listFieldTranslations(id));
    }

    @PutMapping("/procedure-types/{id}/field-i18n")
    @Operation(summary = "Create or update a form field translation")
    public ResponseEntity<BackofficeDtos.FieldI18nEntry> upsertFieldTranslation(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.FieldI18nUpsertRequest request) {
        return ResponseEntity.ok(backofficeService.upsertFieldTranslation(id, request));
    }

    @DeleteMapping("/procedure-types/{id}/field-i18n/{fieldId}/{locale}")
    @Operation(summary = "Delete a form field translation")
    public ResponseEntity<Void> deleteFieldTranslation(
            @PathVariable UUID id,
            @PathVariable String fieldId,
            @PathVariable String locale) {
        backofficeService.deleteFieldTranslation(id, fieldId, locale);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/procedures/documents/{id}/download")
    @Operation(summary = "Download case document (admin)", description = "Download a document attached to any case, accessible by backoffice users")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable UUID id,
            @RequestParam(name = "variant", defaultValue = "CURRENT") DocumentDownloadVariant variant) {
        Resource resource = documentService.downloadDocumentForAdmin(id, variant);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .body(resource);
    }
}
