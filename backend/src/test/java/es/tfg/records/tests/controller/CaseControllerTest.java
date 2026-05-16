package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.*;
import es.tfg.records.application.service.CaseService;
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

    @Test
    void listCases_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        CaseItem item = new CaseItem(UUID.randomUUID(), "Test", "DRAFT", Instant.now(), null, "Cat", "Unit");
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
        CaseItem created = new CaseItem(UUID.randomUUID(), "New Case", "DRAFT", Instant.now(), null, "Cat", "Unit");
        when(caseService.createCase(eq(ownerId), any(CreateCaseRequest.class))).thenReturn(created);

        CreateCaseRequest req = new CreateCaseRequest(procedureTypeId.toString(), Map.of("field", "value"), null);

        mockMvc.perform(post("/citizen/procedures")
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Case"));
    }
}
