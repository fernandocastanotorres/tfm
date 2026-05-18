package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.*;
import es.tfg.records.application.service.CaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for case (expediente) management endpoints.
 * All endpoints require authentication and enforce case ownership.
 */
@RestController
@RequestMapping("/citizen/procedures")
@Tag(name = "Cases", description = "Citizen case (expediente) management: create, list, view detail, submit, and amend")
@SecurityRequirement(name = "bearerAuth")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    @Operation(summary = "List citizen cases", description = "Return a paginated list of cases owned by the authenticated citizen")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated case list",
                    content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PagedResponse<CaseItem>> listCases(
            Authentication authentication,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field (optional)")
            @RequestParam(required = false) String sort) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.listCases(ownerId, page, size, sort));
    }

    @PostMapping
    @Operation(summary = "Create case draft", description = "Create a new procedure draft linked to a procedure type")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Case created successfully",
                    content = @Content(schema = @Schema(implementation = CaseItem.class))),
            @ApiResponse(responseCode = "400", description = "Invalid procedure ID or request body",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseItem> createCase(
            Authentication authentication,
            @Valid @RequestBody CreateCaseRequest request) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(caseService.createCase(ownerId, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case detail", description = "Return full case details including timeline events and attachments for an owned case")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Case detail",
                    content = @Content(schema = @Schema(implementation = CaseDetail.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseDetail> getCaseDetail(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.getCaseDetail(id, ownerId));
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Get case status", description = "Return the current status of an owned case")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Case status",
                    content = @Content(schema = @Schema(implementation = CaseStatusResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseStatusResponse> getCaseStatus(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.getCaseStatus(id, ownerId));
    }

    @PostMapping("/{id}/amend")
    @Operation(summary = "Request amendment", description = "Request an amendment for a case that has been returned for correction")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Amendment requested",
                    content = @Content(schema = @Schema(implementation = CaseStatusResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseStatusResponse> requestAmendment(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id,
            @RequestBody(required = false) CreateCaseRequest request) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.requestAmendment(id, ownerId, request));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit case", description = "Submit a draft case for processing. Transitions status from DRAFT to SUBMITTED.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Case submitted",
                    content = @Content(schema = @Schema(implementation = CaseStatusResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Case not in DRAFT status",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseStatusResponse> submitCase(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.submitCase(id, ownerId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update draft case", description = "Update form data of a case in DRAFT status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Draft updated",
                    content = @Content(schema = @Schema(implementation = CaseStatusResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Case not in DRAFT status",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseStatusResponse> updateDraft(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateCaseRequest request) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.updateDraft(id, ownerId, request));
    }

    @GetMapping("/{id}/receipt")
    @Operation(summary = "Download case receipt", description = "Download expediente submission receipt as text document")
    public ResponseEntity<Resource> downloadReceipt(
            Authentication authentication,
            @PathVariable("id") UUID id) {

        UUID ownerId = extractUserId(authentication);
        Resource resource = caseService.downloadReceipt(id, ownerId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"justificante-" + id + ".pdf\"")
                .body(resource);
    }

    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
