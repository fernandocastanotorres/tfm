package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.ProcedureItem;
import es.tfg.records.application.dto.ProcedureTaskDto;
import es.tfg.records.application.service.ProcedureService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.ProcedureController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

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

    @MockBean
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
}
