package es.tfg.records.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfWriter;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SummaryDocumentService {

    private static final Logger log = LoggerFactory.getLogger(SummaryDocumentService.class);

    private final ProcedureTypeRepository procedureTypeRepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final SignatureService signatureService;
    private final PublicSignatureVerificationService publicSignatureVerificationService;
    private final RegistryService registryService;
    private final ObjectMapper objectMapper;

    public SummaryDocumentService(ProcedureTypeRepository procedureTypeRepository,
                                  DocumentRepository documentRepository,
                                  FileStorageService fileStorageService,
                                  SignatureService signatureService,
                                  PublicSignatureVerificationService publicSignatureVerificationService,
                                  RegistryService registryService,
                                  ObjectMapper objectMapper) {
        this.procedureTypeRepository = procedureTypeRepository;
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.signatureService = signatureService;
        this.publicSignatureVerificationService = publicSignatureVerificationService;
        this.registryService = registryService;
        this.objectMapper = objectMapper;
    }

    public Document generateAndStoreSummary(Procedure procedure) {
        log.info("Generating summary document for case: {}", procedure.getId());

        List<Document> caseDocs = documentRepository.findByProcedureId(procedure.getId());
        String unitCode = procedure.getUnitCode() != null ? procedure.getUnitCode() : "GEN";

        byte[] pdfContent = generateSummaryPdf(procedure, caseDocs);

        String signedExtension = "pdf";
        byte[] signedContent;
        try {
            signedContent = signatureService.signDocument(pdfContent, "application/pdf");
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign summary document", e);
        }
        String storagePath = fileStorageService.storeBytes(procedure.getId(), signedExtension, signedContent);

        String exitNumber = registryService.generateExitNumber(unitCode, Instant.now());

        Document summaryDoc = new Document();
        summaryDoc.setId(UUID.randomUUID());
        summaryDoc.setProcedureId(procedure.getId());
        summaryDoc.setName("Documento Resumen del Expediente.pdf");
        summaryDoc.setMimeType("application/pdf");
        summaryDoc.setSize(signedContent.length);
        summaryDoc.setVersion(1);
        summaryDoc.setStatus(DocumentStatus.SIGNED);
        summaryDoc.setStoragePath(storagePath);
        summaryDoc.setSignedStoragePath(storagePath);
        summaryDoc.setSignedMimeType("application/pdf");
        summaryDoc.setSignedSize((long) signedContent.length);
        summaryDoc.setSignedAt(Instant.now());
        summaryDoc.setExitNumber(exitNumber);
        summaryDoc.setGenerated(true);
        summaryDoc.setUploadedAt(Instant.now());

        Document saved = documentRepository.save(summaryDoc);
        publicSignatureVerificationService.registerSignedDocument(saved, signedContent);

        log.info("Summary document stored for case: {} with exit number: {}", procedure.getId(), exitNumber);
        return saved;
    }

    private byte[] generateSummaryPdf(Procedure procedure, List<Document> caseDocs) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        com.lowagie.text.Document lowagieDoc = new com.lowagie.text.Document();
        PdfWriter.getInstance(lowagieDoc, output);
        lowagieDoc.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLUE);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.DARK_GRAY);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

        lowagieDoc.add(new Paragraph("DOCUMENTO RESUMEN DEL EXPEDIENTE", titleFont));
        lowagieDoc.add(new Paragraph(" "));
        lowagieDoc.add(new Chunk("NRE: ", labelFont));
        lowagieDoc.add(new Chunk(procedure.getEntryNumber() != null ? procedure.getEntryNumber() : "Pendiente", bodyFont));
        lowagieDoc.add(new Paragraph(" "));

        String submittedAt = procedure.getSubmittedAt() == null
                ? "No enviado"
                : DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                .withZone(ZoneId.of("Europe/Madrid"))
                .format(procedure.getSubmittedAt());

        lowagieDoc.add(new Chunk("Fecha de presentacion: ", labelFont));
        lowagieDoc.add(new Chunk(submittedAt, bodyFont));
        lowagieDoc.add(new Paragraph(" "));
        lowagieDoc.add(new Chunk("Unidad tramitadora: ", labelFont));
        lowagieDoc.add(new Chunk(procedure.getAssignedUnit() != null ? procedure.getAssignedUnit() : "No asignada", bodyFont));
        lowagieDoc.add(new Paragraph(" "));
        lowagieDoc.add(new Chunk("Titulo: ", labelFont));
        lowagieDoc.add(new Chunk(procedure.getTitle() != null ? procedure.getTitle() : "", bodyFont));
        lowagieDoc.add(new Paragraph(" "));
        lowagieDoc.add(new Paragraph(" "));

        Map<String, String> fieldLabels = loadFieldLabels(procedure.getProcedureTypeId());

        Map<String, Object> formData = deserializeFormData(procedure.getFormData());
        if (formData != null && !formData.isEmpty()) {
            lowagieDoc.add(new Paragraph("DATOS DEL FORMULARIO", sectionFont));
            lowagieDoc.add(new Paragraph(" "));
            for (Map.Entry<String, Object> entry : formData.entrySet()) {
                String label = fieldLabels.getOrDefault(entry.getKey(), entry.getKey());
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                lowagieDoc.add(new Chunk(label + ": ", labelFont));
                lowagieDoc.add(new Chunk(value, bodyFont));
                lowagieDoc.add(new Paragraph(" "));
            }
            lowagieDoc.add(new Paragraph(" "));
        }

        List<Document> attachments = caseDocs.stream()
                .filter(d -> !d.isGenerated())
                .toList();
        if (!attachments.isEmpty()) {
            lowagieDoc.add(new Paragraph("RELACION DE ADJUNTOS", sectionFont));
            lowagieDoc.add(new Paragraph(" "));
            for (Document doc : attachments) {
                StringBuilder attachmentLine = new StringBuilder();
                attachmentLine.append("- ").append(doc.getName());
                attachmentLine.append(" (").append(formatSize(doc.getSize())).append(")");
                String regNumber = doc.getExitNumber() != null ? doc.getExitNumber() : procedure.getEntryNumber();
                if (regNumber != null) {
                    if (doc.getExitNumber() != null) {
                        attachmentLine.append(" — Nº salida: ").append(regNumber);
                    } else {
                        attachmentLine.append(" — Nº entrada: ").append(regNumber);
                    }
                }
                lowagieDoc.add(new Chunk(attachmentLine.toString(), bodyFont));
                lowagieDoc.add(new Paragraph(" "));
            }
            lowagieDoc.add(new Paragraph(" "));
        }

        if (procedure.getEntryNumber() != null) {
            lowagieDoc.add(new Paragraph("REGISTRO DE ENTRADA", sectionFont));
            lowagieDoc.add(new Paragraph(" "));
            lowagieDoc.add(new Chunk("Numero: ", labelFont));
            lowagieDoc.add(new Chunk(procedure.getEntryNumber(), bodyFont));
            lowagieDoc.add(new Paragraph(" "));
            lowagieDoc.add(new Chunk("Fecha: ", labelFont));
            lowagieDoc.add(new Chunk(submittedAt, bodyFont));
            lowagieDoc.add(new Paragraph(" "));
        }

        lowagieDoc.add(new Paragraph(" "));
        lowagieDoc.add(new Paragraph("Documento generado y firmado por la Sede Electronica.", bodyFont));

        String issuedAt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                .withZone(ZoneId.of("Europe/Madrid"))
                .format(Instant.now());
        lowagieDoc.add(new Paragraph("Emitido: " + issuedAt + " (Europe/Madrid)", bodyFont));

        lowagieDoc.close();
        return output.toByteArray();
    }

    private Map<String, String> loadFieldLabels(UUID procedureTypeId) {
        return procedureTypeRepository.findById(procedureTypeId)
                .map(ProcedureType::getTasks)
                .orElseGet(List::of)
                .stream()
                .filter(t -> t.getType() == TaskType.FORM)
                .map(ProcedureTask::getFormSchema)
                .filter(Objects::nonNull)
                .map(this::parseFieldLabels)
                .flatMap(m -> m.entrySet().stream())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a
                ));
    }

    private Map<String, String> parseFieldLabels(String formSchemaJson) {
        try {
            List<Map<String, Object>> fields = objectMapper.readValue(formSchemaJson,
                    new TypeReference<List<Map<String, Object>>>() {});
            return fields.stream()
                    .filter(f -> f.get("id") != null)
                    .collect(Collectors.toMap(
                            f -> f.get("id").toString(),
                            f -> f.get("label") != null ? f.get("label").toString() : f.get("id").toString(),
                            (a, b) -> a
                    ));
        } catch (Exception e) {
            log.warn("Failed to parse form schema JSON: {}", e.getMessage());
            return Map.of();
        }
    }

    private Map<String, Object> deserializeFormData(String raw) {
        if (raw == null || raw.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize formData: {}", e.getMessage());
            return Map.of();
        }
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }
        if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        }
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}
