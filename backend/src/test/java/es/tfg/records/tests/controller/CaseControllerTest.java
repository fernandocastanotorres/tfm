package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.*;
import es.tfg.records.application.service.CaseService;
import es.tfg.records.application.service.EniPackagerService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.CaseController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CaseController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CaseService caseService;

    @MockBean
    private EniPackagerService eniPackagerService;

    @Test
    void listCases_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        CaseItem item = new CaseItem(UUID.randomUUID(), "Test", "DRAFT", Instant.now(), null, "Cat", "Unit", null);
        PagedResponse<CaseItem> response = new PagedResponse<>(List.of(item), 0, 10, 1, 1);
        when(caseService.listCases(eq(ownerId), eq(0), eq(10), eq(null))).thenReturn(response);

        mockMvc.perform(get("/citizen/procedures")
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].title").value("Test"));
    }

    @Test
    void createCase_shouldReturn201() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        CaseItem created = new CaseItem(UUID.randomUUID(), "New Case", "DRAFT", Instant.now(), null, "Cat", "Unit", null);
        when(caseService.createCase(eq(ownerId), any(CreateCaseRequest.class))).thenReturn(created);

        CreateCaseRequest req = new CreateCaseRequest(procedureTypeId.toString(), Map.of("field", "value"), null);

        mockMvc.perform(post("/citizen/procedures")
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Case"));
    }

    // ========================================================================
    // GET /{id} — getCaseDetail
    // ========================================================================

    @Test
    void getCaseDetail_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        CaseDetail detail = new CaseDetail(
                caseId, "Test Case", "SUBMITTED", "Civil Registry", "Unit A1",
                Instant.now(), "Description", List.of(), List.of(),
                UUID.randomUUID(), Map.of("field", "value"), null);
        when(caseService.getCaseDetail(eq(caseId), eq(ownerId))).thenReturn(detail);

        mockMvc.perform(get("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.title").value("Test Case"))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void getCaseDetail_shouldReturn404_whenNotFound() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.getCaseDetail(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROCEDURE", caseId.toString()));

        mockMvc.perform(get("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"));
    }

    @Test
    void getCaseDetail_shouldReturn403_whenNotOwner() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.getCaseDetail(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.AccessDeniedException("PROC", caseId.toString()));

        mockMvc.perform(get("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PROC-403-NOT_OWNER"));
    }

    // ========================================================================
    // GET /{id}/status — getCaseStatus
    // ========================================================================

    @Test
    void getCaseStatus_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        CaseStatusResponse response = new CaseStatusResponse(caseId, "SUBMITTED", Instant.now(), "Document Review", null);
        when(caseService.getCaseStatus(eq(caseId), eq(ownerId))).thenReturn(response);

        mockMvc.perform(get("/citizen/procedures/{id}/status", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.currentTask").value("Document Review"));
    }

    @Test
    void getCaseStatus_shouldReturn404_whenNotFound() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.getCaseStatus(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROCEDURE", caseId.toString()));

        mockMvc.perform(get("/citizen/procedures/{id}/status", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"));
    }

    @Test
    void getCaseStatus_shouldReturn403_whenNotOwner() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.getCaseStatus(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.AccessDeniedException("PROC", caseId.toString()));

        mockMvc.perform(get("/citizen/procedures/{id}/status", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PROC-403-NOT_OWNER"));
    }

    // ========================================================================
    // POST /{id}/amend — requestAmendment
    // ========================================================================

    @Test
    void requestAmendment_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        CaseStatusResponse response = new CaseStatusResponse(caseId, "AMENDMENT_REQUIRED", Instant.now(), "Amend Documents", null);
        when(caseService.requestAmendment(eq(caseId), eq(ownerId), any())).thenReturn(response);

        mockMvc.perform(post("/citizen/procedures/{id}/amend", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("field", "updated"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.status").value("AMENDMENT_REQUIRED"));
    }

    @Test
    void requestAmendment_shouldReturn200_withEmptyBody() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        CaseStatusResponse response = new CaseStatusResponse(caseId, "AMENDMENT_REQUIRED", Instant.now(), null, null);
        when(caseService.requestAmendment(eq(caseId), eq(ownerId), any())).thenReturn(response);

        mockMvc.perform(post("/citizen/procedures/{id}/amend", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()));
    }

    @Test
    void requestAmendment_shouldReturn404_whenNotFound() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.requestAmendment(eq(caseId), eq(ownerId), any()))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROCEDURE", caseId.toString()));

        mockMvc.perform(post("/citizen/procedures/{id}/amend", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("field", "value"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"));
    }

    @Test
    void requestAmendment_shouldReturn403_whenNotOwner() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.requestAmendment(eq(caseId), eq(ownerId), any()))
                .thenThrow(new es.tfg.records.application.exception.AccessDeniedException("PROC", caseId.toString()));

        mockMvc.perform(post("/citizen/procedures/{id}/amend", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("field", "value"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PROC-403-NOT_OWNER"));
    }

    // ========================================================================
    // POST /{id}/submit — submitCase
    // ========================================================================

    @Test
    void submitCase_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        CaseStatusResponse response = new CaseStatusResponse(caseId, "SUBMITTED", Instant.now(), "Document Review", null);
        when(caseService.submitCase(eq(caseId), eq(ownerId))).thenReturn(response);

        mockMvc.perform(post("/citizen/procedures/{id}/submit", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void submitCase_shouldReturn404_whenNotFound() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.submitCase(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROCEDURE", caseId.toString()));

        mockMvc.perform(post("/citizen/procedures/{id}/submit", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"));
    }

    @Test
    void submitCase_shouldReturn403_whenNotOwner() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.submitCase(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.AccessDeniedException("PROC", caseId.toString()));

        mockMvc.perform(post("/citizen/procedures/{id}/submit", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PROC-403-NOT_OWNER"));
    }

    @Test
    void submitCase_shouldReturn409_whenNotInDraft() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.submitCase(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.ConflictException("PROC", "Cannot submit a case that is not in DRAFT status. Current: SUBMITTED"));

        mockMvc.perform(post("/citizen/procedures/{id}/submit", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("PROC-409-STATE_INVALID"));
    }

    // ========================================================================
    // PUT /{id} — updateDraft
    // ========================================================================

    @Test
    void updateDraft_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        CaseStatusResponse response = new CaseStatusResponse(caseId, "DRAFT", Instant.now(), null, null);
        when(caseService.updateDraft(eq(caseId), eq(ownerId), any(CreateCaseRequest.class))).thenReturn(response);

        CreateCaseRequest req = new CreateCaseRequest(procedureTypeId.toString(), Map.of("field", "updated"), null);

        mockMvc.perform(put("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void updateDraft_shouldReturn404_whenNotFound() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        when(caseService.updateDraft(eq(caseId), eq(ownerId), any(CreateCaseRequest.class)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROCEDURE", caseId.toString()));

        CreateCaseRequest req = new CreateCaseRequest(procedureTypeId.toString(), Map.of("field", "value"), null);

        mockMvc.perform(put("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"));
    }

    @Test
    void updateDraft_shouldReturn403_whenNotOwner() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        when(caseService.updateDraft(eq(caseId), eq(ownerId), any(CreateCaseRequest.class)))
                .thenThrow(new es.tfg.records.application.exception.AccessDeniedException("PROC", caseId.toString()));

        CreateCaseRequest req = new CreateCaseRequest(procedureTypeId.toString(), Map.of("field", "value"), null);

        mockMvc.perform(put("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PROC-403-NOT_OWNER"));
    }

    @Test
    void updateDraft_shouldReturn409_whenNotInDraft() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        when(caseService.updateDraft(eq(caseId), eq(ownerId), any(CreateCaseRequest.class)))
                .thenThrow(new es.tfg.records.application.exception.ConflictException("PROC", "Case not in DRAFT status"));

        CreateCaseRequest req = new CreateCaseRequest(procedureTypeId.toString(), Map.of("field", "value"), null);

        mockMvc.perform(put("/citizen/procedures/{id}", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("PROC-409-STATE_INVALID"));
    }

    // ========================================================================
    // GET /{id}/receipt — downloadReceipt
    // ========================================================================

    @Test
    void downloadReceipt_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        org.springframework.core.io.ByteArrayResource resource =
                new org.springframework.core.io.ByteArrayResource("PDF content".getBytes());
        when(caseService.downloadReceipt(eq(caseId), eq(ownerId))).thenReturn(resource);

        mockMvc.perform(get("/citizen/procedures/{id}/receipt", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk());
    }

    @Test
    void downloadReceipt_shouldReturn404_whenNotFound() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.downloadReceipt(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.ResourceNotFoundException("PROCEDURE", caseId.toString()));

        mockMvc.perform(get("/citizen/procedures/{id}/receipt", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"));
    }

    @Test
    void downloadReceipt_shouldReturn403_whenNotOwner() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.downloadReceipt(eq(caseId), eq(ownerId)))
                .thenThrow(new es.tfg.records.application.exception.AccessDeniedException("PROC", caseId.toString()));

        mockMvc.perform(get("/citizen/procedures/{id}/receipt", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PROC-403-NOT_OWNER"));
    }
}
