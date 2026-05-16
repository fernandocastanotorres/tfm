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

    public ProcedureServiceImpl(ProcedureTypeRepository procedureTypeRepository) {
        this.procedureTypeRepository = procedureTypeRepository;
    }

    @Override
    public List<ProcedureItem> listAllProcedures() {
        return procedureTypeRepository.findAll().stream()
                .map(pt -> ProcedureTypeMapper.toProcedureItem(pt, mapTasks(pt.getTasks())))
                .toList();
    }

    @Override
    public ProcedureItem getProcedureBySlug(String slug) {
        // Find by matching slug against title (lowercase, hyphenated)
        ProcedureType procedureType = procedureTypeRepository.findAll().stream()
                .filter(pt -> toSlug(pt.getTitle()).equals(slug))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE", slug));

        return ProcedureTypeMapper.toProcedureItem(procedureType, mapTasks(procedureType.getTasks()));
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
        return procedureTypeRepository.findAll().stream()
                .filter(pt -> toSlug(pt.getTitle()).equals(slug))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE", slug));
    }

    private List<ProcedureTaskDto> mapTasks(List<ProcedureTask> tasks) {
        if (tasks == null) return List.of();
        return tasks.stream()
                .map(ProcedureTypeMapper::toProcedureTaskDto)
                .toList();
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
