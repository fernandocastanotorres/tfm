package es.tfm.records.entrypoints.controller;

import es.tfm.records.application.dto.CaseStatusResponse;
import es.tfm.records.application.dto.BackofficeDtos;
import es.tfm.records.application.dto.ErrorResponse;
import es.tfm.records.application.dto.PagedResponse;
import es.tfm.records.application.service.BackofficeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
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

    private final BackofficeService backofficeService;

    public AdminCaseController(BackofficeService backofficeService) {
        this.backofficeService = backofficeService;
    }

    @GetMapping
    @Operation(summary = "List all cases (backoffice)", description = "List cases for admin/tramitador backoffice queues.")
    public ResponseEntity<PagedResponse<BackofficeDtos.AdminCaseItem>> listCases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(backofficeService.listCases(page, size, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case detail (backoffice)", description = "Get full case detail for review by backoffice users.")
    public ResponseEntity<BackofficeDtos.AdminCaseDetail> getCaseDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(backofficeService.getCaseDetail(id));
    }

    @GetMapping("/{id}/workflow-graph")
    @Operation(summary = "Get case workflow graph", description = "Get workflow states graph showing visited, current and possible next states for a case.")
    public ResponseEntity<BackofficeDtos.CaseWorkflowGraph> getCaseWorkflowGraph(@PathVariable UUID id) {
        return ResponseEntity.ok(backofficeService.getCaseWorkflowGraph(id));
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
            @Parameter(description = "Case UUID", required = true)
            @PathVariable("id") UUID id,
            @Parameter(description = "New status value", required = true)
            @RequestParam String status) {

        return ResponseEntity.ok(backofficeService.updateCaseStatus(id, status));
    }

    @PostMapping("/{id}/tasks/{taskId}/resolve")
    @Operation(summary = "Resolve case task", description = "Resolve the active workflow task for a case.")
    public ResponseEntity<CaseStatusResponse> resolveTask(
            @PathVariable("id") UUID id,
            @PathVariable String taskId,
            @RequestBody BackofficeDtos.TaskResolutionRequest request) {
        return ResponseEntity.ok(backofficeService.resolveTask(id, request));
    }

    @PatchMapping("/{id}/reassign")
    @Operation(summary = "Reassign case", description = "Register reassignment of a case/task to another backoffice user and append audit timeline event.")
    public ResponseEntity<CaseStatusResponse> reassignCase(
            @PathVariable("id") UUID id,
            @RequestParam UUID assigneeId) {
        return ResponseEntity.ok(backofficeService.reassignCase(id, assigneeId));
    }

}
