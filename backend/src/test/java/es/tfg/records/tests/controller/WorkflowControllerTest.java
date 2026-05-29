package es.tfg.records.tests.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.WorkflowDtos;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.service.WorkflowService;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.WorkflowController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WorkflowController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class WorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WorkflowService workflowService;

    @Test
    void startProcess_shouldReturn201() throws Exception {
        WorkflowDtos.ProcessInstanceResponse response = new WorkflowDtos.ProcessInstanceResponse(
                "pi-1",
                "simpleCitizenProcedure:1:abc",
                "simpleCitizenProcedure",
                "CASE-1",
                null,
                Instant.parse("2026-01-01T10:15:30Z"),
                false
        );
        when(workflowService.startProcess(any())).thenReturn(response);

        WorkflowDtos.StartProcessRequest request = new WorkflowDtos.StartProcessRequest(
                "simpleCitizenProcedure",
                "CASE-1",
                Map.of("priority", "HIGH")
        );

        mockMvc.perform(post("/admin/workflow/process-instances")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.processInstanceId").value("pi-1"))
                .andExpect(jsonPath("$.processDefinitionKey").value("simpleCitizenProcedure"))
                .andExpect(jsonPath("$.businessKey").value("CASE-1"));
    }

    @Test
    void listTasks_shouldReturn200AndTasks() throws Exception {
        WorkflowDtos.WorkflowTaskResponse task = new WorkflowDtos.WorkflowTaskResponse(
                "task-1",
                "Review application",
                "pi-1",
                "simpleCitizenProcedure:1:abc",
                "clerk",
                Instant.parse("2026-01-01T10:15:30Z")
        );
        when(workflowService.listActiveTasks(eq("pi-1"), eq("clerk"))).thenReturn(List.of(task));

        mockMvc.perform(get("/admin/workflow/tasks")
                        .param("processInstanceId", "pi-1")
                        .param("assignee", "clerk"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("task-1"))
                .andExpect(jsonPath("$[0].name").value("Review application"))
                .andExpect(jsonPath("$[0].assignee").value("clerk"));
    }

    @Test
    void completeTask_shouldReturn204() throws Exception {
        WorkflowDtos.CompleteTaskRequest request = new WorkflowDtos.CompleteTaskRequest(Map.of("approved", true));

        mockMvc.perform(post("/admin/workflow/tasks/{taskId}/complete", "task-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(workflowService).completeTask(eq("task-1"), any());
    }

    @Test
    void completeTask_shouldReturn404WhenTaskNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("BPM_TASK", "missing")).when(workflowService)
                .completeTask(eq("missing"), any());

        mockMvc.perform(post("/admin/workflow/tasks/{taskId}/complete", "missing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").exists());
    }
}
