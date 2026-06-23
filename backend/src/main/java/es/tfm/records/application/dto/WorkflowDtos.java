package es.tfm.records.application.dto;

import java.time.Instant;
import java.util.Map;

public final class WorkflowDtos {

    private WorkflowDtos() {
    }

    public record StartProcessRequest(
            String processKey,
            String businessKey,
            Map<String, Object> variables
    ) {}

    public record CompleteTaskRequest(
            Map<String, Object> variables
    ) {}

    public record ProcessInstanceResponse(
            String processInstanceId,
            String processDefinitionId,
            String processDefinitionKey,
            String businessKey,
            String startUserId,
            Instant startTime,
            boolean ended
    ) {}

    public record WorkflowTaskResponse(
            String id,
            String name,
            String processInstanceId,
            String processDefinitionId,
            String assignee,
            Instant createTime
    ) {}
}
