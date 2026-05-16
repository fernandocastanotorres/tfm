package es.tfg.records.application.service;

import es.tfg.records.application.dto.WorkflowDtos;
import es.tfg.records.application.exception.ResourceNotFoundException;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class WorkflowService {

    private final RuntimeService runtimeService;
    private final TaskService taskService;

    public WorkflowService(RuntimeService runtimeService, TaskService taskService) {
        this.runtimeService = runtimeService;
        this.taskService = taskService;
    }

    @Transactional
    public WorkflowDtos.ProcessInstanceResponse startProcess(WorkflowDtos.StartProcessRequest request) {
        String processKey = request.processKey() == null || request.processKey().isBlank()
                ? "simpleCitizenProcedure"
                : request.processKey();

        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
                processKey,
                request.businessKey(),
                request.variables() == null ? Map.of() : request.variables()
        );

        return toProcessResponse(processInstance);
    }

    @Transactional(readOnly = true)
    public List<WorkflowDtos.WorkflowTaskResponse> listActiveTasks(String processInstanceId, String assignee) {
        var query = taskService.createTaskQuery().active();

        if (processInstanceId != null && !processInstanceId.isBlank()) {
            query.processInstanceId(processInstanceId);
        }
        if (assignee != null && !assignee.isBlank()) {
            query.taskAssignee(assignee);
        }

        return query.orderByTaskCreateTime().desc().list().stream()
                .map(this::toTaskResponse)
                .toList();
    }

    @Transactional
    public void completeTask(String taskId, WorkflowDtos.CompleteTaskRequest request) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw new ResourceNotFoundException("BPM_TASK", taskId);
        }

        taskService.complete(taskId, request == null || request.variables() == null ? Map.of() : request.variables());
    }

    private WorkflowDtos.ProcessInstanceResponse toProcessResponse(ProcessInstance processInstance) {
        return new WorkflowDtos.ProcessInstanceResponse(
                processInstance.getId(),
                processInstance.getProcessDefinitionId(),
                processInstance.getProcessDefinitionKey(),
                processInstance.getBusinessKey(),
                processInstance.getStartUserId(),
                processInstance.getStartTime() == null ? null : Instant.ofEpochMilli(processInstance.getStartTime().getTime()),
                processInstance.isEnded()
        );
    }

    private WorkflowDtos.WorkflowTaskResponse toTaskResponse(Task task) {
        return new WorkflowDtos.WorkflowTaskResponse(
                task.getId(),
                task.getName(),
                task.getProcessInstanceId(),
                task.getProcessDefinitionId(),
                task.getAssignee(),
                task.getCreateTime() == null ? null : Instant.ofEpochMilli(task.getCreateTime().getTime())
        );
    }
}
