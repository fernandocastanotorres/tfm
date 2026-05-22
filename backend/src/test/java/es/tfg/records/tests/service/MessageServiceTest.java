package es.tfg.records.tests.service;

import es.tfg.records.application.dto.MessagingDtos.*;
import es.tfg.records.application.service.EmailGateway;
import es.tfg.records.application.service.MessageService;
import es.tfg.records.domain.model.MessageSenderRole;
import es.tfg.records.domain.port.MessageAttachmentRepository;
import es.tfg.records.domain.port.MessageRepository;
import es.tfg.records.domain.port.MessageThreadRepository;
import es.tfg.records.infrastructure.persistence.entity.MessageAttachmentEntity;
import es.tfg.records.infrastructure.persistence.entity.MessageEntity;
import es.tfg.records.infrastructure.persistence.entity.MessageThreadEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MessageServiceTest {

    @Mock
    private MessageThreadRepository threadRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private MessageAttachmentRepository attachmentRepository;

    @Mock
    private ProcedureJpaRepository procedureJpaRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private EmailGateway emailGateway;

    private MessageService messageService;

    private UUID procedureId;
    private UUID threadId;
    private UUID messageId;
    private UUID attachmentId;
    private UUID citizenId;
    private UUID adminId;

    @BeforeEach
    void setUp() {
        messageService = new MessageService(
                threadRepository, messageRepository, attachmentRepository,
                procedureJpaRepository, userJpaRepository, fileStorageService, emailGateway);
        procedureId = UUID.randomUUID();
        threadId = UUID.randomUUID();
        messageId = UUID.randomUUID();
        attachmentId = UUID.randomUUID();
        citizenId = UUID.randomUUID();
        adminId = UUID.randomUUID();
    }

    // ===== sendMessage =====

    @Test
    void sendMessage_shouldCreateThreadAndMessageWhenThreadDoesNotExist() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.empty());
        when(threadRepository.save(any(MessageThreadEntity.class))).thenAnswer(invocation -> {
            MessageThreadEntity t = invocation.getArgument(0);
            t.setId(threadId);
            return t;
        });

        String content = "Hello, I need help";
        MessageEntity savedMessage = createMessage(messageId, threadId, MessageSenderRole.CITIZEN, content);
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(savedMessage);

        MessageDto result = messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, "Citizen One", "citizen@tfg.es",
                content, null, false, null);

        assertThat(result).isNotNull();
        assertThat(result.content()).isEqualTo(content);
        assertThat(result.senderRole()).isEqualTo("CITIZEN");
        verify(threadRepository, times(2)).save(any(MessageThreadEntity.class));
        verify(messageRepository).save(any(MessageEntity.class));
    }

    @Test
    void sendMessage_shouldUseExistingThreadWhenThreadExists() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity existingThread = createThread(threadId, procedure);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(existingThread));

        MessageEntity savedMessage = createMessage(messageId, threadId, MessageSenderRole.ADMIN, "Admin reply");
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(savedMessage);

        MessageDto result = messageService.sendMessage(
                procedureId, MessageSenderRole.ADMIN, "Admin One", "admin@tfg.es",
                "Admin reply", null, false, null);

        assertThat(result).isNotNull();
        assertThat(result.senderRole()).isEqualTo("ADMIN");
        verify(threadRepository, never()).save(argThat(t -> t.getId() == null));
    }

    @Test
    void sendMessage_shouldIncrementCitizenUnreadCountWhenAdminSends() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        thread.setUnreadCountCitizen(0);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.ADMIN, "Reply"));

        messageService.sendMessage(
                procedureId, MessageSenderRole.ADMIN, "Admin", "admin@tfg.es",
                "Reply", null, false, null);

        verify(threadRepository).save(argThat(t -> t.getUnreadCountCitizen() == 1));
    }

    @Test
    void sendMessage_shouldIncrementAdminUnreadCountWhenCitizenSends() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        thread.setUnreadCountAdmin(0);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.CITIZEN, "Question"));

        messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, "Citizen", "citizen@tfg.es",
                "Question", null, false, null);

        verify(threadRepository).save(argThat(t -> t.getUnreadCountAdmin() == 1));
    }

    @Test
    void sendMessage_shouldStoreAttachmentsWhenFilesProvided() throws Exception {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(fileStorageService.store(eq(procedureId), any())).thenReturn("stored-file.pdf");
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.CITIZEN, "With attachment"));

        MockMultipartFile file = new MockMultipartFile("files", "doc.pdf", "application/pdf", "content".getBytes());

        MessageDto result = messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, "Citizen", "citizen@tfg.es",
                "With attachment", null, false, List.of(file));

        assertThat(result.attachmentCount()).isEqualTo(1);
        verify(fileStorageService).store(eq(procedureId), any());
        verify(attachmentRepository).save(any(MessageAttachmentEntity.class));
    }

    @Test
    void sendMessage_shouldSendEmailNotificationWhenAdminSendsWithNotify() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        UserEntity citizen = createUser(citizenId, "citizen@tfg.es", "Citizen One");
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(userJpaRepository.findById(citizenId)).thenReturn(Optional.of(citizen));
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.ADMIN, "Reply"));

        messageService.sendMessage(
                procedureId, MessageSenderRole.ADMIN, "Admin", "admin@tfg.es",
                "Reply", null, true, null);

        verify(emailGateway).sendNewMessageNotification("citizen@tfg.es", "Admin", "Reply", procedureId.toString());
    }

    @Test
    void sendMessage_shouldSendEmailNotificationWhenCitizenSendsWithNotify() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.CITIZEN, "Question"));

        messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, "Citizen", "citizen@tfg.es",
                "Question", null, true, null);

        verify(emailGateway).sendNewMessageNotification("admin@tfg.es", "Citizen", "Question", procedureId.toString());
    }

    @Test
    void sendMessage_shouldNotFailWhenEmailNotificationThrows() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        UserEntity citizen = createUser(citizenId, "citizen@tfg.es", "Citizen One");
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(userJpaRepository.findById(citizenId)).thenReturn(Optional.of(citizen));
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.ADMIN, "Reply"));
        doThrow(new RuntimeException("Email service down")).when(emailGateway).sendNewMessageNotification(any(), any(), any(), any());

        MessageDto result = messageService.sendMessage(
                procedureId, MessageSenderRole.ADMIN, "Admin", "admin@tfg.es",
                "Reply", null, true, null);

        assertThat(result).isNotNull();
    }

    @Test
    void sendMessage_shouldThrowWhenProcedureNotFound() {
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, "Citizen", "citizen@tfg.es",
                "Hello", null, false, null))
                .isInstanceOf(es.tfg.records.application.exception.ResourceNotFoundException.class);
    }

    @Test
    void sendMessage_shouldSkipEmptyFiles() throws Exception {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        when(procedureJpaRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.save(any(MessageEntity.class))).thenReturn(createMessage(messageId, threadId, MessageSenderRole.CITIZEN, "Content"));

        MockMultipartFile emptyFile = new MockMultipartFile("files", "empty.pdf", "application/pdf", new byte[0]);
        MockMultipartFile validFile = new MockMultipartFile("files", "doc.pdf", "application/pdf", "content".getBytes());

        MessageDto result = messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, "Citizen", "citizen@tfg.es",
                "Content", null, false, List.of(emptyFile, validFile));

        assertThat(result.attachmentCount()).isEqualTo(1);
        verify(fileStorageService, times(1)).store(eq(procedureId), any());
    }

    // ===== getThreadMessages =====

    @Test
    void getThreadMessages_shouldReturnPagedMessages() {
        MessageThreadEntity thread = createThread(threadId, createProcedure(procedureId, citizenId));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.countByThreadId(threadId)).thenReturn(5L);

        MessageEntity msg1 = createMessage(UUID.randomUUID(), threadId, MessageSenderRole.CITIZEN, "First");
        MessageEntity msg2 = createMessage(UUID.randomUUID(), threadId, MessageSenderRole.ADMIN, "Reply");
        when(messageRepository.findByThreadIdOrderByCreatedAtDesc(eq(threadId), eq(10))).thenReturn(List.of(msg1, msg2));
        when(attachmentRepository.findByMessageId(any())).thenReturn(List.of());

        PagedMessages result = messageService.getThreadMessages(procedureId, 0, 10);

        assertThat(result.messages()).hasSize(2);
        assertThat(result.totalItems()).isEqualTo(5);
        assertThat(result.page()).isEqualTo(0);
        assertThat(result.size()).isEqualTo(10);
    }

    @Test
    void getThreadMessages_shouldReturnEmptyWhenThreadNotFound() {
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.empty());

        PagedMessages result = messageService.getThreadMessages(procedureId, 0, 10);

        assertThat(result.messages()).isEmpty();
        assertThat(result.totalItems()).isEqualTo(0);
    }

    @Test
    void getThreadMessages_shouldIncludeAttachmentsInDto() {
        MessageThreadEntity thread = createThread(threadId, createProcedure(procedureId, citizenId));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.countByThreadId(threadId)).thenReturn(1L);

        UUID msgId = UUID.randomUUID();
        MessageEntity msg = createMessage(msgId, threadId, MessageSenderRole.CITIZEN, "With file");
        when(messageRepository.findByThreadIdOrderByCreatedAtDesc(eq(threadId), eq(10))).thenReturn(List.of(msg));

        MessageAttachmentEntity att = createAttachment(attachmentId, msgId, "report.pdf", "application/pdf", 1024);
        when(attachmentRepository.findByMessageId(msgId)).thenReturn(List.of(att));

        PagedMessages result = messageService.getThreadMessages(procedureId, 0, 10);

        assertThat(result.messages()).hasSize(1);
        assertThat(result.messages().get(0).attachments()).hasSize(1);
        assertThat(result.messages().get(0).attachments().get(0).name()).isEqualTo("report.pdf");
    }

    // ===== markThreadAsRead =====

    @Test
    void markThreadAsRead_shouldResetCitizenUnreadCount() {
        MessageThreadEntity thread = createThread(threadId, createProcedure(procedureId, citizenId));
        thread.setUnreadCountCitizen(3);
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));

        messageService.markThreadAsRead(procedureId, MessageSenderRole.CITIZEN);

        verify(threadRepository).save(argThat(t -> t.getUnreadCountCitizen() == 0));
    }

    @Test
    void markThreadAsRead_shouldResetAdminUnreadCount() {
        MessageThreadEntity thread = createThread(threadId, createProcedure(procedureId, citizenId));
        thread.setUnreadCountAdmin(5);
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));

        messageService.markThreadAsRead(procedureId, MessageSenderRole.ADMIN);

        verify(threadRepository).save(argThat(t -> t.getUnreadCountAdmin() == 0));
    }

    @Test
    void markThreadAsRead_shouldDoNothingWhenThreadNotFound() {
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.empty());

        messageService.markThreadAsRead(procedureId, MessageSenderRole.CITIZEN);

        verify(threadRepository, never()).save(any());
    }

    // ===== getUnreadCounts =====

    @Test
    void getUnreadCounts_shouldReturnBothCounts() {
        when(threadRepository.countByUnreadCountCitizenGreaterThan(0)).thenReturn(3L);
        when(threadRepository.countByUnreadCountAdminGreaterThan(0)).thenReturn(7L);

        UnreadCounts result = messageService.getUnreadCounts();

        assertThat(result.citizenUnread()).isEqualTo(3);
        assertThat(result.adminUnread()).isEqualTo(7);
    }

    // ===== getCitizenThreadSummaries =====

    @Test
    void getCitizenThreadSummaries_shouldReturnSummariesForCitizenProcedures() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        thread.setUnreadCountCitizen(2);
        thread.setLastMessageAt(Instant.now());

        MessageEntity lastMsg = createMessage(UUID.randomUUID(), threadId, MessageSenderRole.ADMIN, "Last message preview");
        thread.getMessages().add(lastMsg);

        when(procedureJpaRepository.findAllByOwnerId(citizenId)).thenReturn(List.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.countByThreadId(threadId)).thenReturn(5L);

        List<ThreadSummary> result = messageService.getCitizenThreadSummaries(citizenId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).caseTitle()).isEqualTo("Test Procedure");
        assertThat(result.get(0).unreadCount()).isEqualTo(2);
        assertThat(result.get(0).totalMessages()).isEqualTo(5);
    }

    @Test
    void getCitizenThreadSummaries_shouldSkipProceduresWithoutThreads() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        when(procedureJpaRepository.findAllByOwnerId(citizenId)).thenReturn(List.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.empty());

        List<ThreadSummary> result = messageService.getCitizenThreadSummaries(citizenId);

        assertThat(result).isEmpty();
    }

    @Test
    void getCitizenThreadSummaries_shouldTruncateLongPreviews() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        thread.setLastMessageAt(Instant.now());

        String longContent = "A".repeat(150);
        MessageEntity lastMsg = createMessage(UUID.randomUUID(), threadId, MessageSenderRole.CITIZEN, longContent);
        thread.getMessages().add(lastMsg);

        when(procedureJpaRepository.findAllByOwnerId(citizenId)).thenReturn(List.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.countByThreadId(threadId)).thenReturn(1L);

        List<ThreadSummary> result = messageService.getCitizenThreadSummaries(citizenId);

        assertThat(result.get(0).lastMessagePreview()).hasSizeLessThanOrEqualTo(103);
        assertThat(result.get(0).lastMessagePreview()).endsWith("...");
    }

    @Test
    void getCitizenThreadSummaries_shouldReturnEmptyPreviewWhenNoMessages() {
        ProcedureEntity procedure = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, procedure);
        thread.setLastMessageAt(Instant.now());

        when(procedureJpaRepository.findAllByOwnerId(citizenId)).thenReturn(List.of(procedure));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));
        when(messageRepository.countByThreadId(threadId)).thenReturn(0L);

        List<ThreadSummary> result = messageService.getCitizenThreadSummaries(citizenId);

        assertThat(result.get(0).lastMessagePreview()).isEmpty();
    }

    // ===== getAdminUnreadThreadSummaries =====

    @Test
    void getAdminUnreadThreadSummaries_shouldReturnOnlyUnreadThreads() {
        ProcedureEntity proc1 = createProcedure(UUID.randomUUID(), citizenId);
        ProcedureEntity proc2 = createProcedure(UUID.randomUUID(), citizenId);

        MessageThreadEntity thread1 = createThread(UUID.randomUUID(), proc1);
        thread1.setUnreadCountAdmin(3);
        thread1.setLastMessageAt(Instant.now());
        MessageEntity msg1 = createMessage(UUID.randomUUID(), thread1.getId(), MessageSenderRole.CITIZEN, "Need help");
        thread1.getMessages().add(msg1);

        MessageThreadEntity thread2 = createThread(UUID.randomUUID(), proc2);
        thread2.setUnreadCountAdmin(0);

        when(procedureJpaRepository.findAll()).thenReturn(List.of(proc1, proc2));
        when(threadRepository.findByProcedureId(proc1.getId())).thenReturn(Optional.of(thread1));
        when(threadRepository.findByProcedureId(proc2.getId())).thenReturn(Optional.of(thread2));
        when(messageRepository.countByThreadId(thread1.getId())).thenReturn(3L);

        List<ThreadSummary> result = messageService.getAdminUnreadThreadSummaries();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).unreadCount()).isEqualTo(3);
    }

    @Test
    void getAdminUnreadThreadSummaries_shouldReturnEmptyWhenNoUnreadThreads() {
        ProcedureEntity proc = createProcedure(procedureId, citizenId);
        MessageThreadEntity thread = createThread(threadId, proc);
        thread.setUnreadCountAdmin(0);

        when(procedureJpaRepository.findAll()).thenReturn(List.of(proc));
        when(threadRepository.findByProcedureId(procedureId)).thenReturn(Optional.of(thread));

        List<ThreadSummary> result = messageService.getAdminUnreadThreadSummaries();

        assertThat(result).isEmpty();
    }

    // ===== downloadAttachment =====

    @Test
    void downloadAttachment_shouldReturnResourceWhenAttachmentExists() throws Exception {
        MessageAttachmentEntity attachment = createAttachment(attachmentId, messageId, "report.pdf", "application/pdf", 2048);
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(attachment));
        when(fileStorageService.openStreamByPath("stored-report.pdf"))
                .thenReturn(new ByteArrayInputStream("file content".getBytes()));

        Resource result = messageService.downloadAttachment(attachmentId);

        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("report.pdf");
        assertThat(result.contentLength()).isEqualTo(2048);
    }

    @Test
    void downloadAttachment_shouldThrowWhenAttachmentNotFound() {
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> messageService.downloadAttachment(attachmentId))
                .isInstanceOf(es.tfg.records.application.exception.ResourceNotFoundException.class);
    }

    @Test
    void downloadAttachment_shouldThrowWhenNoStoragePath() {
        MessageAttachmentEntity attachment = createAttachment(attachmentId, messageId, "report.pdf", "application/pdf", 2048);
        attachment.setStoragePath(null);
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(attachment));

        assertThatThrownBy(() -> messageService.downloadAttachment(attachmentId))
                .isInstanceOf(es.tfg.records.application.exception.ResourceNotFoundException.class);
    }

    // ===== Helper methods =====

    private ProcedureEntity createProcedure(UUID id, UUID ownerId) {
        ProcedureEntity procedure = new ProcedureEntity();
        procedure.setId(id);
        procedure.setOwnerId(ownerId);
        procedure.setTitle("Test Procedure");
        procedure.setProcedureTypeId(UUID.randomUUID());
        return procedure;
    }

    private MessageThreadEntity createThread(UUID id, ProcedureEntity procedure) {
        MessageThreadEntity thread = new MessageThreadEntity();
        thread.setId(id);
        thread.setProcedure(procedure);
        thread.setMessages(new ArrayList<>());
        thread.setCreatedAt(Instant.now());
        thread.setUpdatedAt(Instant.now());
        thread.setLastMessageAt(Instant.now());
        return thread;
    }

    private MessageEntity createMessage(UUID id, UUID threadId, MessageSenderRole role, String content) {
        MessageEntity message = new MessageEntity();
        message.setId(id);
        MessageThreadEntity thread = new MessageThreadEntity();
        thread.setId(threadId);
        message.setThread(thread);
        message.setSenderRole(role);
        message.setSenderName("Test User");
        message.setSenderEmail("test@tfg.es");
        message.setContent(content);
        message.setCreatedAt(Instant.now());
        return message;
    }

    private MessageAttachmentEntity createAttachment(UUID id, UUID messageId, String name, String mimeType, long size) {
        MessageAttachmentEntity attachment = new MessageAttachmentEntity();
        attachment.setId(id);
        attachment.setName(name);
        attachment.setMimeType(mimeType);
        attachment.setSize(size);
        attachment.setStoragePath("stored-" + name);
        attachment.setCreatedAt(Instant.now());
        return attachment;
    }

    private UserEntity createUser(UUID id, String email, String displayName) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setEmail(email);
        user.setDisplayName(displayName);
        return user;
    }
}
