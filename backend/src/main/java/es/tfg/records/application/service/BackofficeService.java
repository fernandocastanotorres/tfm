package es.tfg.records.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskFieldI18nEntity;
import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.infrastructure.persistence.entity.CaseTimelineEventEntity;
import es.tfg.records.infrastructure.persistence.repository.CaseTimelineEventJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.DocumentJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskFieldI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BackofficeService {

    private final ProcedureJpaRepository procedureRepository;
    private final ProcedureTypeJpaRepository procedureTypeRepository;
    private final ProcedureTypeI18nJpaRepository procedureTypeI18nRepository;
    private final ProcedureTaskFieldI18nJpaRepository fieldI18nRepository;
    private final ProcedureTaskJpaRepository taskRepository;
    private final DocumentJpaRepository documentRepository;
    private final CaseTimelineEventJpaRepository timelineRepository;
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public BackofficeService(ProcedureJpaRepository procedureRepository,
                             ProcedureTypeJpaRepository procedureTypeRepository,
                              ProcedureTypeI18nJpaRepository procedureTypeI18nRepository,
                              ProcedureTaskFieldI18nJpaRepository fieldI18nRepository,
                              ProcedureTaskJpaRepository taskRepository,
                              DocumentJpaRepository documentRepository,
                              CaseTimelineEventJpaRepository timelineRepository,
                              UserJpaRepository userRepository,
                              PasswordEncoder passwordEncoder,
                              ObjectMapper objectMapper) {
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
        this.procedureTypeI18nRepository = procedureTypeI18nRepository;
        this.fieldI18nRepository = fieldI18nRepository;
        this.taskRepository = taskRepository;
        this.documentRepository = documentRepository;
        this.timelineRepository = timelineRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
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
        List<CaseAttachmentDto> attachments = documentRepository.findByProcedureId(procedure.getId()).stream()
                .map(doc -> new CaseAttachmentDto(
                        doc.getId(),
                        doc.getName(),
                        doc.getMimeType(),
                        doc.getSize(),
                        "Sistema",
                        doc.getUploadedAt(),
                        "SIGNED".equals(doc.getStatus())))
                .toList();
        return new BackofficeDtos.AdminCaseDetail(
                procedure.getId(),
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
                            procedure.getSubmittedAt() == null ? null : procedure.getSubmittedAt().plusSeconds(86400L * Math.max(1, type == null ? 10 : type.getDeadlineDays())),
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
                .filter(p -> p.getUpdatedAt() != null && p.getUpdatedAt().isAfter(Instant.now().minusSeconds(86400)))
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
        return toUserDto(userRepository.save(user));
    }

    @Transactional
    public BackofficeDtos.BackofficeUser updateUser(UUID id, BackofficeDtos.UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER", id.toString()));
        user.setEmail(request.email());
        user.setDisplayName(request.email());
        user.setRoles(toRoleSet(request.roles()));
        user.setActive(request.isActive());
        return toUserDto(userRepository.save(user));
    }

    @Transactional
    public BackofficeDtos.BackofficeUser toggleUserStatus(UUID id, boolean active) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER", id.toString()));
        user.setActive(active);
        return toUserDto(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<BackofficeDtos.ManagedProcedure> listProcedures() {
        return procedureTypeRepository.findAll().stream()
                .map(this::toManagedProcedure)
                .toList();
    }

    @Transactional
    public BackofficeDtos.ManagedProcedure createProcedure(BackofficeDtos.ProcedureRequest request) {
        ProcedureTypeEntity entity = new ProcedureTypeEntity();
        entity.setId(UUID.randomUUID());
        applyProcedureRequest(entity, request);
        ProcedureTypeEntity saved = procedureTypeRepository.save(entity);
        replaceTasks(saved.getId(), request.tasks(), request.formSchema());
        return toManagedProcedure(saved);
    }

    @Transactional
    public BackofficeDtos.ManagedProcedure updateProcedure(UUID id, BackofficeDtos.ProcedureRequest request) {
        ProcedureTypeEntity entity = procedureTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE_TYPE", id.toString()));
        applyProcedureRequest(entity, request);
        ProcedureTypeEntity saved = procedureTypeRepository.save(entity);
        replaceTasks(saved.getId(), request.tasks(), request.formSchema());
        return toManagedProcedure(saved);
    }

    @Transactional
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

    private String priority(ProcedureEntity procedure) {
        return procedure.getSubmittedAt() != null && procedure.getSubmittedAt().isBefore(Instant.now().minusSeconds(86400)) ? "urgent" : "normal";
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
        return new BackofficeDtos.BackofficeUser(user.getId(), user.getEmail(), user.getRoles().stream().sorted().toList(), user.getCreatedAt(), null, user.isActive());
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
                entity.getId(), entity.getTitle(), entity.getDescription(), entity.getTitle(), entity.getStatus(), entity.getUnit(),
                entity.getDeadlineDays(), entity.getFeeAmount(), entity.getCreatedAt(), entity.getUpdatedAt(), tasks.stream().map(this::toTaskConfig).toList(), formSchema);
    }

    private BackofficeDtos.ProcedureTaskConfig toTaskConfig(ProcedureTaskEntity task) {
        return new BackofficeDtos.ProcedureTaskConfig(task.getId(), task.getTitle(), task.getType().name(), task.getDescription(), task.getOrderIndex(), "ROLE_TRAMITADOR");
    }

    private void applyProcedureRequest(ProcedureTypeEntity entity, BackofficeDtos.ProcedureRequest request) {
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setStatus(request.status());
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
