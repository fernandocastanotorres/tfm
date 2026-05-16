package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.CaseStatusResponse;
import es.tfg.records.application.service.CaseService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.AdminCaseController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminCaseController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AdminCaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CaseService caseService;

    @Test
    void updateCaseStatus_shouldReturn200() throws Exception {
        UUID adminId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(caseService.updateCaseStatus(eq(caseId), eq(adminId), eq("APPROVED")))
                .thenReturn(new CaseStatusResponse(caseId, "APPROVED", Instant.now(), null));

        mockMvc.perform(patch("/admin/procedures/{id}/status", caseId)
                        .queryParam("status", "APPROVED")
                        .principal(new TestingAuthenticationToken(adminId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
