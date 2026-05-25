package es.tfg.records.application.service;

import es.tfg.records.application.exception.AccessDeniedException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.RecordsException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Service to generate ENI-compliant .enidoc exchange packages.
 * Produces a ZIP containing PDF documents, detached CMS signatures (.xsig),
 * and an index.xml valid against the official ENI XSD schema (NTI-2011).
 */
@Service
public class EniPackagerService {

    private static final Logger log = LoggerFactory.getLogger(EniPackagerService.class);

    private static final DateTimeFormatter ENI_DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    private final ProcedureJpaRepository procedureRepository;
    private final ProcedureTypeJpaRepository procedureTypeRepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final SignatureService signatureService;

    public EniPackagerService(ProcedureJpaRepository procedureRepository,
                               ProcedureTypeJpaRepository procedureTypeRepository,
                               DocumentRepository documentRepository,
                               FileStorageService fileStorageService,
                               SignatureService signatureService) {
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.signatureService = signatureService;
    }

    /**
     * Generates an ENI-compliant .enidoc ZIP package for a completed case.
     *
     * @param caseId  the procedure UUID
     * @param ownerId the citizen UUID (ownership check)
     * @return ZIP bytes ready for HTTP download
     */
    @Transactional(readOnly = true)
    public byte[] generateEniDoc(UUID caseId, UUID ownerId) {
        ProcedureEntity procedure = procedureRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("PROC", caseId.toString()));

        if (!procedure.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("case", caseId.toString());
        }

        if (procedure.getStatus() != CaseStatus.APPROVED && procedure.getStatus() != CaseStatus.REJECTED) {
            throw new IllegalStateException("ENI package can only be generated for resolved cases. Current status: " + procedure.getStatus());
        }

        ProcedureTypeEntity type = procedureTypeRepository.findById(procedure.getProcedureTypeId()).orElse(null);
        List<Document> documents = documentRepository.findByProcedureId(caseId);

        if (documents.isEmpty()) {
            throw new ConflictException("PROC", "Cannot generate ENI package without attached documents", "NO_DOCUMENTS");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            String timestamp = ENI_DATE_FMT.format(Instant.now().atOffset(ZoneOffset.UTC));
            String caseRef = "EXP-" + caseId.toString().substring(0, 8).toUpperCase();

            for (Document doc : documents) {
                byte[] content = readDocumentContent(caseId, doc);
                zos.putNextEntry(new ZipEntry("documents/" + sanitizeFileName(doc.getName())));
                zos.write(content);
                zos.closeEntry();

                if (doc.getStatus() == DocumentStatus.SIGNED) {
                    byte[] detachedSig = signatureService.generateDetachedSignature(content);
                    String sigName = sanitizeFileName(doc.getName()).replaceFirst("\\.[^.]+$", "") + ".xsig";
                    zos.putNextEntry(new ZipEntry("signatures/" + sigName));
                    zos.write(detachedSig);
                    zos.closeEntry();
                }
            }

            byte[] receiptContent = generateReceiptContent(procedure, type);
            zos.putNextEntry(new ZipEntry("justificante.txt"));
            zos.write(receiptContent);
            zos.closeEntry();

            String indexXml = buildIndexXml(procedure, type, documents, timestamp, caseRef);
            validateAgainstXsd(indexXml);
            zos.putNextEntry(new ZipEntry("index.xml"));
            zos.write(indexXml.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            zos.closeEntry();

            zos.finish();
            log.info("ENI package generated for case {} ({} documents, {} bytes)", caseId, documents.size(), baos.size());
            return baos.toByteArray();
        } catch (RecordsException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate ENI package for case " + caseId, e);
        }
    }

    private byte[] readDocumentContent(UUID caseId, Document doc) {
        List<String> candidates = Stream.of(
                        doc.getStoragePath(),
                        doc.getSignedStoragePath(),
                        doc.getOriginalStoragePath())
                .filter(path -> path != null && !path.isBlank())
                .toList();

        if (candidates.isEmpty()) {
            throw new ConflictException(
                    "PROC",
                    "Cannot generate ENI package because one or more documents have no storage path",
                    "MISSING_DOCUMENT_FILE"
            );
        }

        for (String candidate : candidates) {
            byte[] fromCaseFolder = tryRead(() -> fileStorageService.openStream(caseId, candidate));
            if (fromCaseFolder != null) {
                return fromCaseFolder;
            }

            byte[] fromRelativePath = tryRead(() -> fileStorageService.openStreamByPath(candidate));
            if (fromRelativePath != null) {
                return fromRelativePath;
            }

            byte[] fromCasePrefixedPath = tryRead(() -> fileStorageService.openStreamByPath(caseId + "/" + candidate));
            if (fromCasePrefixedPath != null) {
                return fromCasePrefixedPath;
            }

            byte[] fromAnyCase = tryRead(() -> fileStorageService.openStreamAnyCase(candidate));
            if (fromAnyCase != null) {
                return fromAnyCase;
            }
        }

        log.warn("ENIDOC generation could not resolve storage artifact for document {} in case {}. Candidates: {}",
                doc.getId(), caseId, candidates);

        throw new ConflictException(
                "PROC",
                "Cannot generate ENI package because one or more document files are missing in storage",
                "MISSING_DOCUMENT_FILE"
        );
    }

    @FunctionalInterface
    private interface StreamSupplier {
        InputStream open();
    }

    private byte[] tryRead(StreamSupplier supplier) {
        try (InputStream is = supplier.open()) {
            return readAllBytes(is);
        } catch (ResourceNotFoundException | IOException ex) {
            return null;
        }
    }

    private String buildIndexXml(ProcedureEntity procedure, ProcedureTypeEntity type,
                                  List<Document> documents, String timestamp, String caseRef) {
        String typeTitle = type != null ? escapeXml(type.getTitle()) : "Procedimiento";
        String typeDescription = type != null ? escapeXml(type.getDescription()) : "";
        String unit = procedure.getAssignedUnit() != null ? escapeXml(procedure.getAssignedUnit())
                : (type != null ? escapeXml(type.getUnit()) : "");
        String statusLabel = mapStatusToEni(procedure.getStatus());
        String issuedAt = procedure.getUpdatedAt() != null
                ? ENI_DATE_FMT.format(procedure.getUpdatedAt().atOffset(ZoneOffset.UTC))
                : timestamp;

        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<eni:Documento xmlns:eni=\"http://administracionelectronica.gob.es/ENI/XSD/v1.0\" \n");
        sb.append("  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n");
        sb.append("  xsi:schemaLocation=\"http://administracionelectronica.gob.es/ENI/XSD/v1.0 eni-documento.xsd\">\n");

        sb.append("  <eni:Metadatos>\n");
        sb.append("    <eni:Identificador>").append(caseRef).append("</eni:Identificador>\n");
        sb.append("    <eni:TipoDocumento>").append(mapProcedureToEniType(type)).append("</eni:TipoDocumento>\n");
        sb.append("    <eni:Titulo>").append(typeTitle).append("</eni:Titulo>\n");
        sb.append("    <eni:Descripcion>").append(typeDescription).append("</eni:Descripcion>\n");
        sb.append("    <eni:Emisor>\n");
        sb.append("      <eni:Nombre>").append(unit).append("</eni:Nombre>\n");
        sb.append("      <eni:Identificador>").append("sede.local</eni:Identificador>\n");
        sb.append("    </eni:Emisor>\n");
        sb.append("    <eni:FechaEmision>").append(issuedAt).append("</eni:FechaEmision>\n");
        sb.append("    <eni:Estado>").append(statusLabel).append("</eni:Estado>\n");
        sb.append("    <eni:VersionNTI>ENI-NTI-2011</eni:VersionNTI>\n");
        sb.append("    <eni:ExpedienteAsociado>\n");
        sb.append("      <eni:Identificador>").append(caseRef).append("</eni:Identificador>\n");
        sb.append("      <eni:CodigoOficina>").append(unit).append("</eni:CodigoOficina>\n");
        sb.append("    </eni:ExpedienteAsociado>\n");
        sb.append("  </eni:Metadatos>\n");

        sb.append("  <eni:Documento>\n");
        for (Document doc : documents) {
            String fileName = sanitizeFileName(doc.getName());
            String mimeType = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
            String docHash = computeSha256Hash(doc);
            String docTimestamp = doc.getUploadedAt() != null
                    ? ENI_DATE_FMT.format(doc.getUploadedAt().atOffset(ZoneOffset.UTC))
                    : timestamp;

            sb.append("    <eni:Contenido>\n");
            sb.append("      <eni:Identificador>").append(doc.getId()).append("</eni:Identificador>\n");
            sb.append("      <eni:NombreFichero>").append(escapeXml(fileName)).append("</eni:NombreFichero>\n");
            sb.append("      <eni:TipoMIME>").append(escapeXml(mimeType)).append("</eni:TipoMIME>\n");
            sb.append("      <eni:Tamano>").append(doc.getSize()).append("</eni:Tamano>\n");
            sb.append("      <eni:Hash>").append(docHash).append("</eni:Hash>\n");
            sb.append("      <eni:AlgoritmoHash>SHA-256</eni:AlgoritmoHash>\n");
            sb.append("      <eni:FechaInclusion>").append(docTimestamp).append("</eni:FechaInclusion>\n");
            if (doc.getStatus() == DocumentStatus.SIGNED) {
                sb.append("      <eni:Firma>\n");
                sb.append("        <eni:TipoFirma>PAdES</eni:TipoFirma>\n");
                sb.append("        <eni:FormatoFirma>CMS/PKCS7</eni:FormatoFirma>\n");
                String sigName = fileName.replaceFirst("\\.[^.]+$", "") + ".xsig";
                sb.append("        <eni:FicheroFirma>").append("signatures/" + escapeXml(sigName)).append("</eni:FicheroFirma>\n");
                sb.append("      </eni:Firma>\n");
            }
            sb.append("    </eni:Contenido>\n");
        }
        sb.append("  </eni:Documento>\n");

        sb.append("</eni:Documento>");
        return sb.toString();
    }

    void validateAgainstXsd(String xml) {
        try (InputStream xsdInputStream = new ClassPathResource("eni/xsd/eni-documento.xsd").getInputStream()) {
            SchemaFactory factory = SchemaFactory.newInstance(javax.xml.XMLConstants.W3C_XML_SCHEMA_NS_URI);
            Schema schema = factory.newSchema(new StreamSource(xsdInputStream));
            Validator validator = schema.newValidator();
            Source xmlSource = new StreamSource(new java.io.StringReader(xml));
            validator.validate(xmlSource);
            log.info("ENI index.xml validated successfully against eni-documento.xsd");
        } catch (Exception e) {
            log.error("ENI index.xml validation FAILED against eni-documento.xsd: {}", e.getMessage());
            throw new RuntimeException("ENI index.xml validation failed: " + e.getMessage(), e);
        }
    }

    private String mapProcedureToEniType(ProcedureTypeEntity type) {
        if (type == null) return "TD99";
        String title = type.getTitle().toLowerCase();
        if (title.contains("licencia") || title.contains("urbanismo")) return "TD01";
        if (title.contains("certificado") || title.contains("certificacion")) return "TD02";
        if (title.contains("empadronamiento") || title.contains("domicilio")) return "TD03";
        return "TD99";
    }

    private String mapStatusToEni(CaseStatus status) {
        return switch (status) {
            case APPROVED -> "Resuelto";
            case REJECTED -> "Rechazado";
            default -> status.name();
        };
    }

    private String computeSha256Hash(Document doc) {
        try (InputStream is = fileStorageService.openStreamByPath(doc.getStoragePath())) {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int n;
            while ((n = is.read(buffer)) != -1) {
                md.update(buffer, 0, n);
            }
            byte[] digest = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("Failed to compute hash for document {}: {}", doc.getId(), e.getMessage());
            return "N/D";
        }
    }

    private byte[] readAllBytes(InputStream is) throws java.io.IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = is.read(buffer)) != -1) {
            baos.write(buffer, 0, n);
        }
        return baos.toByteArray();
    }

    private byte[] generateReceiptContent(ProcedureEntity procedure, ProcedureTypeEntity type) {
        String typeTitle = type != null ? type.getTitle() : "Procedimiento";
        String status = procedure.getStatus() != null ? procedure.getStatus().name() : "DESCONOCIDO";
        String issuedAt = procedure.getUpdatedAt() != null
                ? ENI_DATE_FMT.format(procedure.getUpdatedAt().atOffset(ZoneOffset.UTC))
                : "N/D";

        return ("Justificante de Expediente Electronico\n"
                + "========================================\n"
                + "Identificador: " + procedure.getId() + "\n"
                + "Tipo: " + typeTitle + "\n"
                + "Estado: " + status + "\n"
                + "Fecha emision: " + issuedAt + "\n"
                + "Unidad: " + (procedure.getAssignedUnit() != null ? procedure.getAssignedUnit() : "N/D") + "\n"
                + "Generado por Sede Electronica (ENI-NTI-2011)\n").getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String sanitizeFileName(String name) {
        if (name == null) return "documento";
        return name.replaceAll("[^a-zA-Z0-9._\\-\\u00C0-\\u024F ]", "_");
    }

    private String escapeXml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
