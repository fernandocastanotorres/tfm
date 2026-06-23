package es.tfm.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfm.records.application.dto.PublicContentDtos;
import es.tfm.records.application.dto.TransparencyDtos;
import es.tfm.records.application.service.PublicContentService;
import es.tfm.records.application.service.TransparencyMetricsService;
import es.tfm.records.application.service.TransparencyReportService;
import es.tfm.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfm.records.entrypoints.controller.PublicContentController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicContentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PublicContentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PublicContentService publicContentService;

    @MockitoBean
    private TransparencyReportService transparencyReportService;

    @MockitoBean
    private TransparencyMetricsService transparencyMetricsService;

    // ==================== LEGISLATION ====================

    @Test
    void listLegislation_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.LegislationEntry entry = new PublicContentDtos.LegislationEntry(
                groupId, "es-ES", "law", "Test Law", "Description",
                LocalDate.of(2024, 1, 15), "https://example.com", null, 1, true,
                Instant.now(), Instant.now());
        when(publicContentService.listPublicLegislation(null)).thenReturn(List.of(entry));

        mockMvc.perform(get("/citizen/public-content/legislation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].title").value("Test Law"))
                .andExpect(jsonPath("$[0].type").value("law"));
    }

    @Test
    void listLegislation_shouldFilterByType() throws Exception {
        when(publicContentService.listPublicLegislation(eq("organic"))).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/legislation")
                        .param("type", "organic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listLegislation_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicLegislation(null)).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/legislation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listLegislation_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicLegislation(null)).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/legislation"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== FAQ CATEGORIES ====================

    @Test
    void listFaqCategories_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.FaqCategoryEntry category = new PublicContentDtos.FaqCategoryEntry(
                groupId, "es-ES", "general", "General Questions", 1, true,
                Instant.now(), Instant.now());
        when(publicContentService.listPublicFaqCategories()).thenReturn(List.of(category));

        mockMvc.perform(get("/citizen/public-content/faq/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].categoryName").value("General Questions"))
                .andExpect(jsonPath("$[0].categoryCode").value("general"));
    }

    @Test
    void listFaqCategories_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicFaqCategories()).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/faq/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listFaqCategories_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicFaqCategories()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/faq/categories"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== FAQ ====================

    @Test
    void listFaq_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.FaqEntry faq = new PublicContentDtos.FaqEntry(
                groupId, "es-ES", "general", "What is this?", "This is the answer",
                1, true, Instant.now(), Instant.now());
        when(publicContentService.listPublicFaq(null, null)).thenReturn(List.of(faq));

        mockMvc.perform(get("/citizen/public-content/faq"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].question").value("What is this?"))
                .andExpect(jsonPath("$[0].answer").value("This is the answer"));
    }

    @Test
    void listFaq_shouldFilterByCategoryAndQuery() throws Exception {
        when(publicContentService.listPublicFaq(eq("general"), eq("search"))).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/faq")
                        .param("category", "general")
                        .param("q", "search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listFaq_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicFaq(null, null)).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/faq"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listFaq_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicFaq(null, null)).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/faq"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== CALENDAR ====================

    @Test
    void listCalendar_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.CalendarEntry entry = new PublicContentDtos.CalendarEntry(
                groupId, "es-ES", "deadline", "Tax Deadline", "Submit by date",
                LocalDate.of(2024, 6, 30), "Tax Procedure", 1, true,
                Instant.now(), Instant.now());
        when(publicContentService.listPublicCalendar(null, null)).thenReturn(List.of(entry));

        mockMvc.perform(get("/citizen/public-content/calendar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].title").value("Tax Deadline"))
                .andExpect(jsonPath("$[0].type").value("deadline"));
    }

    @Test
    void listCalendar_shouldFilterByTypeAndLimit() throws Exception {
        when(publicContentService.listPublicCalendar(eq("event"), eq(5))).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/calendar")
                        .param("type", "event")
                        .param("upcomingLimit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listCalendar_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicCalendar(null, null)).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/calendar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listCalendar_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicCalendar(null, null)).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/calendar"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== INSTITUTIONAL ====================

    @Test
    void listInstitutional_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.InstitutionalEntry entry = new PublicContentDtos.InstitutionalEntry(
                groupId, "es-ES", "about", "About Us", "Content here", "icon-info",
                1, true, Instant.now(), Instant.now());
        when(publicContentService.listPublicInstitutional()).thenReturn(List.of(entry));

        mockMvc.perform(get("/citizen/public-content/institutional"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].title").value("About Us"))
                .andExpect(jsonPath("$[0].sectionCode").value("about"));
    }

    @Test
    void listInstitutional_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicInstitutional()).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/institutional"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listInstitutional_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicInstitutional()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/institutional"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== ORGANISMS ====================

    @Test
    void listOrganisms_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.OrganismEntry organism = new PublicContentDtos.OrganismEntry(
                groupId, "es-ES", "gov", "Ministry of Finance", "Description",
                "+34 900 000 000", "info@ministry.es", "Main Street 1",
                "https://ministry.es", 1, true, Instant.now(), Instant.now());
        when(publicContentService.listPublicOrganisms(null, null)).thenReturn(List.of(organism));

        mockMvc.perform(get("/citizen/public-content/organisms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].name").value("Ministry of Finance"))
                .andExpect(jsonPath("$[0].categoryCode").value("gov"));
    }

    @Test
    void listOrganisms_shouldFilterByCategoryAndQuery() throws Exception {
        when(publicContentService.listPublicOrganisms(eq("health"), eq("hospital"))).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/organisms")
                        .param("category", "health")
                        .param("q", "hospital"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listOrganisms_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicOrganisms(null, null)).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/organisms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listOrganisms_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicOrganisms(null, null)).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/organisms"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== RESOURCES ====================

    @Test
    void listResources_shouldReturn200WithData() throws Exception {
        UUID groupId = UUID.randomUUID();
        PublicContentDtos.ResourceEntry resource = new PublicContentDtos.ResourceEntry(
                groupId, "es-ES", "guide", "User Guide", "Description",
                "Content", "https://example.com/guide", 1, true,
                Instant.now(), Instant.now());
        when(publicContentService.listPublicResources(null, null)).thenReturn(List.of(resource));

        mockMvc.perform(get("/citizen/public-content/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(groupId.toString()))
                .andExpect(jsonPath("$[0].title").value("User Guide"))
                .andExpect(jsonPath("$[0].resourceType").value("guide"));
    }

    @Test
    void listResources_shouldFilterByTypeAndQuery() throws Exception {
        when(publicContentService.listPublicResources(eq("form"), eq("application"))).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/resources")
                        .param("type", "form")
                        .param("q", "application"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listResources_shouldReturnEmptyList() throws Exception {
        when(publicContentService.listPublicResources(null, null)).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listResources_shouldReturn500OnError() throws Exception {
        when(publicContentService.listPublicResources(null, null)).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/resources"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== THEME ====================

    @Test
    void getThemePalette_shouldReturn200WithData() throws Exception {
        List<PublicContentDtos.ThemeColor> colors = List.of(
                new PublicContentDtos.ThemeColor("--primary", "#3b82f6"),
                new PublicContentDtos.ThemeColor("--secondary", "#6366f1"));
        Instant updatedAt = Instant.now();
        PublicContentDtos.ThemePalette palette = new PublicContentDtos.ThemePalette(colors, updatedAt);
        when(publicContentService.getPublicThemePalette()).thenReturn(palette);

        mockMvc.perform(get("/citizen/public-content/theme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colors").isArray())
                .andExpect(jsonPath("$.colors.length()").value(2))
                .andExpect(jsonPath("$.colors[0].token").value("--primary"))
                .andExpect(jsonPath("$.colors[0].value").value("#3b82f6"))
                .andExpect(jsonPath("$.colors[1].token").value("--secondary"))
                .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void getThemePalette_shouldReturnEmptyColors() throws Exception {
        PublicContentDtos.ThemePalette palette = new PublicContentDtos.ThemePalette(List.of(), Instant.now());
        when(publicContentService.getPublicThemePalette()).thenReturn(palette);

        mockMvc.perform(get("/citizen/public-content/theme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colors").isArray())
                .andExpect(jsonPath("$.colors").isEmpty())
                .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void getThemePalette_shouldReturn500OnError() throws Exception {
        when(publicContentService.getPublicThemePalette()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/theme"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== TRANSPARENCY REPORTS ====================

    @Test
    void listPublishedReports_shouldReturn200WithData() throws Exception {
        UUID reportId = UUID.randomUUID();
        TransparencyDtos.PublicTransparencyReportDto report = new TransparencyDtos.PublicTransparencyReportDto(
                reportId, "Annual Report 2024", 2024, "Annual transparency report",
                "report-2024.pdf", 1024000L, Instant.now());
        when(transparencyReportService.listPublishedReports()).thenReturn(List.of(report));

        mockMvc.perform(get("/citizen/public-content/transparency/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(reportId.toString()))
                .andExpect(jsonPath("$[0].title").value("Annual Report 2024"))
                .andExpect(jsonPath("$[0].year").value(2024))
                .andExpect(jsonPath("$[0].fileName").value("report-2024.pdf"));
    }

    @Test
    void listPublishedReports_shouldReturnEmptyList() throws Exception {
        when(transparencyReportService.listPublishedReports()).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/transparency/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void listPublishedReports_shouldReturn500OnError() throws Exception {
        when(transparencyReportService.listPublishedReports()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/transparency/reports"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== TRANSPARENCY REPORT DOWNLOAD ====================

    @Test
    void downloadPublishedReport_shouldReturn200WithPdf() throws Exception {
        UUID reportId = UUID.randomUUID();
        String fileName = "report-2024.pdf";
        TransparencyDtos.PublicTransparencyReportDto report = new TransparencyDtos.PublicTransparencyReportDto(
                reportId, "Annual Report 2024", 2024, "Description", fileName, 1024000L, Instant.now());
        byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF header
        InputStream inputStream = new ByteArrayInputStream(pdfContent);

        when(transparencyReportService.listPublishedReports()).thenReturn(List.of(report));
        when(transparencyReportService.downloadPublishedReport(reportId)).thenReturn(inputStream);

        mockMvc.perform(get("/citizen/public-content/transparency/reports/{id}/download", reportId))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"" + fileName + "\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void downloadPublishedReport_shouldReturn404WhenNotFound() throws Exception {
        UUID reportId = UUID.randomUUID();
        when(transparencyReportService.listPublishedReports()).thenReturn(List.of());

        mockMvc.perform(get("/citizen/public-content/transparency/reports/{id}/download", reportId))
                .andExpect(status().isNotFound());
    }

    @Test
    void downloadPublishedReport_shouldReturn500OnError() throws Exception {
        UUID reportId = UUID.randomUUID();
        when(transparencyReportService.listPublishedReports()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/transparency/reports/{id}/download", reportId))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }

    // ==================== TRANSPARENCY METRICS ====================

    @Test
    void getMetrics_shouldReturn200WithData() throws Exception {
        TransparencyDtos.TransparencyMetricsDto metrics = new TransparencyDtos.TransparencyMetricsDto(
                150L, 120L, 30L, 5.5, 92.5, 100.0);
        when(transparencyMetricsService.computeMetrics()).thenReturn(metrics);

        mockMvc.perform(get("/citizen/public-content/transparency/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProcedures").value(150))
                .andExpect(jsonPath("$.resolvedProcedures").value(120))
                .andExpect(jsonPath("$.pendingProcedures").value(30))
                .andExpect(jsonPath("$.avgResolutionDays").value(5.5))
                .andExpect(jsonPath("$.slaComplianceRate").value(92.5))
                .andExpect(jsonPath("$.digitalProceduresPct").value(100.0));
    }

    @Test
    void getMetrics_shouldReturnZeroMetrics() throws Exception {
        TransparencyDtos.TransparencyMetricsDto metrics = new TransparencyDtos.TransparencyMetricsDto(
                0L, 0L, 0L, 0.0, 0.0, 100.0);
        when(transparencyMetricsService.computeMetrics()).thenReturn(metrics);

        mockMvc.perform(get("/citizen/public-content/transparency/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProcedures").value(0))
                .andExpect(jsonPath("$.resolvedProcedures").value(0))
                .andExpect(jsonPath("$.pendingProcedures").value(0));
    }

    @Test
    void getMetrics_shouldReturn500OnError() throws Exception {
        when(transparencyMetricsService.computeMetrics()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/citizen/public-content/transparency/metrics"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("SYS-500-INTERNAL_ERROR"));
    }
}
