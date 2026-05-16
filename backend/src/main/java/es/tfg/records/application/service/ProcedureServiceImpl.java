package es.tfg.records.application.service;

import es.tfg.records.application.dto.ProcedureItem;
import es.tfg.records.application.dto.ProcedureTaskDto;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.mapper.ProcedureTypeMapper;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Implementation of procedure catalog use cases.
 * Provides access to available procedure types and their task schemas.
 */
@Service
public class ProcedureServiceImpl implements ProcedureService {

    private final ProcedureTypeRepository procedureTypeRepository;
    private final ProcedureCatalogI18nService procedureCatalogI18nService;

    public ProcedureServiceImpl(ProcedureTypeRepository procedureTypeRepository,
                                ProcedureCatalogI18nService procedureCatalogI18nService) {
        this.procedureTypeRepository = procedureTypeRepository;
        this.procedureCatalogI18nService = procedureCatalogI18nService;
    }

    @Override
    public List<ProcedureItem> listAllProcedures() {
        return procedureTypeRepository.findAll().stream()
                .map(this::toLocalizedProcedureItem)
                .toList();
    }

    @Override
    public ProcedureItem getProcedureBySlug(String slug) {
        return toLocalizedProcedureItem(findProcedureByIdentifier(slug));
    }

    @Override
    public List<ProcedureTaskDto> getFormSchema(String slug) {
        ProcedureType procedureType = findProcedureBySlug(slug);

        return procedureType.getTasks().stream()
                .filter(task -> task.getType() != null && task.getType().name().equals("FORM"))
                .map(ProcedureTypeMapper::toProcedureTaskDto)
                .toList();
    }

    @Override
    public List<ProcedureTaskDto> getTaskSchema(String slug, String taskId) {
        ProcedureType procedureType = findProcedureBySlug(slug);

        return procedureType.getTasks().stream()
                .filter(task -> task.getId().toString().equals(taskId))
                .map(ProcedureTypeMapper::toProcedureTaskDto)
                .toList();
    }

    private ProcedureType findProcedureBySlug(String slug) {
        return findProcedureByIdentifier(slug);
    }

    private ProcedureType findProcedureByIdentifier(String identifier) {
        try {
            UUID id = UUID.fromString(identifier);
            return procedureTypeRepository.findAll().stream()
                    .filter(pt -> pt.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE", identifier));
        } catch (IllegalArgumentException ignored) {
            // Not UUID, fallback to stable slug
        }

        return procedureTypeRepository.findAll().stream()
                .filter(pt -> toSlug(pt.getTitle()).equals(identifier))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE", identifier));
    }

    private List<ProcedureTaskDto> mapTasks(List<ProcedureTask> tasks) {
        if (tasks == null) return List.of();
        return tasks.stream()
                .map(ProcedureTypeMapper::toProcedureTaskDto)
                .toList();
    }

    private ProcedureItem toLocalizedProcedureItem(ProcedureType procedureType) {
        List<ProcedureTaskDto> localizedTasks = procedureType.getTasks() == null
                ? List.of()
                : procedureType.getTasks().stream()
                .map(task -> {
                    ProcedureTaskDto base = ProcedureTypeMapper.toProcedureTaskDto(task);
                    return new ProcedureTaskDto(
                            base.id(),
                            base.type(),
                            procedureCatalogI18nService.localizeTaskTitle(procedureType, task),
                            procedureCatalogI18nService.localizeTaskDescription(procedureType, task),
                            base.fields(),
                            base.uploadRequirements()
                    );
                })
                .toList();

        return new ProcedureItem(
                procedureType.getId().toString(),
                toSlug(procedureType.getTitle()),
                procedureCatalogI18nService.localizeProcedureTitle(procedureType),
                procedureCatalogI18nService.localizeProcedureDescription(procedureType),
                procedureType.getFeeAmount(),
                procedureType.getDeadlineDays(),
                procedureType.getStatus(),
                procedureCatalogI18nService.localizeProcedureUnit(procedureType),
                localizedTasks
        );
    }

    /**
     * Converts a procedure title to a URL-friendly slug.
     * E.g., "License Application" -> "license-application"
     */
    private String toSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
