package es.tfg.records.tests.service;

import es.tfg.records.application.dto.ProcedureItem;
import es.tfg.records.application.dto.ProcedureTaskDto;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.service.ProcedureServiceImpl;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProcedureServiceImplTest {

    @Mock
    private ProcedureTypeRepository procedureTypeRepository;

    @InjectMocks
    private ProcedureServiceImpl procedureService;

    private UUID procedureId;
    private UUID formTaskId;
    private UUID uploadTaskId;
    private UUID reviewTaskId;

    @BeforeEach
    void setUp() {
        procedureId = UUID.randomUUID();
        formTaskId = UUID.randomUUID();
        uploadTaskId = UUID.randomUUID();
        reviewTaskId = UUID.randomUUID();
    }

    private ProcedureType createProcedureType(String title, List<ProcedureTask> tasks) {
        ProcedureType type = new ProcedureType(
                procedureId,
                title,
                "Test description",
                new BigDecimal("15.00"),
                10,
                "ACTIVE",
                "Test Unit"
        );
        type.setTasks(tasks);
        return type;
    }

    private ProcedureTask createTask(UUID id, TaskType type, String title) {
        return new ProcedureTask(id, procedureId, type, 1, title, "Task description");
    }

    // ===== listAllProcedures Tests =====

    @Test
    void listAllProcedures_shouldReturnAllProcedures() {
        // Given
        ProcedureType proc1 = createProcedureType("Birth Certificate", List.of());
        ProcedureType proc2 = createProcedureType("Marriage License", List.of());

        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc1, proc2));

        // When
        List<ProcedureItem> result = procedureService.listAllProcedures();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(ProcedureItem::title)
                .containsExactly("Birth Certificate", "Marriage License");
    }

    @Test
    void listAllProcedures_shouldReturnEmptyListWhenNoProcedures() {
        // Given
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        List<ProcedureItem> result = procedureService.listAllProcedures();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void listAllProcedures_shouldMapTasksCorrectly() {
        // Given
        ProcedureTask formTask = createTask(formTaskId, TaskType.FORM, "Personal Info");
        ProcedureType proc = createProcedureType("Test Procedure", List.of(formTask));

        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        List<ProcedureItem> result = procedureService.listAllProcedures();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).tasks()).hasSize(1);
        assertThat(result.get(0).tasks().get(0).type()).isEqualTo("FORM");
    }

    // ===== getProcedureBySlug Tests =====

    @Test
    void getProcedureBySlug_shouldReturnProcedureWhenFound() {
        // Given
        ProcedureType proc = createProcedureType("Birth Certificate", List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        ProcedureItem result = procedureService.getProcedureBySlug("birth-certificate");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Birth Certificate");
    }

    @Test
    void getProcedureBySlug_shouldReturnProcedureWithMixedCaseTitle() {
        // Given
        ProcedureType proc = createProcedureType("Birth CERTIFICATE Application", List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        ProcedureItem result = procedureService.getProcedureBySlug("birth-certificate-application");

        // Then
        assertThat(result).isNotNull();
    }

    @Test
    void getProcedureBySlug_shouldThrowExceptionWhenNotFound() {
        // Given
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When/Then
        assertThatThrownBy(() -> procedureService.getProcedureBySlug("non-existent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("PROCEDURE");
    }

    @Test
    void getProcedureBySlug_shouldHandleSpecialCharactersInTitle() {
        // Given
        ProcedureType proc = createProcedureType("License (Application) 2024", List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        ProcedureItem result = procedureService.getProcedureBySlug("license-application-2024");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("License (Application) 2024");
    }

    // ===== getFormSchema Tests =====

    @Test
    void getFormSchema_shouldReturnOnlyFormTasks() {
        // Given
        ProcedureTask formTask = createTask(formTaskId, TaskType.FORM, "Personal Info");
        ProcedureTask uploadTask = createTask(uploadTaskId, TaskType.UPLOAD, "Documents");
        ProcedureTask reviewTask = createTask(reviewTaskId, TaskType.REVIEW, "Review");

        ProcedureType proc = createProcedureType("Test Procedure", List.of(formTask, uploadTask, reviewTask));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        List<ProcedureTaskDto> result = procedureService.getFormSchema("test-procedure");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).type()).isEqualTo("FORM");
        assertThat(result.get(0).title()).isEqualTo("Personal Info");
    }

    @Test
    void getFormSchema_shouldReturnEmptyListWhenNoFormTasks() {
        // Given
        ProcedureTask uploadTask = createTask(uploadTaskId, TaskType.UPLOAD, "Documents");
        ProcedureTask reviewTask = createTask(reviewTaskId, TaskType.REVIEW, "Review");

        ProcedureType proc = createProcedureType("Test Procedure", List.of(uploadTask, reviewTask));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        List<ProcedureTaskDto> result = procedureService.getFormSchema("test-procedure");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getFormSchema_shouldThrowExceptionWhenProcedureNotFound() {
        // Given
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When/Then
        assertThatThrownBy(() -> procedureService.getFormSchema("non-existent"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ===== getTaskSchema Tests =====

    @Test
    void getTaskSchema_shouldReturnSpecificTask() {
        // Given
        ProcedureTask formTask = createTask(formTaskId, TaskType.FORM, "Personal Info");
        ProcedureTask uploadTask = createTask(uploadTaskId, TaskType.UPLOAD, "Documents");

        ProcedureType proc = createProcedureType("Test Procedure", List.of(formTask, uploadTask));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        List<ProcedureTaskDto> result = procedureService.getTaskSchema("test-procedure", formTaskId.toString());

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(formTaskId.toString());
        assertThat(result.get(0).title()).isEqualTo("Personal Info");
    }

    @Test
    void getTaskSchema_shouldReturnEmptyListWhenTaskNotFound() {
        // Given
        ProcedureTask formTask = createTask(formTaskId, TaskType.FORM, "Personal Info");

        ProcedureType proc = createProcedureType("Test Procedure", List.of(formTask));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        List<ProcedureTaskDto> result = procedureService.getTaskSchema("test-procedure", UUID.randomUUID().toString());

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getTaskSchema_shouldThrowExceptionWhenProcedureNotFound() {
        // Given
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When/Then
        assertThatThrownBy(() -> procedureService.getTaskSchema("non-existent", formTaskId.toString()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ===== Edge Cases =====

    @Test
    void listAllProcedures_shouldHandleNullTasks() {
        // Given
        ProcedureType proc = new ProcedureType(
                procedureId,
                "Test Procedure",
                "Description",
                new BigDecimal("10.00"),
                5,
                "ACTIVE",
                "Unit"
        );
        proc.setTasks(null);

        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        List<ProcedureItem> result = procedureService.listAllProcedures();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).tasks()).isEmpty();
    }

    @Test
    void getProcedureBySlug_shouldHandleEmptyTitle() {
        // Given
        ProcedureType proc = createProcedureType("", List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of(proc));

        // When
        ProcedureItem result = procedureService.getProcedureBySlug("");

        // Then
        assertThat(result).isNotNull();
    }
}