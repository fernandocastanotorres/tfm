package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.CaseStatusResponse;
import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.service.CaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for admin-only case management endpoints.
 * Requires ADMIN role for all operations.
 */
@RestController
@RequestMapping("/admin/procedures")
@Tag(name = "Admin Cases", description = "Admin-only case management: status updates and oversight")
@SecurityRequirement(name = "bearerAuth")
public class AdminCaseController {

    private final CaseService caseService;

    public AdminCaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update case status (admin)", description = "Update the status of any case. Restricted to admin users only.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated",
                    content = @Content(schema = @Schema(implementation = CaseStatusResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status value",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — admin role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Case not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CaseStatusResponse> updateCaseStatus(
            Authentication authentication,
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id,
            @Parameter(description = "New status value", required = true)
            @RequestParam String status) {

        UUID ownerId = extractUserId(authentication);
        return ResponseEntity.ok(caseService.updateCaseStatus(id, ownerId, status));
    }

    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
