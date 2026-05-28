package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.ContactMessageDto;
import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.service.ContactMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/contact-messages")
@Tag(name = "Contact Inbox", description = "Backoffice contact message inbox: list, view, and mark as read")
@SecurityRequirement(name = "bearerAuth")
public class BackofficeContactController {

    private final ContactMessageService contactMessageService;

    public BackofficeContactController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @GetMapping
    @Operation(summary = "List all contact messages", description = "Return all contact messages ordered by creation date descending")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of contact messages",
                    content = @Content(schema = @Schema(implementation = ContactMessageDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — admin role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ContactMessageDto>> listMessages() {
        return ResponseEntity.ok(contactMessageService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contact message detail", description = "Return a single contact message by ID and mark it as read")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contact message detail",
                    content = @Content(schema = @Schema(implementation = ContactMessageDto.class))),
            @ApiResponse(responseCode = "404", description = "Message not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ContactMessageDto> getMessage(@PathVariable UUID id) {
        contactMessageService.markAsRead(id);
        return ResponseEntity.ok(contactMessageService.findById(id));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark contact message as read", description = "Mark a contact message as read without returning detail")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Message marked as read"),
            @ApiResponse(responseCode = "404", description = "Message not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        contactMessageService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread contact message count", description = "Return the number of unread contact messages")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Unread count",
                    content = @Content(schema = @Schema(implementation = Integer.class)))
    })
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(contactMessageService.countUnread());
    }
}
