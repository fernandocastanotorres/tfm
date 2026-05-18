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
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.infrastructure.persistence.entity.CaseTimelineEventEntity;
import es.tfg.records.infrastructure.persistence.repository.CaseTimelineEventJpaRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.security.MessageDigest;
import java.util.*;

/**
 * Implementation of case (expediente) management use cases.
 * Enforces ownership checks, state transitions, and pagination.
 */
@Service
public class CaseServiceImpl implements CaseService {

    private final ProcedureRepository procedureRepository;
    private final ProcedureTypeRepository procedureTypeRepository;
    private final DocumentRepository documentRepository;
    private final CaseTimelineEventJpaRepository timelineRepository;
    private final EniMetadataService eniMetadataService;

    public CaseServiceImpl(ProcedureRepository procedureRepository,
                           ProcedureTypeRepository procedureTypeRepository,
                           DocumentRepository documentRepository,
                           CaseTimelineEventJpaRepository timelineRepository,
                           EniMetadataService eniMetadataService) {
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
        this.documentRepository = documentRepository;
        this.timelineRepository = timelineRepository;
        this.eniMetadataService = eniMetadataService;
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

        List<CaseAttachmentDto> attachments = documentRepository.findByProcedureId(caseId).stream()
                .map(document -> new CaseAttachmentDto(
                        document.getId(),
                        document.getName(),
                        document.getMimeType(),
                        document.getUploadedAt()))
                .toList();

        List<CaseTimelineEventDto> timeline = buildTimeline(procedure);

        return ProcedureMapper.toCaseDetail(
                procedure,
                categoryMap.get(procedure.getProcedureTypeId()),
                "Procedure case detail",
                timeline,
                attachments);
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
        procedure.setAssignedUnit(procedureType.getUnit());
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setFormData(request.formData() != null ? serializeFormData(request.formData()) : null);
        procedure.setSubmittedAt(null);

        Procedure saved = procedureRepository.save(procedure);
        addTimelineEvent(saved.getId(), "Expediente creado", "Se ha creado un nuevo expediente en estado borrador.");
        eniMetadataService.upsertProcedureMetadata(saved);

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
        addTimelineEvent(saved.getId(), "Expediente enviado", "El ciudadano ha presentado el expediente.");
        eniMetadataService.upsertProcedureMetadata(saved);

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
        addTimelineEvent(saved.getId(), "Expediente subsanado", "El ciudadano ha enviado la subsanacion solicitada.");
        eniMetadataService.upsertProcedureMetadata(saved);

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
        addTimelineEvent(saved.getId(), "Cambio de estado", "Nuevo estado: " + saved.getStatus().name());
        eniMetadataService.upsertProcedureMetadata(saved);

        return ProcedureMapper.toCaseStatusResponse(saved, null);
    }

    @Override
    public Resource downloadReceipt(UUID caseId, UUID ownerId) {
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        Document document = new Document();
        PdfWriter.getInstance(document, output);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

        document.add(new Paragraph("Justificante de presentacion de expediente", titleFont));
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Identificador: " + procedure.getId(), bodyFont));
        document.add(new Paragraph("Titulo: " + procedure.getTitle(), bodyFont));
        document.add(new Paragraph("Estado: " + procedure.getStatus().name(), bodyFont));
        String submittedAt = procedure.getSubmittedAt() == null
                ? "No enviado"
                : DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                .withZone(ZoneId.of("Europe/Madrid"))
                .format(procedure.getSubmittedAt());
        document.add(new Paragraph("Fecha de envio: " + submittedAt + " (Europe/Madrid)", bodyFont));
        document.add(new Paragraph("Unidad asignada: " + (procedure.getAssignedUnit() == null ? "No asignada" : procedure.getAssignedUnit()), bodyFont));
        String issuedAt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                .withZone(ZoneId.of("Europe/Madrid"))
                .format(Instant.now());
        document.add(new Paragraph("Emitido: " + issuedAt + " (Europe/Madrid)", bodyFont));
        document.add(new Paragraph(" "));

        String digest = sha256Hex(String.join("|",
                procedure.getId().toString(),
                procedure.getTitle(),
                procedure.getStatus().name(),
                String.valueOf(procedure.getSubmittedAt()),
                String.valueOf(procedure.getAssignedUnit()),
                issuedAt));
        document.add(new Paragraph("Codigo de verificacion (SHA-256): " + digest, bodyFont));
        document.add(new Paragraph("Documento emitido por la Sede Electronica a efectos informativos.", bodyFont));

        document.close();
        return new ByteArrayResource(output.toByteArray());
    }

    private String sha256Hex(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            return "N/A";
        }
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

    private List<CaseTimelineEventDto> buildTimeline(Procedure procedure) {
        List<CaseTimelineEventDto> events = timelineRepository.findByProcedureIdOrderByDateAsc(procedure.getId()).stream()
                .map(event -> new CaseTimelineEventDto(event.getId(), event.getTitle(), event.getDate(), event.getDescription()))
                .toList();

        if (events.isEmpty() && procedure.getUpdatedAt() != null) {
            return List.of(new CaseTimelineEventDto(
                    UUID.nameUUIDFromBytes((procedure.getId().toString() + "-created").getBytes()),
                    "Expediente creado",
                    procedure.getUpdatedAt(),
                    "Se ha creado el expediente en estado borrador."
            ));
        }

        return events;
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
}
