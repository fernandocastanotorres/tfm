package es.tfm.records.entrypoints.controller;

import es.tfm.records.application.dto.FormalNotificationDtos;
import es.tfm.records.application.service.FormalNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Formal Notifications", description = "Legally formal electronic notifications")
public class FormalNotificationController {

    private final FormalNotificationService formalNotificationService;

    public FormalNotificationController(FormalNotificationService formalNotificationService) {
        this.formalNotificationService = formalNotificationService;
    }

    @GetMapping("/admin/notifications/citizens")
    @Operation(summary = "List citizens for electronic notifications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FormalNotificationDtos.CitizenOption>> listCitizens(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(formalNotificationService.listCitizens(search));
    }

    @GetMapping("/admin/notifications/citizens/{id}/cases")
    @Operation(summary = "List citizen cases for electronic notifications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FormalNotificationDtos.CitizenCaseOption>> listCitizenCases(@PathVariable UUID id) {
        return ResponseEntity.ok(formalNotificationService.listCitizenCases(id));
    }

    @PostMapping("/admin/notifications/formal")
    @Operation(summary = "Issue formal electronic notification from backoffice")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FormalNotificationDtos.InboxItem> issueFormalNotification(
            Authentication authentication,
            @RequestParam UUID citizenId,
            @RequestParam UUID procedureId,
            @RequestParam String typeKey,
            @RequestParam String subject,
            @RequestParam String body,
            @RequestParam(defaultValue = "10") int dueDays,
            @RequestParam(defaultValue = "true") boolean notifyByEmail,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Instant expiresAt = Instant.now().plus(Math.max(1, dueDays), ChronoUnit.DAYS);
        FormalNotificationDtos.IssueRequest request = new FormalNotificationDtos.IssueRequest(
                citizenId,
                procedureId,
                typeKey,
                subject,
                body,
                expiresAt,
                notifyByEmail
        );
        UUID issuerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(formalNotificationService.issue(request, issuerId, files));
    }

    @GetMapping("/admin/notifications/formal")
    @Operation(summary = "List all formal notifications for back-office with optional status filter")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<es.tfm.records.application.dto.PagedResponse<FormalNotificationDtos.AdminNotificationItem>> listAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(formalNotificationService.listAllNotifications(page, size, status));
    }

    @GetMapping("/citizen/notifications/formal")
    @Operation(summary = "List citizen formal notification inbox")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FormalNotificationDtos.InboxItem>> getCitizenInbox(Authentication authentication) {
        UUID citizenId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(formalNotificationService.listCitizenInbox(citizenId));
    }

    @GetMapping("/citizen/notifications/formal/unread-count")
    @Operation(summary = "Get citizen unread formal notifications count")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FormalNotificationDtos.UnreadCount> getCitizenUnreadCount(Authentication authentication) {
        UUID citizenId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(formalNotificationService.getCitizenUnreadCount(citizenId));
    }

    @PostMapping("/citizen/notifications/formal/{id}/access")
    @Operation(summary = "Mark formal notification as accessed")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FormalNotificationDtos.InboxItem> markAccessed(Authentication authentication, @PathVariable UUID id) {
        UUID citizenId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(formalNotificationService.markAccessed(id, citizenId));
    }

    @PostMapping("/citizen/notifications/formal/{id}/accept")
    @Operation(summary = "Accept formal notification")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FormalNotificationDtos.InboxItem> accept(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) FormalNotificationDtos.ResolutionRequest request
    ) {
        UUID citizenId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(formalNotificationService.accept(id, citizenId, request == null ? null : request.notes()));
    }

    @PostMapping("/citizen/notifications/formal/{id}/reject")
    @Operation(summary = "Reject formal notification")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FormalNotificationDtos.InboxItem> reject(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody(required = false) FormalNotificationDtos.ResolutionRequest request
    ) {
        UUID citizenId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(formalNotificationService.reject(id, citizenId, request == null ? null : request.notes()));
    }

    @GetMapping("/citizen/notifications/formal/{id}/attachments/{attachmentId}/download")
    @Operation(summary = "Download formal notification attachment")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Resource> downloadCitizenAttachment(
            Authentication authentication,
            @PathVariable UUID id,
            @PathVariable UUID attachmentId
    ) {
        UUID citizenId = UUID.fromString(authentication.getName());
        Resource resource = formalNotificationService.downloadCitizenAttachment(id, attachmentId, citizenId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
