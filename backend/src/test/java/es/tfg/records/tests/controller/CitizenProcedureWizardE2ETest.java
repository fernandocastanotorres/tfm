package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.service.RegistryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("dev")
class CitizenProcedureWizardE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistryService registryService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldExposeDynamicFormFieldsForEveryFormTaskInCatalog() throws Exception {
        MvcResult catalogResult = mockMvc.perform(get("/citizen/procedures/catalog"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode catalog = objectMapper.readTree(catalogResult.getResponse().getContentAsString());
        assertThat(catalog.isArray()).isTrue();
        assertThat(catalog.size()).isGreaterThan(0);

        for (JsonNode procedure : catalog) {
            String procedureId = procedure.get("id").asText();
            MvcResult detailResult = mockMvc.perform(get("/citizen/procedures/catalog/{id}", procedureId))
                    .andExpect(status().isOk())
                    .andReturn();

            JsonNode detail = objectMapper.readTree(detailResult.getResponse().getContentAsString());
            JsonNode tasks = detail.get("tasks");
            assertThat(tasks.isArray()).isTrue();

            for (JsonNode task : tasks) {
                if (!"FORM".equals(task.get("type").asText())) {
                    continue;
                }
                JsonNode fields = task.get("fields");
                assertThat(fields.isArray()).isTrue();
                assertThat(fields.size()).isGreaterThan(0);
                assertThat(fields.get(0).get("id").asText()).isEqualTo("applicantFullName");
                assertThat(fields.get(1).get("id").asText()).isEqualTo("applicantEmail");
                assertThat(fields.get(2).get("id").asText()).isEqualTo("applicationReason");
                assertThat(fields.size()).isGreaterThanOrEqualTo(4);
                assertThat(fields.get(3).get("id").asText()).isNotBlank();
            }
        }
    }

    @Test
    void shouldCreateAndSubmitCaseUsingSeededDynamicFormSchema() throws Exception {
        MvcResult catalogResult = mockMvc.perform(get("/citizen/procedures/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andReturn();

        JsonNode catalog = objectMapper.readTree(catalogResult.getResponse().getContentAsString());
        String procedureId = catalog.get(0).get("id").asText();

        mockMvc.perform(get("/citizen/procedures/catalog/{id}", procedureId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(procedureId))
                .andExpect(jsonPath("$.tasks[0].type").value("FORM"))
                .andExpect(jsonPath("$.tasks[0].fields[0].id").value("applicantFullName"))
                .andExpect(jsonPath("$.tasks[0].fields[1].id").value("applicantEmail"))
                .andExpect(jsonPath("$.tasks[0].fields[2].id").value("applicationReason"));

        UUID ownerId = UUID.randomUUID();

        when(registryService.generateEntryNumber(any(), any(Instant.class)))
                .thenReturn("RE/TESTUNIT/2026/000001");
        when(registryService.generateExitNumber(any(), any(Instant.class)))
                .thenReturn("RS/TESTUNIT/2026/000001");
        when(registryService.generateRecordNumber(any(), any(Instant.class)))
                .thenReturn("EXP/TESTU/2026/000001");

        String createRequest = """
                {
                  "procedureId": "%s",
                  "formData": {
                    "applicantFullName": "Test Citizen",
                    "applicantEmail": "citizen@example.com",
                    "applicationReason": "Prueba funcional E2E",
                    "businessName": "Cafe Central",
                    "premisesAddress": "Calle Mayor 10"
                  },
                  "documentIds": []
                }
                """.formatted(procedureId);

        MvcResult createResult = mockMvc.perform(post("/citizen/procedures")
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();

        JsonNode createdCase = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String caseId = createdCase.get("id").asText();
        assertThat(caseId).isNotBlank();

        mockMvc.perform(post("/citizen/procedures/{id}/submit", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));

        mockMvc.perform(get("/citizen/procedures/{id}/status", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(caseId))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }
}
