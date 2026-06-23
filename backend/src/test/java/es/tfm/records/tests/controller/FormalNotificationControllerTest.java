package es.tfm.records.tests.controller;

import es.tfm.records.application.dto.FormalNotificationDtos;
import es.tfm.records.application.service.FormalNotificationService;
import es.tfm.records.entrypoints.controller.FormalNotificationController;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FormalNotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class FormalNotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FormalNotificationService formalNotificationService;

    @Test
    void issueFormalNotification_shouldReturnCreated() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        UUID issuerId = UUID.randomUUID();
        
        FormalNotificationDtos.InboxItem item = new FormalNotificationDtos.InboxItem(
                UUID.randomUUID(), citizenId, procedureId, "Case Title", 
                "AVAILABLE", "NOTICE", "Subject", "Body", 
                Instant.now(), Instant.now().plusSeconds(86400), 
                null, null, null, List.of()
        );
        
        when(formalNotificationService.issue(any(), eq(issuerId), any())).thenReturn(item);

        mockMvc.perform(post("/admin/notifications/formal")
                        .param("citizenId", citizenId.toString())
                        .param("procedureId", procedureId.toString())
                        .param("typeKey", "NOTICE")
                        .param("subject", "Subject")
                        .param("body", "Body")
                        .param("dueDays", "10")
                        .param("notifyByEmail", "true")
                        .principal(new TestingAuthenticationToken(issuerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("Subject"));
    }

    @Test
    void getCitizenInbox_shouldReturnNotifications() throws Exception {
        UUID citizenId = UUID.randomUUID();
        FormalNotificationDtos.InboxItem item = new FormalNotificationDtos.InboxItem(
                UUID.randomUUID(), citizenId, UUID.randomUUID(), "Case Title", 
                "AVAILABLE", "NOTICE", "Subject", "Body", 
                Instant.now(), Instant.now().plusSeconds(86400), 
                null, null, null, List.of()
        );
        
        when(formalNotificationService.listCitizenInbox(citizenId)).thenReturn(List.of(item));

        mockMvc.perform(get("/citizen/notifications/formal")
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Subject"));
    }

    @Test
    void markAccessed_shouldReturnUpdatedItem() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();
        FormalNotificationDtos.InboxItem item = new FormalNotificationDtos.InboxItem(
                notificationId, citizenId, UUID.randomUUID(), "Case Title", 
                "ACCESSED", "NOTICE", "Subject", "Body", 
                Instant.now(), Instant.now().plusSeconds(86400), 
                Instant.now(), null, null, List.of()
        );
        
        when(formalNotificationService.markAccessed(eq(notificationId), eq(citizenId))).thenReturn(item);

        mockMvc.perform(post("/citizen/notifications/formal/{id}/access", notificationId)
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCESSED"));
    }

    @Test
    void listCitizens_shouldReturn200() throws Exception {
        UUID citizenId = UUID.randomUUID();
        when(formalNotificationService.listCitizens(null)).thenReturn(List.of(
                new FormalNotificationDtos.CitizenOption(citizenId, "citizen@test.com", "Citizen", "12345678A")
        ));

        mockMvc.perform(get("/admin/notifications/citizens")
                        .principal(new TestingAuthenticationToken("admin", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("citizen@test.com"));
    }

    @Test
    void listCitizenCases_shouldReturn200() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(formalNotificationService.listCitizenCases(citizenId)).thenReturn(List.of(
                new FormalNotificationDtos.CitizenCaseOption(caseId, "Expediente de prueba", "Licencias", "SUBMITTED", null)
        ));

        mockMvc.perform(get("/admin/notifications/citizens/{id}/cases", citizenId)
                        .principal(new TestingAuthenticationToken("admin", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Expediente de prueba"));
    }

    @Test
    void acceptNotification_shouldReturnUpdatedItem() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();
        FormalNotificationDtos.InboxItem item = new FormalNotificationDtos.InboxItem(
                notificationId, citizenId, UUID.randomUUID(), "Case Title", 
                "ACCEPTED", "NOTICE", "Subject", "Body", 
                Instant.now(), Instant.now().plusSeconds(86400), 
                Instant.now(), Instant.now(), null, List.of()
        );
        
        when(formalNotificationService.accept(eq(notificationId), eq(citizenId), any())).thenReturn(item);

        mockMvc.perform(post("/citizen/notifications/formal/{id}/accept", notificationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"notes\":\"Aceptado\"}")
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }
}
