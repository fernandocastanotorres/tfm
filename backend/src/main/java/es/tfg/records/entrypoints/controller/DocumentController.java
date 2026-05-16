package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.DocumentDetail;
import es.tfg.records.application.dto.DocumentItem;
import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.service.DocumentService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for document management endpoints.
 * Documents are associated with cases and enforce ownership checks.
 */
@RestController
@RequestMapping("/citizen/procedures")
@Tag(name = "Documents", description = "Document upload, listing, download, and deletion for citizen cases")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/{caseId}/documents")
    @Operation(summary = "Upload document", description = "Upload a document to an owned case in DRAFT or AMENDMENT_REQUIRED status")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Document uploaded successfully",
                    content = @Content(schema = @Schema(implementation = DocumentItem.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Case not accepting documents (already submitted)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<DocumentItem> uploadDocument(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("caseId") UUID caseId,
            @Parameter(description = "Document file (max 10MB)", required = true)
            @RequestParam("file") MultipartFile file) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocument(caseId, ownerId, file));
    }

    @GetMapping("/{caseId}/documents")
    @Operation(summary = "List case documents", description = "Return all documents associated with an owned case")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Document list",
                    content = @Content(schema = @Schema(implementation = DocumentItem.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — case not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<DocumentItem>> listDocuments(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("caseId") UUID caseId) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(documentService.listDocumentsByCase(caseId, ownerId));
    }

    @GetMapping("/{procedureUuid}/documents/{docUuid}")
    @Operation(summary = "Get document metadata", description = "Return metadata for a specific document owned by the citizen, including version history")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Document metadata",
                    content = @Content(schema = @Schema(implementation = DocumentDetail.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — document not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<DocumentDetail> getDocument(
            Authentication authentication,
            @Parameter(description = "Procedure (case) UUID", required = true)
            @PathVariable("procedureUuid") UUID procedureUuid,
            @Parameter(description = "Document UUID", required = true)
            @PathVariable("docUuid") UUID docUuid) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(documentService.getDocumentDetail(procedureUuid, docUuid, ownerId));
    }

    @DeleteMapping("/documents/{id}")
    @Operation(summary = "Delete document", description = "Delete a document owned by the citizen")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Document deleted"),
            @ApiResponse(responseCode = "403", description = "Forbidden — document not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteDocument(
            Authentication authentication,
            @Parameter(description = "Document UUID", required = true)
            @PathVariable("id") UUID id) {

        UUID ownerId = extractUserId(authentication);
        documentService.deleteDocument(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/documents/{id}/download")
    @Operation(summary = "Download document", description = "Download the file content of a document owned by the citizen")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File content as octet stream"),
            @ApiResponse(responseCode = "403", description = "Forbidden — document not owned by citizen",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Resource> downloadDocument(
            Authentication authentication,
            @Parameter(description = "Document UUID", required = true)
            @PathVariable("id") UUID id) {

        UUID ownerId = extractUserId(authentication);
        Resource resource = documentService.downloadDocument(id, ownerId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
