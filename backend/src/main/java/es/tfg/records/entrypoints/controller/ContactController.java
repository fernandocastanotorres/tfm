package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.ContactMessageDto;
import es.tfg.records.application.dto.ContactMessageRequest;
import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.service.ContactMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/citizen/contact")
@Tag(name = "Contact", description = "Citizen contact form: send messages to the administration")
public class ContactController {

    private final ContactMessageService contactMessageService;

    public ContactController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    @Operation(summary = "Send contact message", description = "Submit a message through the contact form. Does not require authentication.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Message sent successfully",
                    content = @Content(schema = @Schema(implementation = ContactMessageDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ContactMessageDto> sendMessage(@Valid @RequestBody ContactMessageRequest request) {
        ContactMessageDto created = contactMessageService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
