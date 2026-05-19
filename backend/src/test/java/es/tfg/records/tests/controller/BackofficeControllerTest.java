package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.dto.PublicContentDtos;
import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.application.service.BackofficeService;
import es.tfg.records.application.service.EniMetadataService;
import es.tfg.records.application.service.PublicContentService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.BackofficeController;
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
}
