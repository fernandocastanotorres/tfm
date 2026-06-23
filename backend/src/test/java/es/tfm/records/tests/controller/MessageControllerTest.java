package es.tfm.records.tests.controller;

import es.tfm.records.application.dto.MessagingDtos.*;
import es.tfm.records.application.service.MessageService;
import es.tfm.records.domain.model.MessageSenderRole;
import es.tfm.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfm.records.entrypoints.controller.MessageController;
import es.tfm.records.infrastructure.persistence.entity.UserEntity;
import es.tfm.records.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MessageController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MessageService messageService;

    @MockitoBean
    private UserJpaRepository userJpaRepository;

    @Test
    void sendMessageAsCitizen_shouldReturn200() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        UserEntity citizen = createUser(citizenId, "citizen@tfm.es", "Citizen One");
        MessageDto messageDto = createMessageDto("CITIZEN", "Hello");

        when(userJpaRepository.findById(citizenId)).thenReturn(java.util.Optional.of(citizen));
        when(messageService.sendMessage(eq(procedureId), eq(MessageSenderRole.CITIZEN), anyString(), anyString(),
                eq("Hello"), isNull(), eq(true), isNull())).thenReturn(messageDto);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/citizen/procedures/{procedureId}/messages", procedureId)
                        .param("content", "Hello")
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senderRole").value("CITIZEN"))
                .andExpect(jsonPath("$.content").value("Hello"));
    }

    @Test
    void sendMessageAsAdmin_shouldReturn200() throws Exception {
        UUID adminId = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        UserEntity admin = createUser(adminId, "admin@tfm.es", "Admin One");
        MessageDto messageDto = createMessageDto("ADMIN", "Reply");

        when(userJpaRepository.findById(adminId)).thenReturn(java.util.Optional.of(admin));
        when(messageService.sendMessage(eq(procedureId), eq(MessageSenderRole.ADMIN), anyString(), anyString(),
                eq("Reply"), isNull(), eq(true), isNull())).thenReturn(messageDto);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/admin/procedures/{procedureId}/messages", procedureId)
                        .param("content", "Reply")
                        .principal(new TestingAuthenticationToken(adminId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senderRole").value("ADMIN"));
    }

    @Test
    void getThreadMessagesAsCitizen_shouldReturn200() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        PagedMessages paged = new PagedMessages(
                List.of(createMessageDto("CITIZEN", "Hello"), createMessageDto("ADMIN", "Reply")),
                0, 20, 2, 1);

        doNothing().when(messageService).verifyCitizenProcedureAccess(procedureId, citizenId);
        when(messageService.getThreadMessages(procedureId, 0, 20)).thenReturn(paged);
        doNothing().when(messageService).markThreadAsRead(any(), eq(MessageSenderRole.CITIZEN));

        mockMvc.perform(get("/citizen/procedures/{procedureId}/messages", procedureId)
                        .param("page", "0")
                        .param("size", "20")
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages").isArray())
                .andExpect(jsonPath("$.messages.length()").value(2))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    void getThreadMessagesAsAdmin_shouldReturn200() throws Exception {
        UUID procedureId = UUID.randomUUID();
        PagedMessages paged = new PagedMessages(
                List.of(createMessageDto("ADMIN", "Admin reply")),
                0, 20, 1, 1);

        when(messageService.getThreadMessages(procedureId, 0, 20)).thenReturn(paged);
        doNothing().when(messageService).markThreadAsRead(any(), eq(MessageSenderRole.ADMIN));

        mockMvc.perform(get("/admin/procedures/{procedureId}/messages", procedureId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages.length()").value(1));
    }

    @Test
    void downloadAttachmentAsCitizen_shouldReturnFile() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID attachmentId = UUID.randomUUID();
        ByteArrayResource resource = new ByteArrayResource("file-content".getBytes()) {
            @Override
            public String getFilename() {
                return "document.pdf";
            }
        };

        doNothing().when(messageService).verifyCitizenAttachmentAccess(attachmentId, citizenId);
        when(messageService.downloadAttachment(attachmentId)).thenReturn(resource);

        mockMvc.perform(get("/citizen/procedures/{procedureId}/messages/attachments/{attachmentId}/download",
                        UUID.randomUUID(), attachmentId)
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"document.pdf\""));
    }

    @Test
    void downloadAttachmentAsAdmin_shouldReturnFile() throws Exception {
        UUID attachmentId = UUID.randomUUID();
        ByteArrayResource resource = new ByteArrayResource("file-content".getBytes()) {
            @Override
            public String getFilename() {
                return "report.pdf";
            }
        };

        when(messageService.downloadAttachment(attachmentId)).thenReturn(resource);

        mockMvc.perform(get("/admin/procedures/{procedureId}/messages/attachments/{attachmentId}/download",
                        UUID.randomUUID(), attachmentId))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"report.pdf\""));
    }

    @Test
    void getUnreadCounts_shouldReturn200() throws Exception {
        UnreadCounts counts = new UnreadCounts(3, 7);
        when(messageService.getUnreadCounts()).thenReturn(counts);

        mockMvc.perform(get("/admin/messages/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizenUnread").value(3))
                .andExpect(jsonPath("$.adminUnread").value(7));
    }

    @Test
    void getCitizenUnreadCount_shouldReturn200() throws Exception {
        UnreadCounts counts = new UnreadCounts(5, 2);
        when(messageService.getUnreadCounts()).thenReturn(counts);

        mockMvc.perform(get("/citizen/messages/unread-count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void getCitizenThreadSummaries_shouldReturn200() throws Exception {
        UUID citizenId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        List<ThreadSummary> summaries = List.of(
                new ThreadSummary(threadId, procedureId, "Case Title", "Last message preview",
                        Instant.now(), 2, 10));

        when(messageService.getCitizenThreadSummaries(citizenId)).thenReturn(summaries);

        mockMvc.perform(get("/citizen/messages/threads")
                        .principal(new TestingAuthenticationToken(citizenId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].caseTitle").value("Case Title"))
                .andExpect(jsonPath("$[0].unreadCount").value(2))
                .andExpect(jsonPath("$[0].totalMessages").value(10));
    }

    @Test
    void getAdminUnreadThreadSummaries_shouldReturn200() throws Exception {
        UUID threadId = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        List<ThreadSummary> summaries = List.of(
                new ThreadSummary(threadId, procedureId, "Urgent Case", "Need help ASAP",
                        Instant.now(), 3, 5));

        when(messageService.getAdminUnreadThreadSummaries()).thenReturn(summaries);

        mockMvc.perform(get("/admin/messages/unread-threads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].caseTitle").value("Urgent Case"))
                .andExpect(jsonPath("$[0].unreadCount").value(3));
    }

    // ===== Helper methods =====

    private MessageDto createMessageDto(String senderRole, String content) {
        return new MessageDto(
                UUID.randomUUID(), UUID.randomUUID(), senderRole, "Test User",
                "test@tfm.es", content, null, false, null, 0, List.of(), Instant.now());
    }

    private UserEntity createUser(UUID id, String email, String displayName) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setEmail(email);
        user.setDisplayName(displayName);
        return user;
    }
}
