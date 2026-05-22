package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.dto.CaseStatusResponse;
import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.dto.PagedResponse;
import es.tfg.records.application.service.BackofficeService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.AdminCaseController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminCaseController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AdminCaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BackofficeService backofficeService;

    @Test
    void updateCaseStatus_shouldReturn200() throws Exception {
        UUID caseId = UUID.randomUUID();
        when(backofficeService.updateCaseStatus(eq(caseId), eq("APPROVED")))
                .thenReturn(new CaseStatusResponse(caseId, "APPROVED", Instant.now(), null));

        mockMvc.perform(patch("/admin/procedures/{id}/status", caseId)
                        .queryParam("status", "APPROVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    // ===== GET /admin/procedures — listCases =====

    @Test
    void listCases_shouldReturn200WithDefaultParams() throws Exception {
        UUID caseId = UUID.randomUUID();
        var item = new BackofficeDtos.AdminCaseItem(
                caseId, "Licencia", "SUBMITTED", Instant.now(), Instant.now(),
                "Mi solicitud", "Descripcion", "Unidad1", null, "user@test.com",
                "Revision de documentacion", "normal");
        var paged = new PagedResponse<>(List.of(item), 0, 10, 1, 1);
        when(backofficeService.listCases(0, 10, null)).thenReturn(paged);

        mockMvc.perform(get("/admin/procedures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(caseId.toString()))
                .andExpect(jsonPath("$.items[0].procedureType").value("Licencia"))
                .andExpect(jsonPath("$.items[0].status").value("SUBMITTED"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void listCases_shouldReturn200WithPaginationAndStatusFilter() throws Exception {
        var paged = new PagedResponse<BackofficeDtos.AdminCaseItem>(List.of(), 2, 5, 0, 0);
        when(backofficeService.listCases(2, 5, "APPROVED")).thenReturn(paged);

        mockMvc.perform(get("/admin/procedures")
                        .param("page", "2")
                        .param("size", "5")
                        .param("status", "APPROVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(5));
    }

    // ===== GET /admin/procedures/{id} — getCaseDetail =====

    @Test
    void getCaseDetail_shouldReturn200() throws Exception {
        UUID caseId = UUID.randomUUID();
        var detail = new BackofficeDtos.AdminCaseDetail(
                caseId, "Licencia", "IN_REVIEW", Instant.now(), Instant.now(),
                "Mi solicitud", "Descripcion", "Resolucion administrativa",
                "Unidad1", null, "user@test.com", "user@test.com",
                List.of(), List.of(), null);
        when(backofficeService.getCaseDetail(eq(caseId))).thenReturn(detail);

        mockMvc.perform(get("/admin/procedures/{id}", caseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.procedureType").value("Licencia"))
                .andExpect(jsonPath("$.status").value("IN_REVIEW"))
                .andExpect(jsonPath("$.title").value("Mi solicitud"))
                .andExpect(jsonPath("$.currentTask").value("Resolucion administrativa"));
    }

    @Test
    void getCaseDetail_shouldReturn404WhenNotFound() throws Exception {
        UUID caseId = UUID.randomUUID();
        when(backofficeService.getCaseDetail(eq(caseId)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROC", caseId.toString()));

        mockMvc.perform(get("/admin/procedures/{id}", caseId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROC-404-NOT_FOUND"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.path").value("/admin/procedures/" + caseId));
    }

    @Test
    void getCaseWorkflowGraph_shouldReturn200() throws Exception {
        UUID caseId = UUID.randomUUID();
        var graph = new BackofficeDtos.CaseWorkflowGraph(
                caseId,
                "IN_REVIEW",
                List.of(
                        new BackofficeDtos.CaseWorkflowNode("SUBMITTED", "Presentado", "visited", 1, true, false, false),
                        new BackofficeDtos.CaseWorkflowNode("IN_REVIEW", "En revision", "current", 2, true, true, false)
                ),
                List.of(new BackofficeDtos.CaseWorkflowTransition("SUBMITTED", "IN_REVIEW", null, true, false))
        );
        when(backofficeService.getCaseWorkflowGraph(eq(caseId))).thenReturn(graph);

        mockMvc.perform(get("/admin/procedures/{id}/workflow-graph", caseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(caseId.toString()))
                .andExpect(jsonPath("$.currentStatus").value("IN_REVIEW"))
                .andExpect(jsonPath("$.nodes.length()").value(2));
    }

    // ===== POST /admin/procedures/{id}/tasks/{taskId}/resolve — resolveTask =====

    @Test
    void resolveTask_shouldReturn200() throws Exception {
        UUID caseId = UUID.randomUUID();
        String taskId = "task-123";
        String body = """
                {
                  "action": "approve",
                  "notes": "All documents verified"
                }
                """;
        var response = new CaseStatusResponse(caseId, "APPROVED", Instant.now(), null);
        when(backofficeService.resolveTask(eq(caseId), any(BackofficeDtos.TaskResolutionRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/admin/procedures/{id}/tasks/{taskId}/resolve", caseId, taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void resolveTask_shouldReturn404WhenCaseNotFound() throws Exception {
        UUID caseId = UUID.randomUUID();
        String taskId = "task-123";
        String body = "{\"action\": \"approve\"}";
        when(backofficeService.resolveTask(eq(caseId), any(BackofficeDtos.TaskResolutionRequest.class)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROC", caseId.toString()));

        mockMvc.perform(post("/admin/procedures/{id}/tasks/{taskId}/resolve", caseId, taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROC-404-NOT_FOUND"));
    }

    @Test
    void resolveTask_shouldReturn400WhenBodyIsMalformed() throws Exception {
        UUID caseId = UUID.randomUUID();
        String taskId = "task-123";

        mockMvc.perform(post("/admin/procedures/{id}/tasks/{taskId}/resolve", caseId, taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("not valid json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SYS-400-BAD_REQUEST"));
    }
}
