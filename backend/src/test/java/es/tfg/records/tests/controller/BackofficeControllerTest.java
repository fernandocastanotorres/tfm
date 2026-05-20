package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.dto.PublicContentDtos;
import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.application.service.BackofficeService;
import es.tfg.records.application.service.DocumentService;
import es.tfg.records.application.service.EniMetadataService;
import es.tfg.records.application.service.PublicContentService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.BackofficeController;
import es.tfg.records.application.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BackofficeController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class BackofficeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BackofficeService backofficeService;

    @MockBean
    private EniMetadataService eniMetadataService;

    @MockBean
    private PublicContentService publicContentService;

    @MockBean
    private DocumentService documentService;

    @Test
    void dashboardStats_shouldReturnStats() throws Exception {
        when(backofficeService.dashboardStats()).thenReturn(
                new BackofficeDtos.DashboardStats(100, 10, 20, 5, 2, "48h"));

        mockMvc.perform(get("/admin/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCases").value(100))
                .andExpect(jsonPath("$.pendingCases").value(10));
    }

    @Test
    void dashboardReport_shouldReturnReportWithDateRange() throws Exception {
        BackofficeDtos.DashboardReportSummary summary = new BackofficeDtos.DashboardReportSummary(
                100, 10, 20, 50, 2, 95.0, 48.0);
        when(backofficeService.dashboardReport(any(), any())).thenReturn(
                new BackofficeDtos.DashboardReport(summary, List.of(), List.of(), List.of(), List.of()));

        mockMvc.perform(get("/admin/dashboard/report")
                        .param("from", "2026-01-01")
                        .param("to", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalCases").value(100));
    }

    @Test
    void dashboardReport_shouldReturnReportWithoutDates() throws Exception {
        BackofficeDtos.DashboardReportSummary summary = new BackofficeDtos.DashboardReportSummary(
                50, 5, 10, 25, 1, 90.0, 36.0);
        when(backofficeService.dashboardReport(any(), any())).thenReturn(
                new BackofficeDtos.DashboardReport(summary, List.of(), List.of(), List.of(), List.of()));

        mockMvc.perform(get("/admin/dashboard/report"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalCases").value(50));
    }

    @Test
    void analyticsReport_shouldReturnAnalytics() throws Exception {
        BackofficeDtos.DashboardReportSummary summary = new BackofficeDtos.DashboardReportSummary(
                100, 10, 20, 50, 2, 95.0, 48.0);
        when(backofficeService.analyticsReport(any(), any())).thenReturn(
                new TransparencyDtos.AnalyticsReport(summary, List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of()));

        mockMvc.perform(get("/admin/analytics/report")
                        .param("from", "2026-01-01")
                        .param("to", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalCases").value(100));
    }

    @Test
    void pendingTasks_shouldReturnTasks() throws Exception {
        UUID caseId = UUID.randomUUID();
        when(backofficeService.pendingTasks()).thenReturn(List.of(
                new BackofficeDtos.PendingTask("task-1", caseId, "Case 1", "Review", "REVIEW", null, null, null, "normal")
        ));

        mockMvc.perform(get("/admin/tasks/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].caseTitle").value("Case 1"));
    }

    @Test
    void listUsers_shouldReturnUsers() throws Exception {
        UUID userId = UUID.randomUUID();
        when(backofficeService.listUsers()).thenReturn(List.of(
                new BackofficeDtos.BackofficeUser(userId, "admin@test.com", List.of("ROLE_ADMIN"), null, null, true)
        ));

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@test.com"));
    }

    @Test
    void createUser_shouldReturnCreated() throws Exception {
        UUID userId = UUID.randomUUID();
        BackofficeDtos.CreateUserRequest request = new BackofficeDtos.CreateUserRequest("new@test.com", "password", List.of("ROLE_TRAMITADOR"), true);
        when(backofficeService.createUser(any())).thenReturn(
                new BackofficeDtos.BackofficeUser(userId, "new@test.com", List.of("ROLE_TRAMITADOR"), null, null, true));

        mockMvc.perform(post("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new@test.com"));
    }

    @Test
    void updateUser_shouldReturnUpdatedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        BackofficeDtos.UpdateUserRequest request = new BackofficeDtos.UpdateUserRequest("updated@test.com", List.of("ROLE_ADMIN"), false);
        when(backofficeService.updateUser(eq(userId), any())).thenReturn(
                new BackofficeDtos.BackofficeUser(userId, "updated@test.com", List.of("ROLE_ADMIN"), null, null, false));

        mockMvc.perform(put("/admin/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@test.com"));
    }

    @Test
    void updateUserStatus_shouldToggleStatus() throws Exception {
        UUID userId = UUID.randomUUID();
        BackofficeDtos.UserStatusRequest request = new BackofficeDtos.UserStatusRequest(false);
        when(backofficeService.toggleUserStatus(eq(userId), anyBoolean())).thenReturn(
                new BackofficeDtos.BackofficeUser(userId, "user@test.com", List.of(), null, null, false));

        mockMvc.perform(patch("/admin/users/{id}/status", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void listProcedureTypes_shouldReturnProcedures() throws Exception {
        UUID procId = UUID.randomUUID();
        when(backofficeService.listProcedures()).thenReturn(List.of(
                new BackofficeDtos.ManagedProcedure(procId, "Licencias", "Desc", null, "active", "Unit A", 10, null, null, null, List.of(), List.of())
        ));

        mockMvc.perform(get("/admin/procedure-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Licencias"));
    }

    @Test
    void createProcedureType_shouldReturnCreated() throws Exception {
        UUID procId = UUID.randomUUID();
        BackofficeDtos.ProcedureRequest request = new BackofficeDtos.ProcedureRequest(
                "New Procedure", "Description", null, "active", "Unit", 10, null, List.of(), List.of());
        when(backofficeService.createProcedure(any())).thenReturn(
                new BackofficeDtos.ManagedProcedure(procId, "New Procedure", "Description", null, "active", "Unit", 10, null, null, null, List.of(), List.of()));

        mockMvc.perform(post("/admin/procedure-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Procedure"));
    }

    @Test
    void updateProcedureType_shouldReturnUpdated() throws Exception {
        UUID procId = UUID.randomUUID();
        BackofficeDtos.ProcedureRequest request = new BackofficeDtos.ProcedureRequest(
                "Updated", "New Desc", null, "active", "Unit", 15, null, List.of(), List.of());
        when(backofficeService.updateProcedure(eq(procId), any())).thenReturn(
                new BackofficeDtos.ManagedProcedure(procId, "Updated", "New Desc", null, "active", "Unit", 15, null, null, null, List.of(), List.of()));

        mockMvc.perform(put("/admin/procedure-types/{id}", procId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void updateProcedureTypeStatus_shouldToggleStatus() throws Exception {
        UUID procId = UUID.randomUUID();
        when(backofficeService.toggleProcedureStatus(eq(procId), anyString())).thenReturn(
                new BackofficeDtos.ManagedProcedure(procId, "Test", "Desc", null, "inactive", "Unit", 10, null, null, null, List.of(), List.of()));

        mockMvc.perform(patch("/admin/procedure-types/{id}/status", procId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"inactive\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("inactive"));
    }

    @Test
    void listProcedureTypeTranslations_shouldReturnTranslations() throws Exception {
        UUID procId = UUID.randomUUID();
        when(backofficeService.listProcedureTranslations(procId)).thenReturn(List.of(
                new BackofficeDtos.ProcedureTranslation(UUID.randomUUID(), procId, "es-ES", "Titulo", "Desc", "Unit", null, null)
        ));

        mockMvc.perform(get("/admin/procedure-types/{id}/translations", procId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Titulo"));
    }

    @Test
    void upsertProcedureTypeTranslation_shouldReturnTranslation() throws Exception {
        UUID procId = UUID.randomUUID();
        BackofficeDtos.ProcedureTranslationRequest request = new BackofficeDtos.ProcedureTranslationRequest(
                "ca-ES", "Títol", "Descripció", "Unitat");
        when(backofficeService.upsertProcedureTranslation(eq(procId), any())).thenReturn(
                new BackofficeDtos.ProcedureTranslation(UUID.randomUUID(), procId, "ca-ES", "Títol", "Descripció", "Unitat", null, null));

        mockMvc.perform(put("/admin/procedure-types/{id}/translations", procId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Títol"));
    }

    @Test
    void getProcedureEniMetadata_shouldReturnMetadata() throws Exception {
        UUID procId = UUID.randomUUID();
        when(eniMetadataService.getProcedureMetadata(procId)).thenReturn(
                new BackofficeDtos.EniMetadataEntry("procedure", procId, null, Map.of("key", "value")));

        mockMvc.perform(get("/admin/eni/metadata/procedures/{id}", procId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceType").value("procedure"));
    }

    @Test
    void getDocumentEniMetadata_shouldReturnMetadata() throws Exception {
        UUID docId = UUID.randomUUID();
        when(eniMetadataService.getDocumentMetadata(docId)).thenReturn(
                new BackofficeDtos.EniMetadataEntry("document", docId, null, Map.of()));

        mockMvc.perform(get("/admin/eni/metadata/documents/{id}", docId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceType").value("document"));
    }

    // Public content admin endpoints

    @Test
    void listLegislationAdmin_shouldReturnLegislation() throws Exception {
        when(publicContentService.listLegislationAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/admin/public-content/legislation"))
                .andExpect(status().isOk());
    }

    @Test
    void listFaqCategoriesAdmin_shouldReturnCategories() throws Exception {
        when(publicContentService.listFaqCategoriesAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/admin/public-content/faq/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void listCalendarAdmin_shouldReturnCalendar() throws Exception {
        when(publicContentService.listCalendarAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/admin/public-content/calendar"))
                .andExpect(status().isOk());
    }

    @Test
    void listInstitutionalAdmin_shouldReturnInstitutional() throws Exception {
        when(publicContentService.listInstitutionalAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/admin/public-content/institutional"))
                .andExpect(status().isOk());
    }

    @Test
    void listOrganismsAdmin_shouldReturnOrganisms() throws Exception {
        when(publicContentService.listOrganismsAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/admin/public-content/organisms"))
                .andExpect(status().isOk());
    }

    @Test
    void listResourcesAdmin_shouldReturnResources() throws Exception {
        when(publicContentService.listResourcesAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/admin/public-content/resources"))
                .andExpect(status().isOk());
    }

    @Test
    void getThemePaletteAdmin_shouldReturnTheme() throws Exception {
        when(publicContentService.getThemePaletteAdmin()).thenReturn(
                new PublicContentDtos.ThemeCatalog(null, null, null));

        mockMvc.perform(get("/admin/public-content/theme"))
                .andExpect(status().isOk());
    }

    // ===== Legislation CRUD =====

    @Test
    void createLegislation_shouldReturnCreated() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                "es-ES", groupId, "law", "New Law", "Description", LocalDate.of(2026, 1, 1),
                "https://example.com", null, 1, true);
        when(publicContentService.createLegislation(any())).thenReturn(
                new PublicContentDtos.LegislationEntry(groupId, "es-ES", "law", "New Law", "Description",
                        LocalDate.of(2026, 1, 1), "https://example.com", null, 1, true, null, null));

        mockMvc.perform(post("/admin/public-content/legislation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Law"))
                .andExpect(jsonPath("$.type").value("law"));
    }

    @Test
    void updateLegislation_shouldReturnUpdated() throws Exception {
        UUID id = UUID.randomUUID();
        PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                "es-ES", id, "decree", "Updated Law", "New Desc", LocalDate.of(2026, 2, 1),
                null, null, 2, false);
        when(publicContentService.updateLegislation(eq(id), any())).thenReturn(
                new PublicContentDtos.LegislationEntry(id, "es-ES", "decree", "Updated Law", "New Desc",
                        LocalDate.of(2026, 2, 1), null, null, 2, false, null, null));

        mockMvc.perform(put("/admin/public-content/legislation/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Law"));
    }

    @Test
    void updateLegislation_shouldReturnNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                "es-ES", null, "law", "Title", "Desc", null, null, null, 0, true);
        when(publicContentService.updateLegislation(eq(id), any()))
                .thenThrow(new ResourceNotFoundException("PUBLIC_CONTENT", id.toString()));

        mockMvc.perform(put("/admin/public-content/legislation/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PUBLIC_CONTENT-404-NOT_FOUND"));
    }

    @Test
    void deleteLegislation_shouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/admin/public-content/legislation/{id}", id))
                .andExpect(status().isNoContent());
    }

    // ===== FAQ Category CRUD =====

    @Test
    void createFaqCategory_shouldReturnCreated() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.FaqCategoryUpsertRequest request = new PublicContentDtos.FaqCategoryUpsertRequest(
                "es-ES", groupId, "general", "General Questions", 1, true);
        when(publicContentService.createFaqCategory(any())).thenReturn(
                new PublicContentDtos.FaqCategoryEntry(groupId, "es-ES", "general", "General Questions", 1, true, null, null));

        mockMvc.perform(post("/admin/public-content/faq/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryName").value("General Questions"));
    }

    @Test
    void updateFaqCategory_shouldReturnUpdated() throws Exception {
        UUID id = UUID.randomUUID();
        PublicContentDtos.FaqCategoryUpsertRequest request = new PublicContentDtos.FaqCategoryUpsertRequest(
                "ca-ES", id, "tech", "Technical Questions", 2, true);
        when(publicContentService.updateFaqCategory(eq(id), any())).thenReturn(
                new PublicContentDtos.FaqCategoryEntry(id, "ca-ES", "tech", "Technical Questions", 2, true, null, null));

        mockMvc.perform(put("/admin/public-content/faq/categories/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryName").value("Technical Questions"));
    }

    @Test
    void deleteFaqCategory_shouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/admin/public-content/faq/categories/{id}", id))
                .andExpect(status().isNoContent());
    }

    // ===== FAQ CRUD =====

    @Test
    void createFaq_shouldReturnCreated() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.FaqUpsertRequest request = new PublicContentDtos.FaqUpsertRequest(
                "es-ES", groupId, "general", "What is this?", "It is a thing", 1, true);
        when(publicContentService.createFaq(any())).thenReturn(
                new PublicContentDtos.FaqEntry(groupId, "es-ES", "general", "What is this?", "It is a thing", 1, true, null, null));

        mockMvc.perform(post("/admin/public-content/faq")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.question").value("What is this?"))
                .andExpect(jsonPath("$.answer").value("It is a thing"));
    }

    @Test
    void updateFaq_shouldReturnUpdated() throws Exception {
        UUID id = UUID.randomUUID();
        PublicContentDtos.FaqUpsertRequest request = new PublicContentDtos.FaqUpsertRequest(
                "es-ES", id, "general", "Updated question?", "Updated answer", 2, false);
        when(publicContentService.updateFaq(eq(id), any())).thenReturn(
                new PublicContentDtos.FaqEntry(id, "es-ES", "general", "Updated question?", "Updated answer", 2, false, null, null));

        mockMvc.perform(put("/admin/public-content/faq/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("Updated question?"));
    }

    @Test
    void deleteFaq_shouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/admin/public-content/faq/{id}", id))
                .andExpect(status().isNoContent());
    }

    // ===== Theme CRUD =====

    @Test
    void updateTheme_shouldReturnUpdatedTheme() throws Exception {
        List<PublicContentDtos.ThemeVariant> themes = List.of(
                new PublicContentDtos.ThemeVariant("theme-1", "Default", "light",
                        List.of(new PublicContentDtos.ThemeColor("--primary", "#0066cc")), true));
        PublicContentDtos.ThemePaletteUpsertRequest request = new PublicContentDtos.ThemePaletteUpsertRequest(themes, "theme-1");
        when(publicContentService.saveThemePalette(any())).thenReturn(
                new PublicContentDtos.ThemeCatalog(themes, "theme-1", null));

        mockMvc.perform(put("/admin/public-content/theme")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeThemeId").value("theme-1"));
    }

    // ===== Field i18n CRUD =====

    @Test
    void listFieldTranslations_shouldReturnGroupedTranslations() throws Exception {
        UUID procId = UUID.randomUUID();
        BackofficeDtos.FieldI18nEntry fieldEntry = new BackofficeDtos.FieldI18nEntry(
                UUID.randomUUID(), procId, 1, "Personal Data", "fullName", "fullName",
                "es-ES", "Nombre completo", "Introduzca su nombre", List.of(), null);
        when(backofficeService.listFieldTranslations(procId)).thenReturn(List.of(
                new BackofficeDtos.FieldI18nGroup(1, "Personal Data", "FORM", List.of(fieldEntry))));

        mockMvc.perform(get("/admin/procedure-types/{id}/field-i18n", procId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].taskTitle").value("Personal Data"))
                .andExpect(jsonPath("$[0].fields[0].name").value("Nombre completo"));
    }

    @Test
    void listFieldTranslations_shouldReturnNotFound() throws Exception {
        UUID procId = UUID.randomUUID();
        when(backofficeService.listFieldTranslations(procId))
                .thenThrow(new ResourceNotFoundException("PROCEDURE_TYPE", procId.toString()));

        mockMvc.perform(get("/admin/procedure-types/{id}/field-i18n", procId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE_TYPE-404-NOT_FOUND"));
    }

    @Test
    void upsertFieldTranslation_shouldReturnEntry() throws Exception {
        UUID procId = UUID.randomUUID();
        BackofficeDtos.FieldI18nUpsertRequest request = new BackofficeDtos.FieldI18nUpsertRequest(
                1, "fullName", "ca-ES", "Nom complet", "Introduïu el nom", null);
        when(backofficeService.upsertFieldTranslation(eq(procId), any())).thenReturn(
                new BackofficeDtos.FieldI18nEntry(
                        UUID.randomUUID(), procId, 1, "Personal Data", "fullName", "fullName",
                        "ca-ES", "Nom complet", "Introduïu el nom", List.of(), null));

        mockMvc.perform(put("/admin/procedure-types/{id}/field-i18n", procId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nom complet"))
                .andExpect(jsonPath("$.locale").value("ca-ES"));
    }

    @Test
    void upsertFieldTranslation_shouldReturnBadRequestOnMissingFields() throws Exception {
        UUID procId = UUID.randomUUID();
        // Missing fieldId and locale — triggers ValidationException in service
        BackofficeDtos.FieldI18nUpsertRequest request = new BackofficeDtos.FieldI18nUpsertRequest(
                1, null, null, "Some name", null, null);
        when(backofficeService.upsertFieldTranslation(eq(procId), any()))
                .thenThrow(new es.tfg.records.application.exception.ValidationException(
                        List.of(new es.tfg.records.application.exception.ValidationException.ValidationError(
                                "request", "locale, name, and fieldId are required"))));

        mockMvc.perform(put("/admin/procedure-types/{id}/field-i18n", procId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-VALIDATION_ERROR"));
    }

    @Test
    void deleteFieldTranslation_shouldReturnNoContent() throws Exception {
        UUID procId = UUID.randomUUID();

        mockMvc.perform(delete("/admin/procedure-types/{id}/field-i18n/{fieldId}/{locale}",
                        procId, "fullName", "ca-ES"))
                .andExpect(status().isNoContent());
    }
}
