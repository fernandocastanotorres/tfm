package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.ContactMessageDto;
import es.tfg.records.application.dto.ContactMessageRequest;
import es.tfg.records.application.service.ContactMessageService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.ContactController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContactController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ContactMessageService contactMessageService;

    @Test
    void sendMessage_shouldReturn201() throws Exception {
        ContactMessageRequest request = new ContactMessageRequest("John Doe", "john@example.com", "Hello", "I need help", "general");
        ContactMessageDto response = new ContactMessageDto(UUID.randomUUID(), "John Doe", "john@example.com", "Hello", "I need help", "general", false, Instant.now());
        
        when(contactMessageService.create(any(ContactMessageRequest.class))).thenReturn(response);

        mockMvc.perform(post("/citizen/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void sendMessage_shouldReturn400_WhenInvalidEmail() throws Exception {
        ContactMessageRequest request = new ContactMessageRequest("John Doe", "invalid-email", "Hello", "I need help", "general");

        mockMvc.perform(post("/citizen/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sendMessage_shouldReturn400_WhenMissingRequiredFields() throws Exception {
        // Using a map to simulate missing fields in JSON
        String json = "{\"email\":\"john@example.com\"}";

        mockMvc.perform(post("/citizen/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}
