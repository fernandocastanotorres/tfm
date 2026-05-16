package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.WorkflowDtos;
import es.tfg.records.application.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/workflow")
@Tag(name = "Workflow", description = "Simple BPM manager for backoffice")
@SecurityRequirement(name = "bearerAuth")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping("/process-instances")
    @Operation(summary = "Start simple procedure process")
    public ResponseEntity<WorkflowDtos.ProcessInstanceResponse> startProcess(
            @RequestBody(required = false) WorkflowDtos.StartProcessRequest request) {
        WorkflowDtos.StartProcessRequest payload = request == null
                ? new WorkflowDtos.StartProcessRequest("simpleCitizenProcedure", null, null)
                : request;
        return ResponseEntity.status(HttpStatus.CREATED).body(workflowService.startProcess(payload));
    }

    @GetMapping("/tasks")
    @Operation(summary = "List active workflow tasks")
    public ResponseEntity<List<WorkflowDtos.WorkflowTaskResponse>> listTasks(
            @RequestParam(required = false) String processInstanceId,
            @RequestParam(required = false) String assignee) {
        return ResponseEntity.ok(workflowService.listActiveTasks(processInstanceId, assignee));
    }

    @PostMapping("/tasks/{taskId}/complete")
    @Operation(summary = "Complete workflow task")
    public ResponseEntity<Void> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) WorkflowDtos.CompleteTaskRequest request) {
        workflowService.completeTask(taskId, request == null ? new WorkflowDtos.CompleteTaskRequest(null) : request);
        return ResponseEntity.noContent().build();
    }
}
