package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.ProcedureItem;
import es.tfg.records.application.dto.ProcedureTaskDto;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.service.ProcedureService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.ProcedureController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProcedureController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ProcedureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProcedureService procedureService;

    @Test
    void listAllProcedures_shouldReturn200() throws Exception {
        ProcedureItem item = new ProcedureItem("11111111-1111-1111-1111-111111111111", "birth-certificate", "Birth Certificate", "Desc", new BigDecimal("15.00"), 10, "ACTIVE", "Registry", List.of());
        when(procedureService.listAllProcedures()).thenReturn(List.of(item));

        mockMvc.perform(get("/citizen/procedures/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("birth-certificate"));
    }

    @Test
    void getFormSchema_shouldReturn200() throws Exception {
        ProcedureTaskDto task = new ProcedureTaskDto("task-1", "FORM", "Personal Info", "Desc", List.of(), List.of());
        when(procedureService.getFormSchema("birth-certificate")).thenReturn(List.of(task));

        mockMvc.perform(get("/citizen/procedures/catalog/birth-certificate/form-schema"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("FORM"));
    }

    @Test
    void getProcedure_shouldReturn200() throws Exception {
        ProcedureItem item = new ProcedureItem(
                "11111111-1111-1111-1111-111111111111",
                "birth-certificate",
                "Birth Certificate",
                "Apply for a birth certificate",
                new BigDecimal("15.00"),
                10,
                "ACTIVE",
                "Registry",
                List.of()
        );
        when(procedureService.getProcedureBySlug("birth-certificate")).thenReturn(item);

        mockMvc.perform(get("/citizen/procedures/catalog/birth-certificate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("birth-certificate"))
                .andExpect(jsonPath("$.title").value("Birth Certificate"))
                .andExpect(jsonPath("$.feeAmount").value(15.00));
    }

    @Test
    void getProcedure_shouldReturn404_whenNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Procedure", "non-existent"))
                .when(procedureService).getProcedureBySlug("non-existent");

        mockMvc.perform(get("/citizen/procedures/catalog/non-existent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PROCEDURE-404-NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Procedure not found with identifier: non-existent"));
    }

    @Test
    void getTaskSchema_shouldReturn200() throws Exception {
        ProcedureTaskDto task = new ProcedureTaskDto("review-docs", "DOCUMENT", "Document Review", "Upload docs", List.of(), List.of());
        when(procedureService.getTaskSchema("birth-certificate", "review-docs")).thenReturn(List.of(task));

        mockMvc.perform(get("/citizen/procedures/catalog/birth-certificate/tasks/review-docs/schema"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("review-docs"))
                .andExpect(jsonPath("$[0].type").value("DOCUMENT"));
    }

    @Test
    void getTaskSchema_shouldReturn404_whenNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Task", "invalid-task"))
                .when(procedureService).getTaskSchema("birth-certificate", "invalid-task");

        mockMvc.perform(get("/citizen/procedures/catalog/birth-certificate/tasks/invalid-task/schema"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TASK-404-NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Task not found with identifier: invalid-task"));
    }
}
