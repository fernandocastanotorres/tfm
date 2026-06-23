package es.tfm.records.entrypoints.controller;

import es.tfm.records.application.dto.ErrorResponse;
import es.tfm.records.application.dto.ProcedureItem;
import es.tfm.records.application.dto.ProcedureTaskDto;
import es.tfm.records.application.service.ProcedureService;
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

import java.util.List;

/**
 * REST controller for procedure catalog endpoints.
 * Provides access to available procedure types and their form/task schemas.
 */
@RestController
@RequestMapping("/citizen/procedures/catalog")
@Tag(name = "Procedure Catalog", description = "Browse available procedure types and their form/task schemas for dynamic UI rendering")
@SecurityRequirement(name = "bearerAuth")
public class ProcedureController {

    private final ProcedureService procedureService;

    public ProcedureController(ProcedureService procedureService) {
        this.procedureService = procedureService;
    }

    @GetMapping
    @Operation(summary = "List all procedures", description = "Return the complete catalog of available procedure types with metadata")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Procedure catalog",
                    content = @Content(schema = @Schema(implementation = ProcedureItem.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ProcedureItem>> listAllProcedures() {
        return ResponseEntity.ok(procedureService.listAllProcedures());
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get procedure detail", description = "Return a specific procedure type with its associated workflow tasks and form schemas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Procedure detail with tasks",
                    content = @Content(schema = @Schema(implementation = ProcedureItem.class))),
            @ApiResponse(responseCode = "404", description = "Procedure not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ProcedureItem> getProcedure(
            @Parameter(description = "Procedure slug identifier", required = true, example = "birth-certificate")
            @PathVariable("slug") String slug) {
        return ResponseEntity.ok(procedureService.getProcedureBySlug(slug));
    }

    @GetMapping("/{slug}/form-schema")
    @Operation(summary = "Get form schema", description = "Return form field definitions for all form-type tasks in a procedure, enabling dynamic UI rendering")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of procedure tasks with form fields",
                    content = @Content(schema = @Schema(implementation = ProcedureTaskDto.class))),
            @ApiResponse(responseCode = "404", description = "Procedure not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ProcedureTaskDto>> getFormSchema(
            @Parameter(description = "Procedure slug identifier", required = true)
            @PathVariable("slug") String slug) {
        return ResponseEntity.ok(procedureService.getFormSchema(slug));
    }

    @GetMapping("/{slug}/tasks/{taskId}/schema")
    @Operation(summary = "Get task schema", description = "Return the schema for a specific task within a procedure")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task schema",
                    content = @Content(schema = @Schema(implementation = ProcedureTaskDto.class))),
            @ApiResponse(responseCode = "404", description = "Procedure or task not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ProcedureTaskDto>> getTaskSchema(
            @Parameter(description = "Procedure slug identifier", required = true)
            @PathVariable("slug") String slug,
            @Parameter(description = "Task identifier", required = true)
            @PathVariable("taskId") String taskId) {
        return ResponseEntity.ok(procedureService.getTaskSchema(slug, taskId));
    }
}
