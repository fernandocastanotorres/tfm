package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.ContactMessageDto;
import es.tfg.records.application.service.ContactMessageService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.BackofficeContactController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BackofficeContactController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class BackofficeContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactMessageService contactMessageService;

    @Test
    void listMessages_shouldReturn200() throws Exception {
        ContactMessageDto msg = new ContactMessageDto(UUID.randomUUID(), "User", "user@test.com", "Sub", "Msg", "General", false, Instant.now());
        when(contactMessageService.findAll()).thenReturn(List.of(msg));

        mockMvc.perform(get("/admin/contact-messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("user@test.com"));
    }

    @Test
    void getMessage_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        ContactMessageDto msg = new ContactMessageDto(id, "User", "user@test.com", "Sub", "Msg", "General", false, Instant.now());
        
        when(contactMessageService.findById(id)).thenReturn(msg);

        mockMvc.perform(get("/admin/contact-messages/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
        
        verify(contactMessageService).markAsRead(id);
    }

    @Test
    void markAsRead_shouldReturn204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/admin/contact-messages/{id}/read", id))
                .andExpect(status().isNoContent());
        
        verify(contactMessageService).markAsRead(id);
    }

    @Test
    void getUnreadCount_shouldReturn200() throws Exception {
        when(contactMessageService.countUnread()).thenReturn(5L);

        mockMvc.perform(get("/admin/contact-messages/unread-count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }
}
