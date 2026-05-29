package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.service.TransparencyReportService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.TransparencyController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransparencyController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class TransparencyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TransparencyReportService transparencyReportService;

    // ========================================================================
    // POST /admin/transparency/reports — createReport
    // ========================================================================

    @Test
    void createReport_shouldReturn201() throws Exception {
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        MockMultipartFile file = new MockMultipartFile(
                "file", "report-2025.pdf", "application/pdf", "%PDF-1.4 content".getBytes());
        TransparencyDtos.TransparencyReportDto dto = new TransparencyDtos.TransparencyReportDto(
                reportId, "Annual Report 2025", 2025, "Description",
                "transparency/stored-path.pdf", "report-2025.pdf", 1024L,
                "application/pdf", true, 0, now, now);

        when(transparencyReportService.createReport(
                eq("Annual Report 2025"), eq(2025), eq("Description"),
                any(), eq(0), eq(true))).thenReturn(dto);

        mockMvc.perform(multipart("/admin/transparency/reports")
                        .file(file)
                        .param("title", "Annual Report 2025")
                        .param("year", "2025")
                        .param("description", "Description")
                        .param("published", "true")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(reportId.toString()))
                .andExpect(jsonPath("$.title").value("Annual Report 2025"))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.published").value(true))
                .andExpect(jsonPath("$.fileName").value("report-2025.pdf"));
    }

    @Test
    void createReport_withMinimalFields_shouldReturn201() throws Exception {
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        MockMultipartFile file = new MockMultipartFile(
                "file", "minimal.pdf", "application/pdf", "%PDF".getBytes());
        TransparencyDtos.TransparencyReportDto dto = new TransparencyDtos.TransparencyReportDto(
                reportId, "Minimal Report", 2024, null,
                "transparency/min.pdf", "minimal.pdf", 512L,
                "application/pdf", false, 0, now, now);

        when(transparencyReportService.createReport(
                eq("Minimal Report"), eq(2024), eq(null),
                any(), eq(0), eq(false))).thenReturn(dto);

        mockMvc.perform(multipart("/admin/transparency/reports")
                        .file(file)
                        .param("title", "Minimal Report")
                        .param("year", "2024")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(reportId.toString()))
                .andExpect(jsonPath("$.published").value(false));
    }

    @Test
    void createReport_emptyFile_shouldReturn409() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        when(transparencyReportService.createReport(
                anyString(), anyInt(), any(), any(), anyInt(), anyBoolean()))
                .thenThrow(new ConflictException("TRANSPARENCY", "EMPTY_FILE"));

        mockMvc.perform(multipart("/admin/transparency/reports")
                        .file(file)
                        .param("title", "Test")
                        .param("year", "2025")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-409-STATE_INVALID"));
    }

    @Test
    void createReport_invalidFileType_shouldReturn409() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.txt", "text/plain", "not a pdf".getBytes());

        when(transparencyReportService.createReport(
                anyString(), anyInt(), any(), any(), anyInt(), anyBoolean()))
                .thenThrow(new ConflictException("TRANSPARENCY", "INVALID_FILE_TYPE"));

        mockMvc.perform(multipart("/admin/transparency/reports")
                        .file(file)
                        .param("title", "Test")
                        .param("year", "2025")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-409-STATE_INVALID"));
    }

    @Test
    void createReport_fileTooLarge_shouldReturn409() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "huge.pdf", "application/pdf", new byte[1024]);

        when(transparencyReportService.createReport(
                anyString(), anyInt(), any(), any(), anyInt(), anyBoolean()))
                .thenThrow(new ConflictException("TRANSPARENCY", "FILE_TOO_LARGE"));

        mockMvc.perform(multipart("/admin/transparency/reports")
                        .file(file)
                        .param("title", "Test")
                        .param("year", "2025")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-409-STATE_INVALID"))
                .andExpect(jsonPath("$.message").value("Conflict on TRANSPARENCY: FILE_TOO_LARGE"));
    }

    // ========================================================================
    // GET /admin/transparency/reports — listReports
    // ========================================================================

    @Test
    void listReports_shouldReturn200() throws Exception {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        Instant now = Instant.now();
        TransparencyDtos.TransparencyReportDto report1 = new TransparencyDtos.TransparencyReportDto(
                id1, "Report A", 2025, "First", "path/a.pdf", "a.pdf", 100L,
                "application/pdf", true, 0, now, now);
        TransparencyDtos.TransparencyReportDto report2 = new TransparencyDtos.TransparencyReportDto(
                id2, "Report B", 2024, "Second", "path/b.pdf", "b.pdf", 200L,
                "application/pdf", false, 1, now, now);

        when(transparencyReportService.listAllReports()).thenReturn(List.of(report1, report2));

        mockMvc.perform(get("/admin/transparency/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Report A"))
                .andExpect(jsonPath("$[1].title").value("Report B"))
                .andExpect(jsonPath("$[0].id").value(id1.toString()))
                .andExpect(jsonPath("$[1].id").value(id2.toString()));
    }

    @Test
    void listReports_emptyList_shouldReturn200WithEmptyArray() throws Exception {
        when(transparencyReportService.listAllReports()).thenReturn(List.of());

        mockMvc.perform(get("/admin/transparency/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ========================================================================
    // PUT /admin/transparency/reports/{id} — updateReport
    // ========================================================================

    @Test
    void updateReport_shouldReturn200() throws Exception {
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                "Updated Title", 2026, "New description", 5, true);
        TransparencyDtos.TransparencyReportDto updated = new TransparencyDtos.TransparencyReportDto(
                reportId, "Updated Title", 2026, "New description",
                "transparency/path.pdf", "original.pdf", 1024L,
                "application/pdf", true, 5, now, now);

        when(transparencyReportService.updateReport(eq(reportId), eq(request))).thenReturn(updated);

        mockMvc.perform(put("/admin/transparency/reports/{id}", reportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reportId.toString()))
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.year").value(2026))
                .andExpect(jsonPath("$.sortOrder").value(5))
                .andExpect(jsonPath("$.published").value(true));
    }

    @Test
    void updateReport_partialUpdate_shouldReturn200() throws Exception {
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                null, null, null, null, true);
        TransparencyDtos.TransparencyReportDto updated = new TransparencyDtos.TransparencyReportDto(
                reportId, "Original Title", 2025, "Original desc",
                "transparency/path.pdf", "original.pdf", 1024L,
                "application/pdf", true, 0, now, now);

        when(transparencyReportService.updateReport(eq(reportId), eq(request))).thenReturn(updated);

        mockMvc.perform(put("/admin/transparency/reports/{id}", reportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.published").value(true))
                .andExpect(jsonPath("$.title").value("Original Title"));
    }

    @Test
    void updateReport_notFound_shouldReturn404() throws Exception {
        UUID reportId = UUID.randomUUID();
        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                "Title", null, null, null, null);

        when(transparencyReportService.updateReport(eq(reportId), eq(request)))
                .thenThrow(new ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND"));

        mockMvc.perform(put("/admin/transparency/reports/{id}", reportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-404-NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("TRANSPARENCY not found with identifier: REPORT_NOT_FOUND"));
    }

    @Test
    void updateReport_malformedBody_shouldReturn400() throws Exception {
        UUID reportId = UUID.randomUUID();

        mockMvc.perform(put("/admin/transparency/reports/{id}", reportId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-BAD_REQUEST"));
    }

    // ========================================================================
    // POST /admin/transparency/reports/{id}/file — replaceFile
    // ========================================================================

    @Test
    void replaceFile_shouldReturn200() throws Exception {
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        MockMultipartFile file = new MockMultipartFile(
                "file", "new-report.pdf", "application/pdf", "%PDF-1.5".getBytes());
        TransparencyDtos.TransparencyReportDto updated = new TransparencyDtos.TransparencyReportDto(
                reportId, "Report", 2025, "Desc",
                "transparency/new-path.pdf", "new-report.pdf", 2048L,
                "application/pdf", true, 0, now, now);

        when(transparencyReportService.replaceFile(eq(reportId), any())).thenReturn(updated);

        mockMvc.perform(multipart("/admin/transparency/reports/{id}/file", reportId)
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reportId.toString()))
                .andExpect(jsonPath("$.fileName").value("new-report.pdf"))
                .andExpect(jsonPath("$.fileSize").value(2048));
    }

    @Test
    void replaceFile_notFound_shouldReturn404() throws Exception {
        UUID reportId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file", "new.pdf", "application/pdf", "%PDF".getBytes());

        when(transparencyReportService.replaceFile(eq(reportId), any()))
                .thenThrow(new ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND"));

        mockMvc.perform(multipart("/admin/transparency/reports/{id}/file", reportId)
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-404-NOT_FOUND"));
    }

    @Test
    void replaceFile_emptyFile_shouldReturn409() throws Exception {
        UUID reportId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        when(transparencyReportService.replaceFile(eq(reportId), any()))
                .thenThrow(new ConflictException("TRANSPARENCY", "EMPTY_FILE"));

        mockMvc.perform(multipart("/admin/transparency/reports/{id}/file", reportId)
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-409-STATE_INVALID"));
    }

    @Test
    void replaceFile_invalidType_shouldReturn409() throws Exception {
        UUID reportId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file", "image.png", "image/png", new byte[10]);

        when(transparencyReportService.replaceFile(eq(reportId), any()))
                .thenThrow(new ConflictException("TRANSPARENCY", "INVALID_FILE_TYPE"));

        mockMvc.perform(multipart("/admin/transparency/reports/{id}/file", reportId)
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-409-STATE_INVALID"));
    }

    // ========================================================================
    // DELETE /admin/transparency/reports/{id} — deleteReport
    // ========================================================================

    @Test
    void deleteReport_shouldReturn204() throws Exception {
        UUID reportId = UUID.randomUUID();
        doNothing().when(transparencyReportService).deleteReport(eq(reportId));

        mockMvc.perform(delete("/admin/transparency/reports/{id}", reportId))
                .andExpect(status().isNoContent());

        verify(transparencyReportService).deleteReport(eq(reportId));
    }

    @Test
    void deleteReport_notFound_shouldReturn404() throws Exception {
        UUID reportId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND"))
                .when(transparencyReportService).deleteReport(eq(reportId));

        mockMvc.perform(delete("/admin/transparency/reports/{id}", reportId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TRANSPARENCY-404-NOT_FOUND"));
    }

    // ========================================================================
    // GET /admin/transparency/reports/{id}/download — downloadReport
    // ========================================================================

    @Test
    void downloadReport_shouldReturn200WithPdfAttachment() throws Exception {
        UUID reportId = UUID.randomUUID();
        Instant now = Instant.now();
        TransparencyDtos.TransparencyReportDto dto = new TransparencyDtos.TransparencyReportDto(
                reportId, "Annual Report", 2025, "Desc",
                "transparency/report.pdf", "annual-2025.pdf", 5000L,
                "application/pdf", true, 0, now, now);
        byte[] pdfContent = "%PDF-1.4 binary content".getBytes();

        when(transparencyReportService.listAllReports()).thenReturn(List.of(dto));
        when(transparencyReportService.downloadReport(eq(reportId)))
                .thenReturn(new ByteArrayInputStream(pdfContent));

        mockMvc.perform(get("/admin/transparency/reports/{id}/download", reportId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"annual-2025.pdf\""))
                .andExpect(content().bytes(pdfContent));
    }

    @Test
    void downloadReport_notFound_shouldReturn404() throws Exception {
        UUID reportId = UUID.randomUUID();

        when(transparencyReportService.listAllReports()).thenReturn(List.of());

        mockMvc.perform(get("/admin/transparency/reports/{id}/download", reportId))
                .andExpect(status().isNotFound());
    }

    @Test
    void downloadReport_differentId_shouldReturn404() throws Exception {
        UUID existingId = UUID.randomUUID();
        UUID requestedId = UUID.randomUUID();
        Instant now = Instant.now();
        TransparencyDtos.TransparencyReportDto dto = new TransparencyDtos.TransparencyReportDto(
                existingId, "Other Report", 2025, "Desc",
                "transparency/other.pdf", "other.pdf", 1000L,
                "application/pdf", true, 0, now, now);

        when(transparencyReportService.listAllReports()).thenReturn(List.of(dto));

        mockMvc.perform(get("/admin/transparency/reports/{id}/download", requestedId))
                .andExpect(status().isNotFound());
    }
}
