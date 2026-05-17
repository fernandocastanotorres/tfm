package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.BackofficeDtos;
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
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BackofficeController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class BackofficeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BackofficeService backofficeService;

    @MockBean
    private EniMetadataService eniMetadataService;

    @MockBean
    private PublicContentService publicContentService;

    @Test
    void dashboardReport_shouldReturn200WithPayload() throws Exception {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);

        BackofficeDtos.DashboardReport report = new BackofficeDtos.DashboardReport(
                new BackofficeDtos.DashboardReportSummary(20, 5, 7, 8, 2, 87.5, 36.25),
                List.of(new BackofficeDtos.DashboardDistributionItem("SUBMITTED", "Presentado", 5)),
                List.of(new BackofficeDtos.DashboardDistributionItem("Licencia", "Licencia", 9)),
                List.of(new BackofficeDtos.DashboardDistributionItem("Urbanismo", "Urbanismo", 6)),
                List.of(new BackofficeDtos.DashboardDailyTrendPoint(LocalDate.of(2026, 1, 10), 3, 2))
        );

        when(backofficeService.dashboardReport(eq(from), eq(to))).thenReturn(report);

        mockMvc.perform(get("/admin/dashboard/report")
                        .queryParam("from", "2026-01-01")
                        .queryParam("to", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.totalCases").value(20))
                .andExpect(jsonPath("$.summary.slaComplianceRate").value(87.5))
                .andExpect(jsonPath("$.byStatus[0].key").value("SUBMITTED"))
                .andExpect(jsonPath("$.dailyTrend[0].createdCases").value(3));
    }

    @Test
    void getProcedureEniMetadata_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        when(eniMetadataService.getProcedureMetadata(eq(id)))
                .thenReturn(new BackofficeDtos.EniMetadataEntry("PROCEDURE", id, Instant.now(), Map.of("status", "SUBMITTED")));

        mockMvc.perform(get("/admin/eni/metadata/procedures/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceType").value("PROCEDURE"))
                .andExpect(jsonPath("$.metadata.status").value("SUBMITTED"));
    }

    @Test
    void getDocumentEniMetadata_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        when(eniMetadataService.getDocumentMetadata(eq(id)))
                .thenReturn(new BackofficeDtos.EniMetadataEntry("DOCUMENT", id, Instant.now(), Map.of("mimeType", "application/pdf")));

        mockMvc.perform(get("/admin/eni/metadata/documents/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceType").value("DOCUMENT"))
                .andExpect(jsonPath("$.metadata.mimeType").value("application/pdf"));
    }
}
