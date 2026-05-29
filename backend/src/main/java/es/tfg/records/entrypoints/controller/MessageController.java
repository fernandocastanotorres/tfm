package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.MessagingDtos.*;
import es.tfg.records.application.service.MessageService;
import es.tfg.records.domain.model.MessageSenderRole;
import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Messaging", description = "Messaging between citizens and administration")
public class MessageController {

    private final MessageService messageService;
    private final UserJpaRepository userJpaRepository;

    public MessageController(MessageService messageService, UserJpaRepository userJpaRepository) {
        this.messageService = messageService;
        this.userJpaRepository = userJpaRepository;
    }

    // ── Citizen endpoints ──

    @PostMapping("/citizen/procedures/{procedureId}/messages")
    @Operation(summary = "Send message from citizen", description = "Send a new message in the case thread as a citizen")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageDto> sendMessageAsCitizen(
            Authentication authentication,
            @PathVariable UUID procedureId,
            @RequestParam("content") String content,
            @RequestParam(value = "templateKey", required = false) String templateKey,
            @RequestParam(value = "notifyByEmail", required = false, defaultValue = "true") boolean notifyByEmail,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        UUID citizenId = UUID.fromString(authentication.getName());
        messageService.verifyCitizenProcedureAccess(procedureId, citizenId);

        UserEntity citizen = userJpaRepository.findById(citizenId).orElse(null);
        String senderName = citizen != null ? citizen.getDisplayName() : "Ciudadano";
        String senderEmail = citizen != null ? citizen.getEmail() : authentication.getName();

        MessageDto message = messageService.sendMessage(
                procedureId, MessageSenderRole.CITIZEN, senderName, senderEmail,
                content, templateKey, notifyByEmail, files);

        return ResponseEntity.ok(message);
    }

    @GetMapping("/citizen/procedures/{procedureId}/messages")
    @Operation(summary = "Get citizen thread messages", description = "Get paginated messages for a case thread as citizen")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PagedMessages> getThreadMessagesAsCitizen(
            Authentication authentication,
            @PathVariable UUID procedureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        UUID citizenId = UUID.fromString(authentication.getName());
        messageService.verifyCitizenProcedureAccess(procedureId, citizenId);

        PagedMessages messages = messageService.getThreadMessages(procedureId, page, size);
        messageService.markThreadAsRead(procedureId, MessageSenderRole.CITIZEN);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/citizen/procedures/{procedureId}/messages/attachments/{attachmentId}/download")
    @Operation(summary = "Download message attachment (citizen)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Resource> downloadAttachmentAsCitizen(
            Authentication authentication,
            @PathVariable UUID attachmentId) {

        UUID citizenId = UUID.fromString(authentication.getName());
        messageService.verifyCitizenAttachmentAccess(attachmentId, citizenId);

        Resource resource = messageService.downloadAttachment(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // ── Admin endpoints ──

    @PostMapping("/admin/procedures/{procedureId}/messages")
    @Operation(summary = "Send message from admin", description = "Send a new message in the case thread as admin")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageDto> sendMessageAsAdmin(
            Authentication authentication,
            @PathVariable UUID procedureId,
            @RequestParam("content") String content,
            @RequestParam(value = "templateKey", required = false) String templateKey,
            @RequestParam(value = "notifyByEmail", required = false, defaultValue = "true") boolean notifyByEmail,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        UUID adminId = UUID.fromString(authentication.getName());
        UserEntity admin = userJpaRepository.findById(adminId).orElse(null);
        String senderName = admin != null ? admin.getDisplayName() : "Administracion";
        String senderEmail = admin != null ? admin.getEmail() : authentication.getName();

        MessageDto message = messageService.sendMessage(
                procedureId, MessageSenderRole.ADMIN, senderName, senderEmail,
                content, templateKey, notifyByEmail, files);

        return ResponseEntity.ok(message);
    }

    @GetMapping("/admin/procedures/{procedureId}/messages")
    @Operation(summary = "Get admin thread messages", description = "Get paginated messages for a case thread as admin")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PagedMessages> getThreadMessagesAsAdmin(
            @PathVariable UUID procedureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PagedMessages messages = messageService.getThreadMessages(procedureId, page, size);
        messageService.markThreadAsRead(procedureId, MessageSenderRole.ADMIN);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/admin/procedures/{procedureId}/messages/attachments/{attachmentId}/download")
    @Operation(summary = "Download message attachment (admin)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Resource> downloadAttachmentAsAdmin(
            @PathVariable UUID attachmentId) {

        Resource resource = messageService.downloadAttachment(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/admin/messages/unread-count")
    @Operation(summary = "Get unread message counts", description = "Get unread counts for both citizen and admin views")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UnreadCounts> getUnreadCounts() {
        return ResponseEntity.ok(messageService.getUnreadCounts());
    }

    @GetMapping("/citizen/messages/unread-count")
    @Operation(summary = "Get citizen unread count")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Long> getCitizenUnreadCount() {
        UnreadCounts counts = messageService.getUnreadCounts();
        return ResponseEntity.ok(counts.citizenUnread());
    }

    @GetMapping("/citizen/messages/threads")
    @Operation(summary = "Get citizen thread summaries", description = "Get all message thread summaries for the authenticated citizen")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<ThreadSummary>> getCitizenThreadSummaries(Authentication authentication) {
        UUID citizenId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(messageService.getCitizenThreadSummaries(citizenId));
    }

    @GetMapping("/admin/messages/unread-threads")
    @Operation(summary = "Get admin unread thread summaries", description = "Get message threads with unread messages for admin")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<ThreadSummary>> getAdminUnreadThreadSummaries() {
        return ResponseEntity.ok(messageService.getAdminUnreadThreadSummaries());
    }
}
