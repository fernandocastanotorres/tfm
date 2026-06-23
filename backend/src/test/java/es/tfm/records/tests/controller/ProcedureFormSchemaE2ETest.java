package es.tfm.records.tests.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("dev")
class ProcedureFormSchemaE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldPersistFormSchemaFromBackofficeAndExposeItInCitizenCatalog() throws Exception {
        MvcResult listResult = mockMvc.perform(get("/admin/procedure-types"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode procedures = objectMapper.readTree(listResult.getResponse().getContentAsString());
        assertThat(procedures.isArray()).isTrue();
        assertThat(procedures.size()).isGreaterThan(0);

        JsonNode procedure = procedures.get(0);
        String procedureId = procedure.get("id").asText();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("title", procedure.get("title").asText());
        payload.put("description", procedure.path("description").asText(""));
        payload.put("category", procedure.path("category").asText("Administrativo"));
        payload.put("status", procedure.get("status").asText());
        payload.put("assignedUnit", procedure.path("assignedUnit").asText(""));
        payload.put("deadlineDays", procedure.path("deadlineDays").asInt(10));
        payload.put("feeAmount", procedure.path("feeAmount").decimalValue());
        payload.set("tasks", procedure.get("tasks"));

        ArrayNode formSchema = objectMapper.createArrayNode();
        formSchema.add(objectMapper.createObjectNode()
                .put("id", "dni")
                .put("label", "DNI")
                .put("type", "text")
                .put("required", true)
                .set("options", objectMapper.createArrayNode()));
        formSchema.add(objectMapper.createObjectNode()
                .put("id", "consent")
                .put("label", "Consentimiento")
                .put("type", "checkbox")
                .put("required", true)
                .set("options", objectMapper.createArrayNode()));
        payload.set("formSchema", formSchema);

        String requestBody = objectMapper.writeValueAsString(payload);

        mockMvc.perform(put("/admin/procedure-types/{id}", procedureId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.formSchema[0].id").value("dni"));

        mockMvc.perform(get("/citizen/procedures/catalog/{id}", procedureId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasks[0].type").value("FORM"))
                .andExpect(jsonPath("$.tasks[0].fields[0].id").value("dni"))
                .andExpect(jsonPath("$.tasks[0].fields[1].id").value("consent"));
    }
}
