package es.tfm.records.tests.service;

import es.tfm.records.application.dto.WorkflowDtos;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.service.WorkflowService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.flowable.task.api.TaskQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkflowServiceTest {

    @Mock
    private RuntimeService runtimeService;

    @Mock
    private TaskService taskService;

    @Mock
    private TaskQuery taskQuery;

    @InjectMocks
    private WorkflowService workflowService;

    @Test
    void startProcess_shouldUseDefaultKeyWhenBlank() {
        ProcessInstance processInstance = org.mockito.Mockito.mock(ProcessInstance.class);
        when(processInstance.getId()).thenReturn("pi-1");
        when(processInstance.getProcessDefinitionId()).thenReturn("simpleCitizenProcedure:1:abc");
        when(processInstance.getProcessDefinitionKey()).thenReturn("simpleCitizenProcedure");
        when(processInstance.getBusinessKey()).thenReturn("CASE-1");
        when(processInstance.getStartTime()).thenReturn(new Date(1710000000000L));
        when(processInstance.isEnded()).thenReturn(false);

        when(runtimeService.startProcessInstanceByKey(eq("simpleCitizenProcedure"), eq("CASE-1"), anyMap()))
                .thenReturn(processInstance);

        WorkflowDtos.StartProcessRequest request = new WorkflowDtos.StartProcessRequest("", "CASE-1", null);
        WorkflowDtos.ProcessInstanceResponse response = workflowService.startProcess(request);

        assertThat(response.processInstanceId()).isEqualTo("pi-1");
        assertThat(response.processDefinitionKey()).isEqualTo("simpleCitizenProcedure");
    }

    @Test
    void listActiveTasks_shouldApplyFilters() {
        Task task = org.mockito.Mockito.mock(Task.class);
        when(task.getId()).thenReturn("task-1");
        when(task.getName()).thenReturn("Review");
        when(task.getProcessInstanceId()).thenReturn("pi-1");
        when(task.getProcessDefinitionId()).thenReturn("simpleCitizenProcedure:1:abc");
        when(task.getAssignee()).thenReturn("clerk");
        when(task.getCreateTime()).thenReturn(new Date(1710000000000L));

        when(taskService.createTaskQuery()).thenReturn(taskQuery);
        when(taskQuery.active()).thenReturn(taskQuery);
        when(taskQuery.processInstanceId("pi-1")).thenReturn(taskQuery);
        when(taskQuery.taskAssignee("clerk")).thenReturn(taskQuery);
        when(taskQuery.orderByTaskCreateTime()).thenReturn(taskQuery);
        when(taskQuery.desc()).thenReturn(taskQuery);
        when(taskQuery.list()).thenReturn(List.of(task));

        List<WorkflowDtos.WorkflowTaskResponse> result = workflowService.listActiveTasks("pi-1", "clerk");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo("task-1");
        verify(taskQuery).processInstanceId("pi-1");
        verify(taskQuery).taskAssignee("clerk");
    }

    @Test
    void completeTask_shouldThrowWhenMissingTask() {
        when(taskService.createTaskQuery()).thenReturn(taskQuery);
        when(taskQuery.taskId("missing")).thenReturn(taskQuery);
        when(taskQuery.singleResult()).thenReturn(null);

        assertThatThrownBy(() -> workflowService.completeTask("missing", new WorkflowDtos.CompleteTaskRequest(Map.of())))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("BPM_TASK");
    }
}
