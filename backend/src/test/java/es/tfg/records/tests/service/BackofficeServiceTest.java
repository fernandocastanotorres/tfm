package es.tfg.records.tests.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.service.BackofficeService;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.infrastructure.persistence.entity.*;
import es.tfg.records.infrastructure.persistence.repository.*;
import es.tfg.records.infrastructure.audit.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BackofficeServiceTest {

    @Mock private ProcedureJpaRepository procedureRepository;
    @Mock private ProcedureTypeJpaRepository procedureTypeRepository;
    @Mock private ProcedureTypeI18nJpaRepository procedureTypeI18nRepository;
    @Mock private ProcedureTaskFieldI18nJpaRepository fieldI18nRepository;
    @Mock private ProcedureTaskJpaRepository taskRepository;
    @Mock private DocumentJpaRepository documentRepository;
    @Mock private DocumentVerificationJpaRepository documentVerificationRepository;
    @Mock private CaseTimelineEventJpaRepository timelineRepository;
    @Mock private UserJpaRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;
    @Mock private HistoryService historyService;
    @Mock private RepositoryService repositoryService;
    @Mock private TaskService taskService;
    private ObjectMapper objectMapper = new ObjectMapper();

    private BackofficeService service;

    @BeforeEach
    void setUp() {
        service = new BackofficeService(procedureRepository, procedureTypeRepository,
                procedureTypeI18nRepository, fieldI18nRepository, taskRepository,
                documentRepository, documentVerificationRepository, timelineRepository, userRepository,
                passwordEncoder, objectMapper, auditService,
                historyService, repositoryService, taskService);
    }

    // ===== listCases =====

    @Test
    void listCases_shouldReturnPagedItems() {
        ProcedureTypeEntity type = createProcedureType("Licencias");
        ProcedureEntity proc = createProcedureWithIds(UUID.randomUUID(), type.getId(), UUID.randomUUID(), CaseStatus.SUBMITTED);
        when(procedureRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(proc)));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(type));

        var result = service.listCases(0, 10, null);

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).procedureType()).isEqualTo("Licencias");
    }

    @Test
    void listCases_shouldFilterByStatus() {
        ProcedureEntity submitted = createProcedure(CaseStatus.SUBMITTED);
        ProcedureEntity approved = createProcedure(CaseStatus.APPROVED);
        ProcedureTypeEntity type = createProcedureType("Test");
        when(procedureRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(submitted, approved)));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(type));

        var result = service.listCases(0, 10, "SUBMITTED");

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).status()).isEqualTo("SUBMITTED");
    }

    @Test
    void listCases_shouldClampPageSize() {
        PageRequest expectedPage = PageRequest.of(0, 100);
        when(procedureRepository.findAll(expectedPage)).thenReturn(Page.empty());
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        service.listCases(-1, 200, null);

        verify(procedureRepository).findAll(expectedPage);
    }

    // ===== getCaseDetail =====

    @Test
    void getCaseDetail_shouldReturnDetailWithCitizen() {
        UUID procId = UUID.randomUUID();
        UUID typeId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        ProcedureEntity proc = createProcedureWithIds(procId, typeId, ownerId, CaseStatus.IN_REVIEW);
        ProcedureTypeEntity type = createProcedureTypeWithId(typeId, "Licencias");
        UserEntity user = createUser(ownerId, "citizen@test.com");

        when(procedureRepository.findById(procId)).thenReturn(Optional.of(proc));
        when(procedureTypeRepository.findById(typeId)).thenReturn(Optional.of(type));
        when(userRepository.findById(ownerId)).thenReturn(Optional.of(user));
        when(documentRepository.findByProcedureId(procId)).thenReturn(List.of());
        when(timelineRepository.findByProcedureIdOrderByDateAsc(procId)).thenReturn(List.of());

        var result = service.getCaseDetail(procId);

        assertThat(result.id()).isEqualTo(procId);
        assertThat(result.procedureType()).isEqualTo("Licencias");
        assertThat(result.citizenEmail()).isEqualTo("citizen@test.com");
    }

    @Test
    void getCaseDetail_shouldThrowWhenNotFound() {
        when(procedureRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getCaseDetail(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCaseWorkflowGraph_shouldMarkVisitedCurrentAndReachableStates() {
        UUID procId = UUID.randomUUID();
        UUID typeId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        ProcedureEntity procedure = createProcedureWithIds(procId, typeId, ownerId, CaseStatus.IN_REVIEW);
        procedure.setSubmittedAt(Instant.now().minusSeconds(3600));

        CaseTimelineEventEntity statusChangeEvent = new CaseTimelineEventEntity();
        statusChangeEvent.setId(UUID.randomUUID());
        statusChangeEvent.setProcedureId(procId);
        statusChangeEvent.setTitle("Cambio de estado");
        statusChangeEvent.setDescription("Backoffice actualizo estado a: AMENDMENT_REQUIRED");
        statusChangeEvent.setDate(Instant.now());

        when(procedureRepository.findById(procId)).thenReturn(Optional.of(procedure));
        when(timelineRepository.findByProcedureIdOrderByDateAsc(procId)).thenReturn(List.of(statusChangeEvent));

        var graph = service.getCaseWorkflowGraph(procId);

        assertThat(graph.caseId()).isEqualTo(procId);
        assertThat(graph.currentStatus()).isEqualTo("IN_REVIEW");
        assertThat(graph.nodes().stream().filter(BackofficeDtos.CaseWorkflowNode::current).map(BackofficeDtos.CaseWorkflowNode::key))
                .containsExactly("IN_REVIEW");
        assertThat(graph.nodes().stream().filter(BackofficeDtos.CaseWorkflowNode::visited).map(BackofficeDtos.CaseWorkflowNode::key))
                .contains("DRAFT", "SUBMITTED", "IN_REVIEW", "AMENDMENT_REQUIRED");
        assertThat(graph.nodes().stream().filter(BackofficeDtos.CaseWorkflowNode::reachable).map(BackofficeDtos.CaseWorkflowNode::key))
                .contains("AMENDMENT_REQUIRED", "APPROVED", "REJECTED");
    }

    // ===== updateCaseStatus =====

    @Test
    void updateCaseStatus_shouldChangeStatusAndAddTimeline() {
        UUID procId = UUID.randomUUID();
        ProcedureEntity proc = createProcedureWithIds(procId, UUID.randomUUID(), UUID.randomUUID(), CaseStatus.SUBMITTED);
        when(procedureRepository.findById(procId)).thenReturn(Optional.of(proc));
        when(procedureRepository.save(any())).thenReturn(proc);

        var result = service.updateCaseStatus(procId, "IN_REVIEW");

        assertThat(result.status()).isEqualTo("IN_REVIEW");
        verify(timelineRepository).save(any(CaseTimelineEventEntity.class));
    }

    // ===== pendingTasks =====

    @Test
    void pendingTasks_shouldReturnOnlyPendingCases() {
        ProcedureEntity submitted = createProcedure(CaseStatus.SUBMITTED);
        ProcedureEntity approved = createProcedure(CaseStatus.APPROVED);
        ProcedureTypeEntity type = createProcedureType("Test");
        when(procedureRepository.findAll()).thenReturn(List.of(submitted, approved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(type));

        var result = service.pendingTasks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).caseId()).isEqualTo(submitted.getId());
    }

    // ===== resolveTask =====

    @Test
    void resolveTask_shouldApproveWhenActionIsApprove() {
        UUID procId = UUID.randomUUID();
        ProcedureEntity proc = createProcedureWithIds(procId, UUID.randomUUID(), UUID.randomUUID(), CaseStatus.IN_REVIEW);
        when(procedureRepository.findById(procId)).thenReturn(Optional.of(proc));
        when(procedureRepository.save(any())).thenReturn(proc);

        var result = service.resolveTask(procId, new BackofficeDtos.TaskResolutionRequest("approve", null, null, null));

        assertThat(result.status()).isEqualTo("APPROVED");
    }

    @Test
    void resolveTask_shouldRejectWhenActionIsReject() {
        UUID procId = UUID.randomUUID();
        ProcedureEntity proc = createProcedureWithIds(procId, UUID.randomUUID(), UUID.randomUUID(), CaseStatus.IN_REVIEW);
        when(procedureRepository.findById(procId)).thenReturn(Optional.of(proc));
        when(procedureRepository.save(any())).thenReturn(proc);

        var result = service.resolveTask(procId, new BackofficeDtos.TaskResolutionRequest("reject", null, null, null));

        assertThat(result.status()).isEqualTo("REJECTED");
    }

    @Test
    void resolveTask_shouldRequestAmendmentWhenActionIsRequestAmendment() {
        UUID procId = UUID.randomUUID();
        ProcedureEntity proc = createProcedureWithIds(procId, UUID.randomUUID(), UUID.randomUUID(), CaseStatus.IN_REVIEW);
        when(procedureRepository.findById(procId)).thenReturn(Optional.of(proc));
        when(procedureRepository.save(any())).thenReturn(proc);

        var result = service.resolveTask(procId, new BackofficeDtos.TaskResolutionRequest("request_amendment", null, null, null));

        assertThat(result.status()).isEqualTo("AMENDMENT_REQUIRED");
    }

    // ===== dashboardStats =====

    @Test
    void dashboardStats_shouldCountProceduresByStatus() {
        List<ProcedureEntity> procs = List.of(
                createProcedure(CaseStatus.SUBMITTED),
                createProcedure(CaseStatus.SUBMITTED),
                createProcedure(CaseStatus.IN_REVIEW),
                createProcedure(CaseStatus.APPROVED)
        );
        when(procedureRepository.findAll()).thenReturn(procs);

        var result = service.dashboardStats();

        assertThat(result.pendingCases()).isEqualTo(2);
        assertThat(result.casesInProgress()).isEqualTo(1);
    }

    // ===== dashboardReport =====

    @Test
    void dashboardReport_shouldComputeStatsForDateRange() {
        Instant now = Instant.now();
        Instant yesterday = now.minusSeconds(86400);
        Instant lastWeek = now.minusSeconds(86400 * 7);

        ProcedureEntity recent = createProcedureWithDates(CaseStatus.APPROVED, yesterday, now);
        ProcedureEntity old = createProcedureWithDates(CaseStatus.SUBMITTED, lastWeek, lastWeek);
        ProcedureTypeEntity type = createProcedureType("Test");

        when(procedureRepository.findAll()).thenReturn(List.of(recent, old));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(type));

        var result = service.dashboardReport(LocalDate.now().minusDays(30), LocalDate.now());

        assertThat(result.summary()).isNotNull();
        assertThat(result.byStatus()).isNotEmpty();
    }

    @Test
    void dashboardReport_shouldSwapDatesWhenFromIsAfterTo() {
        when(procedureRepository.findAll()).thenReturn(List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        var result = service.dashboardReport(LocalDate.now().plusDays(10), LocalDate.now().minusDays(10));

        assertThat(result.summary()).isNotNull();
    }

    @Test
    void dashboardReport_shouldUseDefaultDateRangeWhenNull() {
        when(procedureRepository.findAll()).thenReturn(List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        var result = service.dashboardReport(null, null);

        assertThat(result.summary()).isNotNull();
    }

    // ===== User Management =====

    @Test
    void listUsers_shouldReturnAllUsers() {
        UserEntity user = createUser(UUID.randomUUID(), "admin@test.com");
        when(userRepository.findAll()).thenReturn(List.of(user));

        var result = service.listUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).email()).isEqualTo("admin@test.com");
    }

    @Test
    void createUser_shouldCreateNewUser() {
        UUID newId = UUID.randomUUID();
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        UserEntity saved = new UserEntity();
        saved.setId(newId);
        saved.setEmail("new@test.com");
        saved.setDisplayName("new@test.com");
        saved.setRoles(Set.of("ROLE_ADMIN"));
        saved.setActive(true);
        when(userRepository.save(any())).thenReturn(saved);

        var result = service.createUser(new BackofficeDtos.CreateUserRequest("new@test.com", "password123", List.of("ROLE_ADMIN"), true));

        assertThat(result.email()).isEqualTo("new@test.com");
        assertThat(result.roles()).contains("ROLE_ADMIN");
    }

    @Test
    void createUser_shouldThrowWhenEmailExists() {
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> service.createUser(new BackofficeDtos.CreateUserRequest("existing@test.com", "pass", List.of(), true)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void updateUser_shouldUpdateExistingUser() {
        UUID userId = UUID.randomUUID();
        UserEntity user = createUser(userId, "old@test.com");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        var result = service.updateUser(userId, new BackofficeDtos.UpdateUserRequest("new@test.com", List.of("ROLE_TRAMITADOR"), true));

        assertThat(result.email()).isEqualTo("new@test.com");
    }

    @Test
    void updateUser_shouldThrowWhenNotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateUser(UUID.randomUUID(), new BackofficeDtos.UpdateUserRequest("x", List.of(), true)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void toggleUserStatus_shouldToggleActiveFlag() {
        UUID userId = UUID.randomUUID();
        UserEntity user = createUser(userId, "user@test.com");
        user.setActive(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        var result = service.toggleUserStatus(userId, false);

        assertThat(result.isActive()).isFalse();
    }

    // ===== Procedure Management =====

    @Test
    void listProcedures_shouldReturnAllProcedureTypes() {
        ProcedureTypeEntity type = createProcedureType("Licencias");
        when(procedureTypeRepository.findAll()).thenReturn(List.of(type));
        when(taskRepository.findByProcedureTypeIdOrderByOrderIndexAsc(any())).thenReturn(List.of());

        var result = service.listProcedures();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Licencias");
    }

    @Test
    void createProcedure_shouldCreateNewProcedureType() {
        UUID newId = UUID.randomUUID();
        ProcedureTypeEntity saved = createProcedureTypeWithId(newId, "New Procedure");
        when(procedureTypeRepository.save(any())).thenReturn(saved);

        var result = service.createProcedure(new BackofficeDtos.ProcedureRequest(
                "New Procedure", "Description", null, "active", "simpleCitizenProcedure", "Unit A", 10, null, List.of(), List.of()));

        assertThat(result.title()).isEqualTo("New Procedure");
        verify(procedureTypeRepository).save(any());
    }

    @Test
    void updateProcedure_shouldUpdateExistingProcedureType() {
        UUID procId = UUID.randomUUID();
        ProcedureTypeEntity existing = createProcedureTypeWithId(procId, "Old Title");
        when(procedureTypeRepository.findById(procId)).thenReturn(Optional.of(existing));
        when(procedureTypeRepository.save(any())).thenReturn(existing);

        var result = service.updateProcedure(procId, new BackofficeDtos.ProcedureRequest(
                "New Title", "New Desc", null, "active", "simpleCitizenProcedure", "Unit B", 15, null, List.of(), List.of()));

        assertThat(result.title()).isEqualTo("New Title");
    }

    @Test
    void updateProcedure_shouldThrowWhenNotFound() {
        when(procedureTypeRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateProcedure(UUID.randomUUID(), new BackofficeDtos.ProcedureRequest(
                "Title", "Desc", null, "active", "simpleCitizenProcedure", "Unit", 10, null, List.of(), List.of())))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void toggleProcedureStatus_shouldChangeStatus() {
        UUID procId = UUID.randomUUID();
        ProcedureTypeEntity entity = createProcedureTypeWithId(procId, "Test");
        entity.setStatus("active");
        when(procedureTypeRepository.findById(procId)).thenReturn(Optional.of(entity));
        when(procedureTypeRepository.save(any())).thenReturn(entity);

        var result = service.toggleProcedureStatus(procId, "inactive");

        assertThat(result.status()).isEqualTo("inactive");
    }

    // ===== Procedure Translations =====

    @Test
    void listProcedureTranslations_shouldReturnTranslations() {
        UUID procId = UUID.randomUUID();
        when(procedureTypeRepository.existsById(procId)).thenReturn(true);
        when(procedureTypeI18nRepository.findByProcedureTypeIdOrderByLocaleAsc(procId))
                .thenReturn(List.of(createTranslation(procId, "es-ES", "Titulo")));

        var result = service.listProcedureTranslations(procId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Titulo");
    }

    @Test
    void upsertProcedureTranslation_shouldCreateNewTranslation() {
        UUID procId = UUID.randomUUID();
        when(procedureTypeRepository.existsById(procId)).thenReturn(true);
        when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procId, "ca-ES")).thenReturn(Optional.empty());
        ProcedureTypeI18nEntity saved = createTranslation(procId, "ca-ES", "Títol");
        when(procedureTypeI18nRepository.save(any())).thenReturn(saved);

        var result = service.upsertProcedureTranslation(procId, new BackofficeDtos.ProcedureTranslationRequest(
                "ca-ES", "Títol", "Descripció", "Unitat"));

        assertThat(result.title()).isEqualTo("Títol");
    }

    @Test
    void upsertProcedureTranslation_shouldThrowWhenLocaleIsNull() {
        UUID procId = UUID.randomUUID();
        when(procedureTypeRepository.existsById(procId)).thenReturn(true);

        assertThatThrownBy(() -> service.upsertProcedureTranslation(procId, new BackofficeDtos.ProcedureTranslationRequest(
                null, "Title", "Desc", "Unit")))
                .isInstanceOf(ConflictException.class);
    }

    // ===== Status Parsing =====

    @Test
    void updateCaseStatus_shouldMapInProgressToInReview() {
        UUID procId = UUID.randomUUID();
        ProcedureEntity proc = createProcedureWithIds(procId, UUID.randomUUID(), UUID.randomUUID(), CaseStatus.SUBMITTED);
        when(procedureRepository.findById(procId)).thenReturn(Optional.of(proc));
        when(procedureRepository.save(any())).thenReturn(proc);

        var result = service.updateCaseStatus(procId, "IN_PROGRESS");

        assertThat(result.status()).isEqualTo("IN_REVIEW");
    }

    // ===== Field i18n =====

    @Test
    void listFieldTranslations_shouldReturnFieldGroups() {
        UUID procId = UUID.randomUUID();
        ProcedureTypeEntity procType = createProcedureTypeWithId(procId, "Test");
        ProcedureTaskEntity task = createTask(procId, 1, "Form Task");
        task.setFormSchema("[{\"id\":\"name\",\"label\":\"Name\",\"type\":\"text\",\"required\":true}]");

        when(procedureTypeRepository.findById(procId)).thenReturn(Optional.of(procType));
        when(taskRepository.findByProcedureTypeIdOrderByOrderIndexAsc(procId)).thenReturn(List.of(task));
        when(fieldI18nRepository.findByProcedureTypeId(procId)).thenReturn(List.of());

        var result = service.listFieldTranslations(procId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).taskTitle()).isEqualTo("Form Task");
    }

    @Test
    void deleteFieldTranslation_shouldDeleteWhenFound() {
        UUID procId = UUID.randomUUID();
        ProcedureTaskFieldI18nEntity translation = new ProcedureTaskFieldI18nEntity();
        translation.setId(UUID.randomUUID());
        translation.setFieldId("name");
        translation.setLocale("es-ES");

        when(fieldI18nRepository.findByProcedureTypeId(procId)).thenReturn(List.of(translation));

        service.deleteFieldTranslation(procId, "name", "es-ES");

        verify(fieldI18nRepository).delete(translation);
    }

    // ===== Helper Methods =====

    private UUID createProcedureId() {
        return UUID.randomUUID();
    }

    private ProcedureEntity createProcedure(CaseStatus status) {
        return createProcedureWithIds(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), status);
    }

    private ProcedureEntity createProcedureWithIds(UUID procId, UUID typeId, UUID ownerId, CaseStatus status) {
        ProcedureEntity proc = new ProcedureEntity();
        proc.setId(procId);
        proc.setProcedureTypeId(typeId);
        proc.setOwnerId(ownerId);
        proc.setStatus(status);
        proc.setTitle("Test Case");
        proc.setCreatedAt(Instant.now().minusSeconds(86400));
        proc.setUpdatedAt(Instant.now());
        proc.setSubmittedAt(Instant.now().minusSeconds(3600));
        return proc;
    }

    private ProcedureEntity createProcedureWithDates(CaseStatus status, Instant createdAt, Instant updatedAt) {
        ProcedureEntity proc = new ProcedureEntity();
        proc.setId(UUID.randomUUID());
        proc.setProcedureTypeId(UUID.randomUUID());
        proc.setOwnerId(UUID.randomUUID());
        proc.setStatus(status);
        proc.setTitle("Test Case");
        proc.setCreatedAt(createdAt);
        proc.setUpdatedAt(updatedAt);
        proc.setSubmittedAt(createdAt);
        return proc;
    }

    private ProcedureTypeEntity createProcedureType(String title) {
        return createProcedureTypeWithId(UUID.randomUUID(), title);
    }

    private ProcedureTypeEntity createProcedureTypeWithId(UUID id, String title) {
        ProcedureTypeEntity type = new ProcedureTypeEntity();
        type.setId(id);
        type.setTitle(title);
        type.setDescription("Test description");
        type.setUnit("Test Unit");
        type.setDeadlineDays(10);
        type.setStatus("active");
        return type;
    }

    private UserEntity createUser(UUID id, String email) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setEmail(email);
        user.setDisplayName(email);
        user.setRoles(Set.of("ROLE_CITIZEN"));
        user.setActive(true);
        return user;
    }

    private ProcedureTypeI18nEntity createTranslation(UUID procId, String locale, String title) {
        ProcedureTypeI18nEntity entity = new ProcedureTypeI18nEntity();
        entity.setId(UUID.randomUUID());
        entity.setProcedureTypeId(procId);
        entity.setLocale(locale);
        entity.setTitle(title);
        entity.setDescription("Desc");
        entity.setUnit("Unit");
        return entity;
    }

    private ProcedureTaskEntity createTask(UUID procId, int orderIndex, String title) {
        ProcedureTaskEntity task = new ProcedureTaskEntity();
        task.setId(UUID.randomUUID());
        task.setProcedureTypeId(procId);
        task.setOrderIndex(orderIndex);
        task.setTitle(title);
        task.setType(TaskType.FORM);
        return task;
    }
}
