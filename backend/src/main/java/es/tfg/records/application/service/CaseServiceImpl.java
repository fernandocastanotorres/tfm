package es.tfg.records.application.service;

import es.tfg.records.application.dto.*;
import es.tfg.records.application.exception.AccessDeniedException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.InvalidProcedureException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.mapper.ProcedureMapper;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

/**
 * Implementation of case (expediente) management use cases.
 * Enforces ownership checks, state transitions, and pagination.
 */
@Service
public class CaseServiceImpl implements CaseService {

    private final ProcedureRepository procedureRepository;
    private final ProcedureTypeRepository procedureTypeRepository;

    public CaseServiceImpl(ProcedureRepository procedureRepository,
                           ProcedureTypeRepository procedureTypeRepository) {
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
    }

    @Override
    public PagedResponse<CaseItem> listCases(UUID ownerId, int page, int size, String sort) {
        // Clamp page and size
        int clampedPage = Math.max(0, page);
        int clampedSize = Math.min(Math.max(1, size), 100);

        List<Procedure> procedures = procedureRepository.findByOwnerId(ownerId, clampedPage, clampedSize);
        long totalItems = procedureRepository.countByOwnerId(ownerId);
        int totalPages = (int) Math.ceil((double) totalItems / clampedSize);

        // Build category map from procedure types
        Map<UUID, String> categoryMap = buildCategoryMap();

        List<CaseItem> items = procedures.stream()
                .map(p -> ProcedureMapper.toCaseItem(p, categoryMap.get(p.getProcedureTypeId())))
                .toList();

        return new PagedResponse<>(items, clampedPage, clampedSize, totalItems, totalPages);
    }

    @Override
    public CaseDetail getCaseDetail(UUID caseId, UUID ownerId) {
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);
        Map<UUID, String> categoryMap = buildCategoryMap();

        return ProcedureMapper.toCaseDetail(
                procedure,
                categoryMap.get(procedure.getProcedureTypeId()),
                "Procedure case detail");
    }

    @Override
    public CaseStatusResponse getCaseStatus(UUID caseId, UUID ownerId) {
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);
        return ProcedureMapper.toCaseStatusResponse(procedure, null);
    }

    @Override
    public CaseItem createCase(UUID ownerId, CreateCaseRequest request) {
        UUID procedureTypeId = parseProcedureId(request.procedureId());

        // Verify procedure type exists
        ProcedureType procedureType = procedureTypeRepository.findById(procedureTypeId)
                .orElseThrow(() -> new InvalidProcedureException(request.procedureId()));

        Procedure procedure = new Procedure();
        procedure.setId(UUID.randomUUID());
        procedure.setProcedureTypeId(procedureTypeId);
        procedure.setOwnerId(ownerId);
        procedure.setTitle(procedureType.getTitle());
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setFormData(request.formData() != null ? serializeFormData(request.formData()) : null);
        procedure.setSubmittedAt(null);

        Procedure saved = procedureRepository.save(procedure);

        Map<UUID, String> categoryMap = buildCategoryMap();
        return ProcedureMapper.toCaseItem(saved, categoryMap.get(saved.getProcedureTypeId()));
    }

    @Override
    public CaseStatusResponse submitCase(UUID caseId, UUID ownerId) {
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);

        if (procedure.getStatus() != CaseStatus.DRAFT) {
            throw new ConflictException("PROC", "Cannot submit a case that is not in DRAFT status. Current: " + procedure.getStatus());
        }

        procedure.setStatus(CaseStatus.SUBMITTED);
        procedure.setSubmittedAt(Instant.now());
        Procedure saved = procedureRepository.save(procedure);

        return ProcedureMapper.toCaseStatusResponse(saved, null);
    }

    @Override
    public CaseStatusResponse requestAmendment(UUID caseId, UUID ownerId, CreateCaseRequest request) {
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);

        if (procedure.getStatus() != CaseStatus.AMENDMENT_REQUIRED) {
            throw new ConflictException("PROC", "Can only amend a case in AMENDMENT_REQUIRED status. Current: " + procedure.getStatus());
        }

        procedure.setStatus(CaseStatus.RESUBMITTED);
        if (request.formData() != null) {
            procedure.setFormData(serializeFormData(request.formData()));
        }
        Procedure saved = procedureRepository.save(procedure);

        return ProcedureMapper.toCaseStatusResponse(saved, null);
    }

    @Override
    public CaseStatusResponse updateCaseStatus(UUID caseId, UUID ownerId, String newStatus) {
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);

        CaseStatus status;
        try {
            status = CaseStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new es.tfg.records.application.exception.ValidationException(
                    List.of(new es.tfg.records.application.exception.ValidationException.ValidationError(
                            "status", "Invalid status value: " + newStatus)));
        }

        procedure.setStatus(status);
        Procedure saved = procedureRepository.save(procedure);

        return ProcedureMapper.toCaseStatusResponse(saved, null);
    }

    private Procedure findAndVerifyOwnership(UUID caseId, UUID ownerId) {
        Procedure procedure = procedureRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("PROC", caseId.toString()));

        if (!procedure.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("PROC", caseId.toString());
        }

        return procedure;
    }

    private UUID parseProcedureId(String procedureId) {
        try {
            return UUID.fromString(procedureId);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("PROCEDURE", procedureId);
        }
    }

    private Map<UUID, String> buildCategoryMap() {
        Map<UUID, String> map = new HashMap<>();
        for (ProcedureType pt : procedureTypeRepository.findAll()) {
            map.put(pt.getId(), pt.getTitle());
        }
        return map;
    }

    private String serializeFormData(Map<String, Object> formData) {
        // Simple JSON serialization — in production, use Jackson ObjectMapper
        return formData.toString();
    }
}
