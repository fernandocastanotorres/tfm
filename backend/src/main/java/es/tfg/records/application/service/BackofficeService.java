package es.tfg.records.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.dto.CaseAttachmentDto;
import es.tfg.records.application.dto.CaseStatusResponse;
import es.tfg.records.application.dto.CaseTimelineEventDto;
import es.tfg.records.application.dto.PagedResponse;
import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeI18nEntity;
import org.springframework.cache.annotation.CacheEvict;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskFieldI18nEntity;
import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.infrastructure.persistence.entity.CaseTimelineEventEntity;
import es.tfg.records.infrastructure.persistence.repository.CaseTimelineEventJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.DocumentJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.DocumentVerificationJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskFieldI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import es.tfg.records.infrastructure.audit.AuditService;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.flowable.bpmn.model.BpmnModel;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.SequenceFlow;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BackofficeService {

    private static final long SECONDS_PER_DAY = 86400L;
    private static final List<String> WORKFLOW_STATE_ORDER = List.of(
            "DRAFT",
            "SUBMITTED",
            "IN_REVIEW",
            "RESUBMITTED",
            "AMENDMENT_REQUIRED",
            "APPROVED",
            "REJECTED"
    );
    private static final Map<String, String> WORKFLOW_STATE_LABELS = Map.ofEntries(
            Map.entry("DRAFT", "Borrador"),
            Map.entry("SUBMITTED", "Presentado"),
            Map.entry("IN_REVIEW", "En revision"),
            Map.entry("RESUBMITTED", "Reenviado"),
            Map.entry("AMENDMENT_REQUIRED", "Subsanacion requerida"),
            Map.entry("APPROVED", "Aprobado"),
            Map.entry("REJECTED", "Rechazado")
    );
    private static final Map<String, List<String>> WORKFLOW_TRANSITIONS = Map.ofEntries(
            Map.entry("DRAFT", List.of("SUBMITTED")),
            Map.entry("SUBMITTED", List.of("IN_REVIEW", "AMENDMENT_REQUIRED", "APPROVED", "REJECTED")),
            Map.entry("IN_REVIEW", List.of("AMENDMENT_REQUIRED", "APPROVED", "REJECTED")),
            Map.entry("AMENDMENT_REQUIRED", List.of("RESUBMITTED", "REJECTED")),
            Map.entry("RESUBMITTED", List.of("IN_REVIEW", "APPROVED", "REJECTED")),
            Map.entry("APPROVED", List.of()),
            Map.entry("REJECTED", List.of())
    );

    private final ProcedureJpaRepository procedureRepository;
    private final ProcedureTypeJpaRepository procedureTypeRepository;
    private final ProcedureTypeI18nJpaRepository procedureTypeI18nRepository;
    private final ProcedureTaskFieldI18nJpaRepository fieldI18nRepository;
    private final ProcedureTaskJpaRepository taskRepository;
    private final DocumentJpaRepository documentRepository;
    private final DocumentVerificationJpaRepository documentVerificationRepository;
    private final CaseTimelineEventJpaRepository timelineRepository;
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;
    private final HistoryService historyService;
    private final RepositoryService repositoryService;
    private final TaskService taskService;

    public BackofficeService(ProcedureJpaRepository procedureRepository,
                              ProcedureTypeJpaRepository procedureTypeRepository,
                               ProcedureTypeI18nJpaRepository procedureTypeI18nRepository,
                               ProcedureTaskFieldI18nJpaRepository fieldI18nRepository,
                                ProcedureTaskJpaRepository taskRepository,
                                DocumentJpaRepository documentRepository,
                                DocumentVerificationJpaRepository documentVerificationRepository,
                                CaseTimelineEventJpaRepository timelineRepository,
                                UserJpaRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                ObjectMapper objectMapper,
                                AuditService auditService,
                                HistoryService historyService,
                                RepositoryService repositoryService,
                                TaskService taskService) {
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
        this.procedureTypeI18nRepository = procedureTypeI18nRepository;
        this.fieldI18nRepository = fieldI18nRepository;
        this.taskRepository = taskRepository;
        this.documentRepository = documentRepository;
        this.documentVerificationRepository = documentVerificationRepository;
        this.timelineRepository = timelineRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
        this.historyService = historyService;
        this.repositoryService = repositoryService;
        this.taskService = taskService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<BackofficeDtos.AdminCaseItem> listCases(int page, int size, String status) {
        int clampedPage = Math.max(0, page);
        int clampedSize = Math.min(Math.max(1, size), 100);
        Page<ProcedureEntity> result = procedureRepository.findAll(PageRequest.of(clampedPage, clampedSize));
        Map<UUID, ProcedureTypeEntity> types = procedureTypeRepository.findAll().stream()
                .collect(Collectors.toMap(ProcedureTypeEntity::getId, Function.identity()));
        List<BackofficeDtos.AdminCaseItem> items = result.getContent().stream()
                .filter(procedure -> status == null || status.isBlank() || procedure.getStatus() == parseStatus(status))
                .map(procedure -> toAdminCaseItem(procedure, types.get(procedure.getProcedureTypeId())))
                .toList();

        return new PagedResponse<>(items, clampedPage, clampedSize, result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public BackofficeDtos.AdminCaseDetail getCaseDetail(UUID id) {
        ProcedureEntity procedure = findProcedure(id);
        ProcedureTypeEntity type = procedureTypeRepository.findById(procedure.getProcedureTypeId()).orElse(null);
        UserEntity citizen = userRepository.findById(procedure.getOwnerId()).orElse(null);
        String uploader = citizen != null ? citizen.getEmail() : "Desconocido";
        List<CaseAttachmentDto> attachments = documentRepository.findByProcedureId(procedure.getId()).stream()
                .map(doc -> new CaseAttachmentDto(
                        doc.getId(),
                        doc.getName(),
                        doc.getMimeType(),
                        doc.getSize(),
                        uploader,
                        doc.getUploadedAt(),
                        "SIGNED".equals(doc.getStatus()),
                        doc.getOriginalStoragePath() != null,
                        doc.getSignedStoragePath() != null,
                        documentVerificationRepository.findByDocumentId(doc.getId()).map(v -> v.getCsvCode()).orElse(null)))
                .toList();
        return new BackofficeDtos.AdminCaseDetail(
                procedure.getId(),
                procedure.getProcedureTypeId(),
                typeTitle(type),
                procedure.getStatus().name(),
                procedure.getCreatedAt(),
                procedure.getUpdatedAt(),
                procedure.getTitle(),
                type == null ? "" : type.getDescription(),
                currentTask(procedure, type),
                procedure.getAssignedUnit() != null ? procedure.getAssignedUnit() : typeUnit(type),
                null,
                citizen == null ? "Ciudadano" : citizen.getEmail(),
                citizen == null ? "" : citizen.getEmail(),
                caseTimeline(procedure),
                attachments,
                parseFormData(procedure.getFormData())
        );
    }

    @Transactional(readOnly = true)
    public BackofficeDtos.CaseWorkflowGraph getCaseWorkflowGraph(UUID id) {
        ProcedureEntity procedure = findProcedure(id);
        String currentStatus = procedure.getStatus().name();

        if (procedure.getProcessInstanceId() != null && !procedure.getProcessInstanceId().isBlank()) {
            BackofficeDtos.CaseWorkflowGraph graph = buildWorkflowGraphFromFlowable(procedure);
            if (graph != null) {
                return graph;
            }
        }

        Set<String> visitedStates = new HashSet<>();
        visitedStates.add("DRAFT");
        if (procedure.getSubmittedAt() != null) {
            visitedStates.add("SUBMITTED");
        }

        timelineRepository.findByProcedureIdOrderByDateAsc(procedure.getId()).forEach(event -> {
            String inferredStatus = inferStatusFromTimelineEvent(event.getDescription());
            if (inferredStatus != null) {
                visitedStates.add(inferredStatus);
            }
        });
        visitedStates.add(currentStatus);

        Set<String> reachableStates = new HashSet<>(WORKFLOW_TRANSITIONS.getOrDefault(currentStatus, List.of()));

        List<BackofficeDtos.CaseWorkflowNode> nodes = WORKFLOW_STATE_ORDER.stream()
                .map(state -> new BackofficeDtos.CaseWorkflowNode(
                        state,
                        WORKFLOW_STATE_LABELS.getOrDefault(state, state),
                        categoryForState(state, currentStatus, visitedStates, reachableStates),
                        WORKFLOW_STATE_ORDER.indexOf(state),
                        visitedStates.contains(state),
                        state.equals(currentStatus),
                        reachableStates.contains(state)
                ))
                .toList();

        List<BackofficeDtos.CaseWorkflowTransition> transitions = WORKFLOW_TRANSITIONS.entrySet().stream()
                .flatMap(entry -> entry.getValue().stream().map(target -> {
                    boolean fromVisited = visitedStates.contains(entry.getKey());
                    boolean toVisited = visitedStates.contains(target);
                    boolean candidate = entry.getKey().equals(currentStatus);
                    return new BackofficeDtos.CaseWorkflowTransition(
                            entry.getKey(),
                            target,
                            null,
                            fromVisited && toVisited,
                            candidate
                    );
                }))
                .toList();

        return new BackofficeDtos.CaseWorkflowGraph(procedure.getId(), currentStatus, nodes, transitions);
    }

    private BackofficeDtos.CaseWorkflowGraph buildWorkflowGraphFromFlowable(ProcedureEntity procedure) {
        var historicProcess = historyService.createHistoricProcessInstanceQuery()
                .processInstanceId(procedure.getProcessInstanceId())
                .singleResult();
        if (historicProcess == null) {
            return null;
        }

        String processDefinitionId = historicProcess.getProcessDefinitionId();
        if (processDefinitionId == null || processDefinitionId.isBlank()) {
            return null;
        }

        BpmnModel model = repositoryService.getBpmnModel(processDefinitionId);
        if (model == null || model.getMainProcess() == null) {
            return null;
        }

        Set<String> visitedNodeIds = historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(procedure.getProcessInstanceId())
                .list()
                .stream()
                .map(activity -> activity.getActivityId())
                .filter(activityId -> activityId != null && !activityId.isBlank())
                .collect(Collectors.toSet());

        Set<String> currentNodeIds = taskService.createTaskQuery()
                .processInstanceId(procedure.getProcessInstanceId())
                .active()
                .list()
                .stream()
                .map(Task::getTaskDefinitionKey)
                .filter(taskKey -> taskKey != null && !taskKey.isBlank())
                .collect(Collectors.toSet());

        Set<String> reachableNodeIds = new HashSet<>();
        for (String nodeId : currentNodeIds) {
            FlowElement element = model.getMainProcess().getFlowElement(nodeId, true);
            if (element != null) {
                model.getMainProcess().findFlowElementsOfType(SequenceFlow.class, true).stream()
                        .filter(sequenceFlow -> nodeId.equals(sequenceFlow.getSourceRef()))
                        .forEach(sequenceFlow -> reachableNodeIds.add(sequenceFlow.getTargetRef()));
            }
        }

        List<FlowElement> flowElements = model.getMainProcess().getFlowElements().stream().toList();
        Map<String, Integer> orderById = new LinkedHashMap<>();
        int index = 0;
        for (FlowElement element : flowElements) {
            if (element.getId() != null && !element.getId().isBlank()) {
                orderById.putIfAbsent(element.getId(), index++);
            }
        }

        List<BackofficeDtos.CaseWorkflowNode> nodes = flowElements.stream()
                .filter(element -> element.getId() != null && !element.getId().isBlank())
                .filter(element -> !(element instanceof SequenceFlow))
                .map(element -> {
                    String elementId = element.getId();
                    String label = (element.getName() == null || element.getName().isBlank()) ? elementId : element.getName();
                    boolean isCurrent = currentNodeIds.contains(elementId);
                    boolean isVisited = visitedNodeIds.contains(elementId);
                    boolean isReachable = reachableNodeIds.contains(elementId);
                    String category = isCurrent ? "current" : (isReachable ? "next" : (isVisited ? "visited" : "idle"));
                    return new BackofficeDtos.CaseWorkflowNode(
                            elementId,
                            label,
                            category,
                            orderById.getOrDefault(elementId, 0),
                            isVisited,
                            isCurrent,
                            isReachable
                    );
                })
                .toList();

        List<BackofficeDtos.CaseWorkflowTransition> transitions = model.getMainProcess()
                .findFlowElementsOfType(SequenceFlow.class, true)
                .stream()
                .map(sequenceFlow -> {
                    boolean visited = visitedNodeIds.contains(sequenceFlow.getSourceRef())
                            && visitedNodeIds.contains(sequenceFlow.getTargetRef());
                    boolean candidate = currentNodeIds.contains(sequenceFlow.getSourceRef());
                    return new BackofficeDtos.CaseWorkflowTransition(
                            sequenceFlow.getSourceRef(),
                            sequenceFlow.getTargetRef(),
                            sequenceFlow.getName(),
                            visited,
                            candidate
                    );
                })
                .toList();

        String current = currentNodeIds.isEmpty()
                ? procedure.getStatus().name()
                : currentNodeIds.stream().sorted().collect(Collectors.joining(", "));

        return new BackofficeDtos.CaseWorkflowGraph(procedure.getId(), current, nodes, transitions);
    }

    @Transactional
    public CaseStatusResponse updateCaseStatus(UUID id, String status) {
        ProcedureEntity procedure = findProcedure(id);
        procedure.setStatus(parseStatus(status));
        ProcedureEntity saved = procedureRepository.save(procedure);
        addTimelineEvent(saved.getId(), "Cambio de estado", "Backoffice actualizo estado a: " + saved.getStatus().name());
        return new CaseStatusResponse(saved.getId(), saved.getStatus().name(), saved.getUpdatedAt(), currentTask(saved, null));
    }

    @Transactional(readOnly = true)
    public List<BackofficeDtos.PendingTask> pendingTasks() {
        Map<UUID, ProcedureTypeEntity> types = procedureTypeRepository.findAll().stream()
                .collect(Collectors.toMap(ProcedureTypeEntity::getId, Function.identity()));
        return procedureRepository.findAll().stream()
                .filter(procedure -> procedure.getStatus() == CaseStatus.SUBMITTED
                        || procedure.getStatus() == CaseStatus.IN_REVIEW
                        || procedure.getStatus() == CaseStatus.RESUBMITTED)
                .map(procedure -> {
                    ProcedureTypeEntity type = types.get(procedure.getProcedureTypeId());
                    return new BackofficeDtos.PendingTask(
                            "task-" + procedure.getId(),
                            procedure.getId(),
                            procedure.getTitle(),
                            currentTask(procedure, type),
                            "REVIEW",
                            null,
                            procedure.getSubmittedAt() == null ? null : procedure.getSubmittedAt().plusSeconds(SECONDS_PER_DAY * Math.max(1, type == null ? 10 : type.getDeadlineDays())),
                            procedure.getSubmittedAt() == null ? procedure.getCreatedAt() : procedure.getSubmittedAt(),
                            priority(procedure)
                    );
                })
                .toList();
    }

    @Transactional
    public CaseStatusResponse resolveTask(UUID caseId, BackofficeDtos.TaskResolutionRequest request) {
        String action = request.action() == null ? "approve" : request.action();
        CaseStatus nextStatus = switch (action) {
            case "reject" -> CaseStatus.REJECTED;
            case "request_amendment" -> CaseStatus.AMENDMENT_REQUIRED;
            default -> CaseStatus.APPROVED;
        };
        return updateCaseStatus(caseId, nextStatus.name());
    }

    @Transactional(readOnly = true)
    public BackofficeDtos.DashboardStats dashboardStats() {
        List<ProcedureEntity> procedures = procedureRepository.findAll();
        long pending = procedures.stream().filter(p -> p.getStatus() == CaseStatus.SUBMITTED).count();
        long inProgress = procedures.stream().filter(p -> p.getStatus() == CaseStatus.IN_REVIEW || p.getStatus() == CaseStatus.RESUBMITTED).count();
        long completedToday = procedures.stream()
                .filter(p -> p.getStatus() == CaseStatus.APPROVED || p.getStatus() == CaseStatus.REJECTED)
                .filter(p -> p.getUpdatedAt() != null && p.getUpdatedAt().isAfter(Instant.now().minusSeconds(SECONDS_PER_DAY)))
                .count();
        return new BackofficeDtos.DashboardStats(procedures.size(), pending, inProgress, completedToday, 0, "N/D");
    }

    @Transactional(readOnly = true)
    public BackofficeDtos.DashboardReport dashboardReport(LocalDate from, LocalDate to) {
        LocalDate resolvedTo = to == null ? LocalDate.now(ZoneOffset.UTC) : to;
        LocalDate resolvedFrom = from == null ? resolvedTo.minusDays(29) : from;
        if (resolvedFrom.isAfter(resolvedTo)) {
            LocalDate swap = resolvedFrom;
            resolvedFrom = resolvedTo;
            resolvedTo = swap;
        }

        Instant fromInclusive = resolvedFrom.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toExclusive = resolvedTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<ProcedureEntity> procedures = procedureRepository.findAll().stream()
                .filter(procedure -> !procedure.getCreatedAt().isBefore(fromInclusive))
                .filter(procedure -> procedure.getCreatedAt().isBefore(toExclusive))
                .toList();

        Map<UUID, ProcedureTypeEntity> typesById = procedureTypeRepository.findAll().stream()
                .collect(Collectors.toMap(ProcedureTypeEntity::getId, Function.identity()));

        long pending = procedures.stream().filter(this::isPendingStatus).count();
        long inProgress = procedures.stream().filter(this::isInProgressStatus).count();
        long resolved = procedures.stream().filter(this::isResolvedStatus).count();
        long overdue = procedures.stream().filter(p -> isOverdue(p, typesById.get(p.getProcedureTypeId()))).count();

        List<Double> resolutionHours = procedures.stream()
                .filter(this::isResolvedStatus)
                .map(this::resolutionHours)
                .flatMapToDouble(java.util.OptionalDouble::stream)
                .boxed()
                .toList();

        double averageResolutionHours = resolutionHours.isEmpty()
                ? 0D
                : resolutionHours.stream().mapToDouble(Double::doubleValue).average().orElse(0D);

        long resolvedWithSla = procedures.stream()
                .filter(this::isResolvedStatus)
                .filter(procedure -> isWithinSla(procedure, typesById.get(procedure.getProcedureTypeId())))
                .count();
        double slaComplianceRate = resolved == 0 ? 0D : (resolvedWithSla * 100D) / resolved;

        return new BackofficeDtos.DashboardReport(
                new BackofficeDtos.DashboardReportSummary(
                        procedures.size(),
                        pending,
                        inProgress,
                        resolved,
                        overdue,
                        round2(slaComplianceRate),
                        round2(averageResolutionHours)
                ),
                buildStatusDistribution(procedures),
                buildProcedureTypeDistribution(procedures, typesById),
                buildAssignedUnitDistribution(procedures, typesById),
                buildDailyTrend(procedures, resolvedFrom, resolvedTo)
        );
    }

    @Transactional(readOnly = true)
    public List<BackofficeDtos.BackofficeUser> listUsers() {
        return userRepository.findAll().stream().map(this::toUserDto).toList();
    }

    @Transactional
    public BackofficeDtos.BackofficeUser createUser(BackofficeDtos.CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("AUTH", "EMAIL_EXISTS");
        }
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail(request.email());
        user.setDisplayName(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(toRoleSet(request.roles()));
        user.setActive(request.isActive());
        UserEntity saved = userRepository.save(user);
        auditService.record(AuditAction.CREATE, "USER", saved.getId(), AuditResult.SUCCESS,
                "User created with roles: " + String.join(", ", saved.getRoles()));
        return toUserDto(saved);
    }

    @Transactional
    public BackofficeDtos.BackofficeUser updateUser(UUID id, BackofficeDtos.UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER", id.toString()));
        List<String> oldRoles = user.getRoles().stream().sorted().toList();
        boolean oldActive = user.isActive();
        user.setEmail(request.email());
        user.setDisplayName(request.email());
        user.setRoles(toRoleSet(request.roles()));
        user.setActive(request.isActive());
        UserEntity saved = userRepository.save(user);
        List<String> newRoles = saved.getRoles().stream().sorted().toList();
        StringBuilder details = new StringBuilder("User updated: ");
        if (!oldRoles.equals(newRoles)) {
            details.append("roles changed from [").append(String.join(", ", oldRoles))
                    .append("] to [").append(String.join(", ", newRoles)).append("]; ");
        }
        if (oldActive != saved.isActive()) {
            details.append("status changed from ").append(oldActive ? "active" : "inactive")
                    .append(" to ").append(saved.isActive() ? "active" : "inactive");
        }
        auditService.record(AuditAction.UPDATE, "USER", saved.getId(), AuditResult.SUCCESS, details.toString());
        return toUserDto(saved);
    }

    @Transactional
    public BackofficeDtos.BackofficeUser toggleUserStatus(UUID id, boolean active) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER", id.toString()));
        boolean previousActive = user.isActive();
        user.setActive(active);
        UserEntity saved = userRepository.save(user);
        auditService.record(AuditAction.UPDATE, "USER", saved.getId(), AuditResult.SUCCESS,
                "User status changed from " + (previousActive ? "active" : "inactive")
                        + " to " + (active ? "active" : "inactive"));
        return toUserDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BackofficeDtos.ManagedProcedure> listProcedures() {
        return procedureTypeRepository.findAll().stream()
                .map(this::toManagedProcedure)
                .toList();
    }

    @Transactional
    @CacheEvict(value = "procedure-catalog", allEntries = true)
    public BackofficeDtos.ManagedProcedure createProcedure(BackofficeDtos.ProcedureRequest request) {
        ProcedureTypeEntity entity = new ProcedureTypeEntity();
        entity.setId(UUID.randomUUID());
        applyProcedureRequest(entity, request);
        ProcedureTypeEntity saved = procedureTypeRepository.save(entity);
        replaceTasks(saved.getId(), request.tasks(), request.formSchema());
        return toManagedProcedure(saved);
    }

    @Transactional
    @CacheEvict(value = "procedure-catalog", allEntries = true)
    public BackofficeDtos.ManagedProcedure updateProcedure(UUID id, BackofficeDtos.ProcedureRequest request) {
        ProcedureTypeEntity entity = procedureTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE_TYPE", id.toString()));
        applyProcedureRequest(entity, request);
        ProcedureTypeEntity saved = procedureTypeRepository.save(entity);
        replaceTasks(saved.getId(), request.tasks(), request.formSchema());
        return toManagedProcedure(saved);
    }

    @Transactional
    @CacheEvict(value = "procedure-catalog", allEntries = true)
    public BackofficeDtos.ManagedProcedure toggleProcedureStatus(UUID id, String status) {
        ProcedureTypeEntity entity = procedureTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE_TYPE", id.toString()));
        entity.setStatus(status);
        return toManagedProcedure(procedureTypeRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<BackofficeDtos.ProcedureTranslation> listProcedureTranslations(UUID procedureTypeId) {
        ensureProcedureTypeExists(procedureTypeId);
        return procedureTypeI18nRepository.findByProcedureTypeIdOrderByLocaleAsc(procedureTypeId).stream()
                .map(this::toProcedureTranslation)
                .toList();
    }

    @Transactional
    public BackofficeDtos.ProcedureTranslation upsertProcedureTranslation(UUID procedureTypeId, BackofficeDtos.ProcedureTranslationRequest request) {
        ensureProcedureTypeExists(procedureTypeId);
        String locale = normalizeLocale(request.locale());
        ProcedureTypeI18nEntity entity = procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureTypeId, locale)
                .orElseGet(() -> {
                    ProcedureTypeI18nEntity created = new ProcedureTypeI18nEntity();
                    created.setId(UUID.randomUUID());
                    created.setProcedureTypeId(procedureTypeId);
                    created.setLocale(locale);
                    return created;
                });

        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setUnit(request.unit());
        return toProcedureTranslation(procedureTypeI18nRepository.save(entity));
    }

    private ProcedureEntity findProcedure(UUID id) {
        return procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PROC", id.toString()));
    }

    private void ensureProcedureTypeExists(UUID id) {
        if (!procedureTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("PROCEDURE_TYPE", id.toString());
        }
    }

    private BackofficeDtos.AdminCaseItem toAdminCaseItem(ProcedureEntity procedure, ProcedureTypeEntity type) {
        return new BackofficeDtos.AdminCaseItem(
                procedure.getId(), typeTitle(type), procedure.getStatus().name(), procedure.getCreatedAt(), procedure.getUpdatedAt(),
                procedure.getTitle(), type == null ? "" : type.getDescription(), procedure.getAssignedUnit() != null ? procedure.getAssignedUnit() : typeUnit(type),
                null, userRepository.findById(procedure.getOwnerId()).map(UserEntity::getEmail).orElse("Ciudadano"), currentTask(procedure, type), priority(procedure));
    }

    private String currentTask(ProcedureEntity procedure, ProcedureTypeEntity type) {
        if (procedure.getStatus() == CaseStatus.SUBMITTED || procedure.getStatus() == CaseStatus.RESUBMITTED) return "Revision de documentacion";
        if (procedure.getStatus() == CaseStatus.IN_REVIEW) return "Resolucion administrativa";
        if (procedure.getStatus() == CaseStatus.AMENDMENT_REQUIRED) return "Subsanacion requerida";
        return "";
    }

    private String categoryForState(String state,
                                    String currentStatus,
                                    Set<String> visitedStates,
                                    Set<String> reachableStates) {
        if (state.equals(currentStatus)) {
            return "current";
        }
        if (reachableStates.contains(state)) {
            return "next";
        }
        if (visitedStates.contains(state)) {
            return "visited";
        }
        return "idle";
    }

    private String inferStatusFromTimelineEvent(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        String marker = "Backoffice actualizo estado a:";
        int markerIndex = description.indexOf(marker);
        if (markerIndex < 0) {
            return null;
        }
        String extracted = description.substring(markerIndex + marker.length()).trim().toUpperCase();
        return WORKFLOW_STATE_LABELS.containsKey(extracted) ? extracted : null;
    }

    private String priority(ProcedureEntity procedure) {
        return procedure.getSubmittedAt() != null && procedure.getSubmittedAt().isBefore(Instant.now().minusSeconds(SECONDS_PER_DAY)) ? "urgent" : "normal";
    }

    private String typeTitle(ProcedureTypeEntity type) {
        return type == null ? "Procedimiento" : type.getTitle();
    }

    private String typeUnit(ProcedureTypeEntity type) {
        return type == null ? "" : type.getUnit();
    }

    private CaseStatus parseStatus(String status) {
        String normalized = switch (status.toUpperCase()) {
            case "IN_PROGRESS" -> "IN_REVIEW";
            case "PENDING_AMENDMENT" -> "AMENDMENT_REQUIRED";
            case "RESOLVED" -> "APPROVED";
            default -> status.toUpperCase();
        };
        try {
            return CaseStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResourceNotFoundException("CASE_STATUS", status);
        }
    }

    private Map<String, Object> parseFormData(String formData) {
        if (formData == null || formData.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(formData, new TypeReference<>() {});
        } catch (Exception ignored) {
            return Map.of("raw", formData);
        }
    }

    private List<CaseTimelineEventDto> defaultTimeline(ProcedureEntity procedure) {
        List<CaseTimelineEventDto> events = new ArrayList<>();
        events.add(new CaseTimelineEventDto(UUID.nameUUIDFromBytes((procedure.getId() + "-created").getBytes()), "Expediente creado", procedure.getCreatedAt(), "Alta inicial del expediente"));
        if (procedure.getSubmittedAt() != null) {
            events.add(new CaseTimelineEventDto(UUID.nameUUIDFromBytes((procedure.getId() + "-submitted").getBytes()), "Expediente presentado", procedure.getSubmittedAt(), "El ciudadano presento el expediente"));
        }
        events.add(new CaseTimelineEventDto(UUID.nameUUIDFromBytes((procedure.getId() + "-updated").getBytes()), "Ultima actualizacion", procedure.getUpdatedAt(), "Estado actual: " + procedure.getStatus().name()));
        return events;
    }

    private List<CaseTimelineEventDto> caseTimeline(ProcedureEntity procedure) {
        List<CaseTimelineEventDto> persisted = timelineRepository.findByProcedureIdOrderByDateAsc(procedure.getId()).stream()
                .map(event -> new CaseTimelineEventDto(event.getId(), event.getTitle(), event.getDate(), event.getDescription()))
                .toList();
        return persisted.isEmpty() ? defaultTimeline(procedure) : persisted;
    }

    private void addTimelineEvent(UUID procedureId, String title, String description) {
        CaseTimelineEventEntity event = new CaseTimelineEventEntity();
        event.setId(UUID.randomUUID());
        event.setProcedureId(procedureId);
        event.setTitle(title);
        event.setDescription(description);
        event.setDate(Instant.now());
        timelineRepository.save(event);
    }

    private BackofficeDtos.BackofficeUser toUserDto(UserEntity user) {
        return new BackofficeDtos.BackofficeUser(user.getId(), user.getEmail(), user.getRoles().stream().sorted().toList(), user.getCreatedAt(), user.getLastLogin(), user.isActive());
    }

    private Set<String> toRoleSet(List<String> roles) {
        if (roles == null || roles.isEmpty()) return Set.of("ROLE_TRAMITADOR");
        return Set.copyOf(roles);
    }

    private BackofficeDtos.ManagedProcedure toManagedProcedure(ProcedureTypeEntity entity) {
        List<ProcedureTaskEntity> tasks = taskRepository.findByProcedureTypeIdOrderByOrderIndexAsc(entity.getId());
        List<BackofficeDtos.FormSchemaField> formSchema = tasks.stream()
                .filter(task -> task.getType() == TaskType.FORM)
                .map(ProcedureTaskEntity::getFormSchema)
                .filter(schema -> schema != null && !schema.isBlank())
                .findFirst()
                .map(this::parseFormSchema)
                .orElse(List.of());
        return new BackofficeDtos.ManagedProcedure(
                entity.getId(), entity.getTitle(), entity.getDescription(), entity.getTitle(), entity.getStatus(), entity.getProcessKey(), entity.getUnit(),
                entity.getDeadlineDays(), entity.getFeeAmount(), entity.getCreatedAt(), entity.getUpdatedAt(), tasks.stream().map(this::toTaskConfig).toList(), formSchema);
    }

    private BackofficeDtos.ProcedureTaskConfig toTaskConfig(ProcedureTaskEntity task) {
        return new BackofficeDtos.ProcedureTaskConfig(task.getId(), task.getTitle(), task.getType().name(), task.getDescription(), task.getOrderIndex(), "ROLE_TRAMITADOR");
    }

    private void applyProcedureRequest(ProcedureTypeEntity entity, BackofficeDtos.ProcedureRequest request) {
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setStatus(request.status());
        entity.setProcessKey((request.processKey() == null || request.processKey().isBlank()) ? "simpleCitizenProcedure" : request.processKey().trim());
        entity.setUnit(request.assignedUnit());
        entity.setDeadlineDays(request.deadlineDays());
        entity.setFeeAmount(request.feeAmount());
    }

    private void replaceTasks(UUID procedureTypeId,
                              List<BackofficeDtos.ProcedureTaskConfig> tasks,
                              List<BackofficeDtos.FormSchemaField> formSchema) {
        taskRepository.deleteAll(taskRepository.findByProcedureTypeIdOrderByOrderIndexAsc(procedureTypeId));
        if (tasks == null) return;
        String serializedFormSchema = serializeFormSchema(formSchema);
        tasks.stream().sorted(Comparator.comparingInt(BackofficeDtos.ProcedureTaskConfig::orderIndex)).forEach(task -> {
            ProcedureTaskEntity entity = new ProcedureTaskEntity();
            entity.setId(task.id() == null ? UUID.randomUUID() : task.id());
            entity.setProcedureTypeId(procedureTypeId);
            entity.setTitle(task.title());
            entity.setDescription(task.description());
            entity.setOrderIndex(task.orderIndex());
            entity.setType(TaskType.valueOf(task.type()));
            if (entity.getType() == TaskType.FORM && serializedFormSchema != null) {
                entity.setFormSchema(serializedFormSchema);
            }
            taskRepository.save(entity);
        });
    }

    private List<BackofficeDtos.FormSchemaField> parseFormSchema(String formSchemaJson) {
        try {
            return objectMapper.readValue(formSchemaJson, new TypeReference<>() {});
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private String serializeFormSchema(List<BackofficeDtos.FormSchemaField> formSchema) {
        if (formSchema == null || formSchema.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(formSchema);
        } catch (Exception ignored) {
            return null;
        }
    }

    private BackofficeDtos.ProcedureTranslation toProcedureTranslation(ProcedureTypeI18nEntity entity) {
        return new BackofficeDtos.ProcedureTranslation(
                entity.getId(),
                entity.getProcedureTypeId(),
                entity.getLocale(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getUnit(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private String normalizeLocale(String locale) {
        if (locale == null || locale.isBlank()) {
            throw new ConflictException("PROCEDURE_TYPE_I18N", "LOCALE_REQUIRED");
        }
        return locale.trim();
    }

    private List<BackofficeDtos.DashboardDistributionItem> buildStatusDistribution(List<ProcedureEntity> procedures) {
        return Arrays.stream(CaseStatus.values())
                .map(status -> new BackofficeDtos.DashboardDistributionItem(
                        status.name(),
                        statusLabel(status),
                        procedures.stream().filter(procedure -> procedure.getStatus() == status).count()))
                .toList();
    }

    private List<BackofficeDtos.DashboardDistributionItem> buildProcedureTypeDistribution(
            List<ProcedureEntity> procedures,
            Map<UUID, ProcedureTypeEntity> typesById) {
        Map<String, Long> totals = procedures.stream()
                .collect(Collectors.groupingBy(
                        procedure -> {
                            ProcedureTypeEntity type = typesById.get(procedure.getProcedureTypeId());
                            return type == null ? "Procedimiento" : type.getTitle();
                        },
                        Collectors.counting()));
        return totals.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new BackofficeDtos.DashboardDistributionItem(entry.getKey(), entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<BackofficeDtos.DashboardDistributionItem> buildAssignedUnitDistribution(
            List<ProcedureEntity> procedures,
            Map<UUID, ProcedureTypeEntity> typesById) {
        Map<String, Long> totals = procedures.stream()
                .collect(Collectors.groupingBy(
                        procedure -> {
                            if (procedure.getAssignedUnit() != null && !procedure.getAssignedUnit().isBlank()) {
                                return procedure.getAssignedUnit();
                            }
                            ProcedureTypeEntity type = typesById.get(procedure.getProcedureTypeId());
                            return type == null ? "Sin unidad" : type.getUnit();
                        },
                        Collectors.counting()));
        return totals.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new BackofficeDtos.DashboardDistributionItem(entry.getKey(), entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<BackofficeDtos.DashboardDailyTrendPoint> buildDailyTrend(
            List<ProcedureEntity> procedures,
            LocalDate from,
            LocalDate to) {
        Map<LocalDate, Long> createdByDay = procedures.stream()
                .collect(Collectors.groupingBy(
                        procedure -> procedure.getCreatedAt().atOffset(ZoneOffset.UTC).toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.counting()));

        Map<LocalDate, Long> resolvedByDay = procedures.stream()
                .filter(this::isResolvedStatus)
                .collect(Collectors.groupingBy(
                        procedure -> procedure.getUpdatedAt().atOffset(ZoneOffset.UTC).toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.counting()));

        List<BackofficeDtos.DashboardDailyTrendPoint> trend = new ArrayList<>();
        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            trend.add(new BackofficeDtos.DashboardDailyTrendPoint(
                    cursor,
                    createdByDay.getOrDefault(cursor, 0L),
                    resolvedByDay.getOrDefault(cursor, 0L)
            ));
            cursor = cursor.plusDays(1);
        }
        return trend;
    }

    private boolean isPendingStatus(ProcedureEntity procedure) {
        return procedure.getStatus() == CaseStatus.SUBMITTED;
    }

    private boolean isInProgressStatus(ProcedureEntity procedure) {
        return procedure.getStatus() == CaseStatus.IN_REVIEW
                || procedure.getStatus() == CaseStatus.RESUBMITTED
                || procedure.getStatus() == CaseStatus.AMENDMENT_REQUIRED;
    }

    private boolean isResolvedStatus(ProcedureEntity procedure) {
        return procedure.getStatus() == CaseStatus.APPROVED || procedure.getStatus() == CaseStatus.REJECTED;
    }

    private boolean isOverdue(ProcedureEntity procedure, ProcedureTypeEntity type) {
        if (!isPendingStatus(procedure) && !isInProgressStatus(procedure)) {
            return false;
        }
        Instant start = procedure.getSubmittedAt() == null ? procedure.getCreatedAt() : procedure.getSubmittedAt();
        int deadlineDays = Math.max(1, type == null ? 10 : type.getDeadlineDays());
        return start.plus(deadlineDays, ChronoUnit.DAYS).isBefore(Instant.now());
    }

    private java.util.OptionalDouble resolutionHours(ProcedureEntity procedure) {
        Instant start = procedure.getSubmittedAt() == null ? procedure.getCreatedAt() : procedure.getSubmittedAt();
        if (start == null || procedure.getUpdatedAt() == null) {
            return java.util.OptionalDouble.empty();
        }
        long minutes = ChronoUnit.MINUTES.between(start, procedure.getUpdatedAt());
        return java.util.OptionalDouble.of(minutes / 60D);
    }

    private boolean isWithinSla(ProcedureEntity procedure, ProcedureTypeEntity type) {
        Instant start = procedure.getSubmittedAt() == null ? procedure.getCreatedAt() : procedure.getSubmittedAt();
        if (start == null || procedure.getUpdatedAt() == null) {
            return false;
        }
        int deadlineDays = Math.max(1, type == null ? 10 : type.getDeadlineDays());
        return !start.plus(deadlineDays, ChronoUnit.DAYS).isBefore(procedure.getUpdatedAt());
    }

    private double round2(double value) {
        return Math.round(value * 100D) / 100D;
    }

    private String statusLabel(CaseStatus status) {
        return switch (status) {
            case DRAFT -> "Borrador";
            case SUBMITTED -> "Presentado";
            case IN_REVIEW -> "En revision";
            case AMENDMENT_REQUIRED -> "Subsanacion requerida";
            case RESUBMITTED -> "Reenviado";
            case APPROVED -> "Aprobado";
            case REJECTED -> "Rechazado";
        };
    }

    @Transactional(readOnly = true)
    public TransparencyDtos.AnalyticsReport analyticsReport(LocalDate from, LocalDate to) {
        BackofficeDtos.DashboardReport base = dashboardReport(from, to);

        LocalDate resolvedTo = to == null ? LocalDate.now(ZoneOffset.UTC) : to;
        LocalDate resolvedFrom = from == null ? resolvedTo.minusDays(89) : from;
        if (resolvedFrom.isAfter(resolvedTo)) {
            LocalDate swap = resolvedFrom;
            resolvedFrom = resolvedTo;
            resolvedTo = swap;
        }

        Instant fromInclusive = resolvedFrom.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toExclusive = resolvedTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<ProcedureEntity> procedures = procedureRepository.findAll().stream()
                .filter(p -> !p.getCreatedAt().isBefore(fromInclusive))
                .filter(p -> p.getCreatedAt().isBefore(toExclusive))
                .toList();

        Map<UUID, ProcedureTypeEntity> typesById = procedureTypeRepository.findAll().stream()
                .collect(Collectors.toMap(ProcedureTypeEntity::getId, Function.identity()));

        return new TransparencyDtos.AnalyticsReport(
                base.summary(),
                base.byStatus(),
                base.byProcedureType(),
                base.byAssignedUnit(),
                base.dailyTrend(),
                computeMonthlyTrend(procedures, resolvedFrom, resolvedTo, typesById),
                computeProcedureTypeMetrics(procedures, typesById),
                computeUnitSlaBreakdown(procedures, typesById)
        );
    }

    @Transactional(readOnly = true)
    public byte[] exportAnalyticsPdf(LocalDate from, LocalDate to) {
            TransparencyDtos.AnalyticsReport report = analyticsReport(from, to);
        LocalDate resolvedTo = to == null ? LocalDate.now(ZoneOffset.UTC) : to;
        LocalDate resolvedFrom = from == null ? resolvedTo.minusDays(89) : from;

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            document.add(new Paragraph("Informe de Estadisticas", titleFont));
            document.add(new Paragraph(" "));
            String period = "Periodo: " + resolvedFrom + " a " + resolvedTo;
            document.add(new Paragraph(period, subtitleFont));
            document.add(new Paragraph("Generado: " + java.time.Instant.now().toString(), subtitleFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Resumen General", sectionFont));
            document.add(new Paragraph(" "));

            BackofficeDtos.DashboardReportSummary summary = report.summary();
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(60);
            summaryTable.addCell(new PdfPCell(new Phrase("Total Expedientes", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.valueOf(summary.totalCases()), cellFont)));
            summaryTable.addCell(new PdfPCell(new Phrase("Pendientes", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.valueOf(summary.pendingCases()), cellFont)));
            summaryTable.addCell(new PdfPCell(new Phrase("En Progreso", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.valueOf(summary.inProgressCases()), cellFont)));
            summaryTable.addCell(new PdfPCell(new Phrase("Resueltos", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.valueOf(summary.resolvedCases()), cellFont)));
            summaryTable.addCell(new PdfPCell(new Phrase("Vencidos", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.valueOf(summary.overdueCases()), cellFont)));
            summaryTable.addCell(new PdfPCell(new Phrase("Cumplimiento SLA (%)", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", summary.slaComplianceRate()), cellFont)));
            summaryTable.addCell(new PdfPCell(new Phrase("Tiempo Medio Resolucion (horas)", headerFont)));
            summaryTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", summary.averageResolutionHours()), cellFont)));
            document.add(summaryTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Distribucion por Estado", sectionFont));
            document.add(new Paragraph(" "));
            PdfPTable statusTable = new PdfPTable(3);
            statusTable.setWidthPercentage(70);
            statusTable.addCell(new PdfPCell(new Phrase("Estado", headerFont)));
            statusTable.addCell(new PdfPCell(new Phrase("Clave", headerFont)));
            statusTable.addCell(new PdfPCell(new Phrase("Cantidad", headerFont)));
            for (BackofficeDtos.DashboardDistributionItem item : report.byStatus()) {
                statusTable.addCell(new PdfPCell(new Phrase(item.label(), cellFont)));
                statusTable.addCell(new PdfPCell(new Phrase(item.key(), cellFont)));
                statusTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.count()), cellFont)));
            }
            document.add(statusTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Distribucion por Tipo de Procedimiento", sectionFont));
            document.add(new Paragraph(" "));
            PdfPTable procTable = new PdfPTable(2);
            procTable.setWidthPercentage(70);
            procTable.addCell(new PdfPCell(new Phrase("Tipo de Procedimiento", headerFont)));
            procTable.addCell(new PdfPCell(new Phrase("Cantidad", headerFont)));
            for (BackofficeDtos.DashboardDistributionItem item : report.byProcedureType()) {
                procTable.addCell(new PdfPCell(new Phrase(item.label(), cellFont)));
                procTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.count()), cellFont)));
            }
            document.add(procTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Tendencia Mensual", sectionFont));
            document.add(new Paragraph(" "));
            PdfPTable monthlyTable = new PdfPTable(4);
            monthlyTable.setWidthPercentage(80);
            monthlyTable.addCell(new PdfPCell(new Phrase("Mes", headerFont)));
            monthlyTable.addCell(new PdfPCell(new Phrase("Creados", headerFont)));
            monthlyTable.addCell(new PdfPCell(new Phrase("Resueltos", headerFont)));
            monthlyTable.addCell(new PdfPCell(new Phrase("Tiempo Medio (h)", headerFont)));
            for (TransparencyDtos.MonthlyTrendPoint m : report.monthlyTrend()) {
                monthlyTable.addCell(new PdfPCell(new Phrase(m.month(), cellFont)));
                monthlyTable.addCell(new PdfPCell(new Phrase(String.valueOf(m.createdCases()), cellFont)));
                monthlyTable.addCell(new PdfPCell(new Phrase(String.valueOf(m.resolvedCases()), cellFont)));
                monthlyTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", m.avgResolutionHours()), cellFont)));
            }
            document.add(monthlyTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Metricas por Tipo de Procedimiento", sectionFont));
            document.add(new Paragraph(" "));
            PdfPTable metricsTable = new PdfPTable(5);
            metricsTable.setWidthPercentage(90);
            metricsTable.addCell(new PdfPCell(new Phrase("Tipo", headerFont)));
            metricsTable.addCell(new PdfPCell(new Phrase("Resueltos", headerFont)));
            metricsTable.addCell(new PdfPCell(new Phrase("Media (h)", headerFont)));
            metricsTable.addCell(new PdfPCell(new Phrase("Mediana (h)", headerFont)));
            metricsTable.addCell(new PdfPCell(new Phrase("SLA (%)", headerFont)));
            for (TransparencyDtos.ProcedureTypeMetric m : report.procedureTypeMetrics()) {
                metricsTable.addCell(new PdfPCell(new Phrase(m.procedureType(), cellFont)));
                metricsTable.addCell(new PdfPCell(new Phrase(String.valueOf(m.totalResolved()), cellFont)));
                metricsTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", m.avgResolutionHours()), cellFont)));
                metricsTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", m.medianResolutionHours()), cellFont)));
                metricsTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", m.slaComplianceRate()), cellFont)));
            }
            document.add(metricsTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Cumplimiento SLA por Unidad", sectionFont));
            document.add(new Paragraph(" "));
            PdfPTable slaTable = new PdfPTable(4);
            slaTable.setWidthPercentage(80);
            slaTable.addCell(new PdfPCell(new Phrase("Unidad", headerFont)));
            slaTable.addCell(new PdfPCell(new Phrase("Total Casos", headerFont)));
            slaTable.addCell(new PdfPCell(new Phrase("Resueltos dentro SLA", headerFont)));
            slaTable.addCell(new PdfPCell(new Phrase("Cumplimiento (%)", headerFont)));
            for (TransparencyDtos.UnitSlaBreakdown u : report.unitSlaBreakdown()) {
                slaTable.addCell(new PdfPCell(new Phrase(u.unit(), cellFont)));
                slaTable.addCell(new PdfPCell(new Phrase(String.valueOf(u.totalCases()), cellFont)));
                slaTable.addCell(new PdfPCell(new Phrase(String.valueOf(u.totalResolved()), cellFont)));
                slaTable.addCell(new PdfPCell(new Phrase(String.format("%.2f", u.slaComplianceRate()), cellFont)));
            }
            document.add(slaTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate analytics PDF", e);
        }
    }

    private List<TransparencyDtos.MonthlyTrendPoint> computeMonthlyTrend(
            List<ProcedureEntity> procedures, LocalDate from, LocalDate to,
            Map<UUID, ProcedureTypeEntity> typesById) {
        Map<String, long[]> monthly = new LinkedHashMap<>();
        LocalDate cursor = from.withDayOfMonth(1);
        while (!cursor.isAfter(to)) {
            monthly.put(cursor.toString().substring(0, 7), new long[]{0, 0, 0});
            cursor = cursor.plusMonths(1);
        }

        for (ProcedureEntity p : procedures) {
            String month = p.getCreatedAt().atOffset(ZoneOffset.UTC).toLocalDate().toString().substring(0, 7);
            long[] counts = monthly.computeIfAbsent(month, k -> new long[]{0, 0, 0});
            counts[0]++;
            if (isResolvedStatus(p) && p.getUpdatedAt() != null) {
                counts[1]++;
                counts[2] += ChronoUnit.HOURS.between(
                        p.getSubmittedAt() != null ? p.getSubmittedAt() : p.getCreatedAt(),
                        p.getUpdatedAt());
            }
        }

        return monthly.entrySet().stream()
                .map(e -> {
                    long[] c = e.getValue();
                    double avgHours = c[1] > 0 ? (double) c[2] / c[1] : 0;
                    return new TransparencyDtos.MonthlyTrendPoint(e.getKey(), c[0], c[1], round2(avgHours));
                })
                .toList();
    }

    private List<TransparencyDtos.ProcedureTypeMetric> computeProcedureTypeMetrics(
            List<ProcedureEntity> procedures, Map<UUID, ProcedureTypeEntity> typesById) {
        Map<String, List<ProcedureEntity>> byType = procedures.stream()
                .filter(this::isResolvedStatus)
                .collect(Collectors.groupingBy(
                        p -> {
                            ProcedureTypeEntity t = typesById.get(p.getProcedureTypeId());
                            return t == null ? "Procedimiento" : t.getTitle();
                        }));

        return byType.entrySet().stream()
                .map(e -> {
                    List<ProcedureEntity> resolved = e.getValue();
                    List<Double> hours = resolved.stream()
                            .map(this::resolutionHours)
                            .flatMapToDouble(java.util.OptionalDouble::stream)
                            .boxed()
                            .toList();
                    double avg = hours.isEmpty() ? 0 : hours.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                    double median = median(hours);
                    long withinSla = resolved.stream()
                            .filter(p -> isWithinSla(p, typesById.get(p.getProcedureTypeId())))
                            .count();
                    double slaRate = resolved.isEmpty() ? 0 : (withinSla * 100.0) / resolved.size();
                    return new TransparencyDtos.ProcedureTypeMetric(e.getKey(), resolved.size(), round2(avg), round2(median), round2(slaRate));
                })
                .sorted(Comparator.comparingLong(TransparencyDtos.ProcedureTypeMetric::totalResolved).reversed())
                .toList();
    }

    private List<TransparencyDtos.UnitSlaBreakdown> computeUnitSlaBreakdown(
            List<ProcedureEntity> procedures, Map<UUID, ProcedureTypeEntity> typesById) {
        Map<String, List<ProcedureEntity>> byUnit = procedures.stream()
                .collect(Collectors.groupingBy(
                        p -> {
                            if (p.getAssignedUnit() != null && !p.getAssignedUnit().isBlank()) {
                                return p.getAssignedUnit();
                            }
                            ProcedureTypeEntity t = typesById.get(p.getProcedureTypeId());
                            return t == null ? "Sin unidad" : t.getUnit();
                        }));

        return byUnit.entrySet().stream()
                .map(e -> {
                    List<ProcedureEntity> unitProcedures = e.getValue();
                    long totalResolved = unitProcedures.stream().filter(this::isResolvedStatus).count();
                    long withinSla = unitProcedures.stream()
                            .filter(this::isResolvedStatus)
                            .filter(p -> isWithinSla(p, typesById.get(p.getProcedureTypeId())))
                            .count();
                    double slaRate = totalResolved == 0 ? 0 : (withinSla * 100.0) / totalResolved;
                    return new TransparencyDtos.UnitSlaBreakdown(e.getKey(), unitProcedures.size(), withinSla, totalResolved, round2(slaRate));
                })
                .sorted(Comparator.comparingDouble(TransparencyDtos.UnitSlaBreakdown::slaComplianceRate))
                .toList();
    }

    private double median(List<Double> values) {
        if (values.isEmpty()) return 0;
        List<Double> sorted = values.stream().sorted().toList();
        int mid = sorted.size() / 2;
        return sorted.size() % 2 == 0
                ? (sorted.get(mid - 1) + sorted.get(mid)) / 2.0
                : sorted.get(mid);
    }

    // ===== Field i18n Management =====

    @Transactional(readOnly = true)
    public List<BackofficeDtos.FieldI18nGroup> listFieldTranslations(UUID procedureTypeId) {
        ProcedureTypeEntity procedureType = procedureTypeRepository.findById(procedureTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE_TYPE", procedureTypeId.toString()));

        List<ProcedureTaskEntity> tasks = taskRepository.findByProcedureTypeIdOrderByOrderIndexAsc(procedureTypeId);

        List<BackofficeDtos.FieldI18nGroup> groups = new ArrayList<>();

        for (ProcedureTaskEntity task : tasks) {
            if (task.getFormSchema() == null || task.getFormSchema().isBlank()) {
                continue;
            }

            List<BackofficeDtos.FormSchemaField> fields = parseFormSchema(task.getFormSchema());
            List<ProcedureTaskFieldI18nEntity> allTranslations = fieldI18nRepository
                    .findByProcedureTypeId(procedureTypeId);

            List<BackofficeDtos.FieldI18nEntry> fieldEntries = new ArrayList<>();

            for (BackofficeDtos.FormSchemaField field : fields) {
                for (String locale : List.of("es-ES", "ca-ES", "eu-ES", "gl-ES", "va-ES")) {
                    ProcedureTaskFieldI18nEntity translation = allTranslations.stream()
                            .filter(t -> t.getTaskOrderIndex() == task.getOrderIndex()
                                    && t.getFieldId().equals(field.id())
                                    && t.getLocale().equals(locale))
                            .findFirst()
                            .orElse(null);

                    List<BackofficeDtos.FieldOptionEntry> options = new ArrayList<>();
                    if (translation != null && translation.getOptionsJson() != null) {
                        try {
                            options = objectMapper.readValue(translation.getOptionsJson(),
                                    new TypeReference<List<BackofficeDtos.FieldOptionEntry>>() {});
                        } catch (Exception e) {
                            // ignore
                        }
                    }

                    fieldEntries.add(new BackofficeDtos.FieldI18nEntry(
                            translation != null ? translation.getId() : null,
                            procedureTypeId,
                            task.getOrderIndex(),
                            task.getTitle(),
                            field.id(),
                            field.label(),
                            locale,
                            translation != null ? translation.getName() : field.label(),
                            translation != null ? translation.getPlaceholder() : "",
                            options,
                            translation != null ? translation.getUpdatedAt() : null
                    ));
                }
            }

            groups.add(new BackofficeDtos.FieldI18nGroup(
                    task.getOrderIndex(),
                    task.getTitle(),
                    task.getType() != null ? task.getType().name() : "UNKNOWN",
                    fieldEntries
            ));
        }

        return groups;
    }

    @Transactional
    public BackofficeDtos.FieldI18nEntry upsertFieldTranslation(UUID procedureTypeId,
                                                                 BackofficeDtos.FieldI18nUpsertRequest request) {
        if (request.locale() == null || request.name() == null || request.fieldId() == null) {
            throw new es.tfg.records.application.exception.ValidationException(
                    List.of(new es.tfg.records.application.exception.ValidationException.ValidationError(
                            "request", "locale, name, and fieldId are required")));
        }

        List<ProcedureTaskEntity> tasks = taskRepository.findByProcedureTypeIdOrderByOrderIndexAsc(procedureTypeId);

        ProcedureTaskFieldI18nEntity entity = fieldI18nRepository
                .findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureTypeId, request.taskOrderIndex(), request.fieldId(), request.locale())
                .orElseGet(() -> {
                    ProcedureTaskFieldI18nEntity created = new ProcedureTaskFieldI18nEntity();
                    created.setId(UUID.randomUUID());
                    created.setProcedureTypeId(procedureTypeId);
                    created.setTaskOrderIndex(request.taskOrderIndex());
                    created.setFieldId(request.fieldId());
                    created.setLocale(request.locale());
                    return created;
                });

        entity.setName(request.name());
        entity.setPlaceholder(request.placeholder() != null ? request.placeholder() : "");
        if (request.options() != null) {
            try {
                entity.setOptionsJson(objectMapper.writeValueAsString(request.options()));
            } catch (Exception e) {
                throw new IllegalStateException("Failed to serialize options", e);
            }
        }

        ProcedureTaskFieldI18nEntity saved = fieldI18nRepository.save(entity);

        ProcedureTaskEntity task = tasks.stream()
                .filter(t -> t.getOrderIndex() == saved.getTaskOrderIndex())
                .findFirst()
                .orElse(null);

        String taskTitle = task != null ? task.getTitle() : "";

        List<BackofficeDtos.FieldOptionEntry> options = new ArrayList<>();
        if (saved.getOptionsJson() != null) {
            try {
                options = objectMapper.readValue(saved.getOptionsJson(),
                        new TypeReference<List<BackofficeDtos.FieldOptionEntry>>() {});
            } catch (Exception e) {
                // ignore
            }
        }

        return new BackofficeDtos.FieldI18nEntry(
                saved.getId(),
                procedureTypeId,
                saved.getTaskOrderIndex(),
                taskTitle,
                saved.getFieldId(),
                saved.getName(),
                saved.getLocale(),
                saved.getName(),
                saved.getPlaceholder(),
                options,
                saved.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteFieldTranslation(UUID procedureTypeId, String fieldId, String locale) {
        fieldI18nRepository.findByProcedureTypeId(procedureTypeId).stream()
                .filter(t -> t.getFieldId().equals(fieldId) && t.getLocale().equals(locale))
                .findFirst()
                .ifPresent(fieldI18nRepository::delete);
    }
}
