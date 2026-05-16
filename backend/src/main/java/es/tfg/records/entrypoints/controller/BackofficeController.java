package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.service.BackofficeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@Tag(name = "Backoffice", description = "Private backoffice dashboard, task, user and procedure management")
@SecurityRequirement(name = "bearerAuth")
public class BackofficeController {

    private final BackofficeService backofficeService;

    public BackofficeController(BackofficeService backofficeService) {
        this.backofficeService = backofficeService;
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get backoffice dashboard stats")
    public ResponseEntity<BackofficeDtos.DashboardStats> dashboardStats() {
        return ResponseEntity.ok(backofficeService.dashboardStats());
    }

    @GetMapping("/tasks/pending")
    @Operation(summary = "Get pending backoffice tasks")
    public ResponseEntity<List<BackofficeDtos.PendingTask>> pendingTasks() {
        return ResponseEntity.ok(backofficeService.pendingTasks());
    }

    @GetMapping("/users")
    @Operation(summary = "List backoffice users")
    public ResponseEntity<List<BackofficeDtos.BackofficeUser>> listUsers() {
        return ResponseEntity.ok(backofficeService.listUsers());
    }

    @PostMapping("/users")
    @Operation(summary = "Create backoffice user")
    public ResponseEntity<BackofficeDtos.BackofficeUser> createUser(@RequestBody BackofficeDtos.CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backofficeService.createUser(request));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update backoffice user")
    public ResponseEntity<BackofficeDtos.BackofficeUser> updateUser(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.UpdateUserRequest request) {
        return ResponseEntity.ok(backofficeService.updateUser(id, request));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate backoffice user")
    public ResponseEntity<BackofficeDtos.BackofficeUser> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.UserStatusRequest request) {
        return ResponseEntity.ok(backofficeService.toggleUserStatus(id, request.isActive()));
    }

    @GetMapping("/procedure-types")
    @Operation(summary = "List managed procedure types")
    public ResponseEntity<List<BackofficeDtos.ManagedProcedure>> listProcedureTypes() {
        return ResponseEntity.ok(backofficeService.listProcedures());
    }

    @PostMapping("/procedure-types")
    @Operation(summary = "Create managed procedure type")
    public ResponseEntity<BackofficeDtos.ManagedProcedure> createProcedureType(@RequestBody BackofficeDtos.ProcedureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backofficeService.createProcedure(request));
    }

    @PutMapping("/procedure-types/{id}")
    @Operation(summary = "Update managed procedure type")
    public ResponseEntity<BackofficeDtos.ManagedProcedure> updateProcedureType(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.ProcedureRequest request) {
        return ResponseEntity.ok(backofficeService.updateProcedure(id, request));
    }

    @PatchMapping("/procedure-types/{id}/status")
    @Operation(summary = "Update managed procedure type status")
    public ResponseEntity<BackofficeDtos.ManagedProcedure> updateProcedureTypeStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(backofficeService.toggleProcedureStatus(id, request.getOrDefault("status", "DRAFT")));
    }

    @GetMapping("/procedure-types/{id}/translations")
    @Operation(summary = "List managed procedure translations by locale")
    public ResponseEntity<List<BackofficeDtos.ProcedureTranslation>> listProcedureTypeTranslations(@PathVariable UUID id) {
        return ResponseEntity.ok(backofficeService.listProcedureTranslations(id));
    }

    @PutMapping("/procedure-types/{id}/translations")
    @Operation(summary = "Create or update managed procedure translation")
    public ResponseEntity<BackofficeDtos.ProcedureTranslation> upsertProcedureTypeTranslation(
            @PathVariable UUID id,
            @RequestBody BackofficeDtos.ProcedureTranslationRequest request) {
        return ResponseEntity.ok(backofficeService.upsertProcedureTranslation(id, request));
    }
}
