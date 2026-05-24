package es.tfg.records.application.service;

import es.tfg.records.application.dto.DocumentDetail;
import es.tfg.records.application.dto.DocumentItem;
import es.tfg.records.application.exception.AccessDeniedException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.exception.ValidationException;
import es.tfg.records.application.mapper.DocumentMapper;
import es.tfg.records.application.service.SignatureService;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Implementation of document management use cases.
 * Enforces case ownership, state validation, and file upload constraints.
 */
@Service
public class DocumentServiceImpl implements DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentServiceImpl.class);

    // Allowed MIME types for document uploads
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // Max file size: 10MB (matches application.yml config)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    // States that accept document uploads
    private static final Set<CaseStatus> UPLOAD_ACCEPTING_STATES = Set.of(
            CaseStatus.DRAFT,
            CaseStatus.SUBMITTED,
            CaseStatus.IN_REVIEW,
            CaseStatus.AMENDMENT_REQUIRED,
            CaseStatus.RESUBMITTED
    );

    private final DocumentRepository documentRepository;
    private final ProcedureRepository procedureRepository;
    private final FileStorageService fileStorageService;
    private final EniMetadataService eniMetadataService;
    private final SignatureService signatureService;
    private final PublicSignatureVerificationService publicSignatureVerificationService;

    public DocumentServiceImpl(DocumentRepository documentRepository,
                               ProcedureRepository procedureRepository,
                               FileStorageService fileStorageService,
                               EniMetadataService eniMetadataService,
                               SignatureService signatureService,
                               PublicSignatureVerificationService publicSignatureVerificationService) {
        this.documentRepository = documentRepository;
        this.procedureRepository = procedureRepository;
        this.fileStorageService = fileStorageService;
        this.eniMetadataService = eniMetadataService;
        this.signatureService = signatureService;
        this.publicSignatureVerificationService = publicSignatureVerificationService;
    }

    @Override
    public DocumentItem uploadDocument(UUID caseId, UUID ownerId, MultipartFile file) {
        // Validate file
        validateFile(file);

        // Verify case ownership and state
        Procedure procedure = findAndVerifyOwnership(caseId, ownerId);
        verifyCaseAcceptsUploads(procedure);

        // Store file physically via FileStorageService
        String storedFilename = fileStorageService.store(caseId, file);

        Document document = new Document();
        document.setId(UUID.randomUUID());
        document.setProcedureId(caseId);
        document.setName(file.getOriginalFilename());
        document.setMimeType(file.getContentType());
        document.setSize(file.getSize());
        document.setVersion(1);
        document.setStatus(DocumentStatus.PENDING);
        document.setStoragePath(storedFilename);
        document.setOriginalStoragePath(storedFilename);
        document.setOriginalMimeType(file.getContentType());
        document.setOriginalSize(file.getSize());
        document.setUploadedAt(Instant.now());

        Document saved = documentRepository.save(document);
        eniMetadataService.upsertDocumentMetadata(saved);

        if (procedure.getStatus() != CaseStatus.DRAFT && procedure.getStatus() != CaseStatus.AMENDMENT_REQUIRED) {
            signDocumentImmediately(caseId, saved);
        }

        return DocumentMapper.toDocumentItem(saved);
    }

    @Override
    public List<DocumentItem> listDocumentsByCase(UUID caseId, UUID ownerId) {
        findAndVerifyOwnership(caseId, ownerId);

        return documentRepository.findByProcedureId(caseId).stream()
                .map(DocumentMapper::toDocumentItem)
                .toList();
    }

    @Override
    public DocumentDetail getDocumentDetail(UUID procedureUuid, UUID documentId, UUID ownerId) {
        // Verify the procedure is owned by this user
        findAndVerifyOwnership(procedureUuid, ownerId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("DOC", documentId.toString()));

        // Verify the document belongs to the specified procedure
        if (!document.getProcedureId().equals(procedureUuid)) {
            throw new AccessDeniedException("DOC", documentId.toString());
        }

        return DocumentMapper.toDocumentDetail(document);
    }

    @Override
    public void deleteDocument(UUID documentId, UUID ownerId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("DOC", documentId.toString()));

        // Verify ownership
        findAndVerifyOwnership(document.getProcedureId(), ownerId);

        // Delete the physical file from storage
        if (document.getStoragePath() != null) {
            fileStorageService.delete(document.getProcedureId(), document.getStoragePath());
        }

        document.setStatus(DocumentStatus.REJECTED);

        Document saved = documentRepository.save(document);
        eniMetadataService.upsertDocumentMetadata(saved);
    }

    @Override
    public Resource downloadDocument(UUID documentId, UUID ownerId, DocumentDownloadVariant variant) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("DOC", documentId.toString()));

        // Verify the document belongs to a case owned by this user
        Procedure procedure = findAndVerifyOwnership(document.getProcedureId(), ownerId);

        String storagePath = resolveStoragePath(document, variant);
        String filename = resolveFilename(document, variant);
        long size = resolveSize(document, variant);

        // Open streaming input — file is NOT loaded entirely into memory
        InputStream inputStream = fileStorageService.openStream(
                document.getProcedureId(), storagePath);

        return new InputStreamResource(inputStream) {
            @Override
            public String getFilename() {
                return filename;
            }

            @Override
            public long contentLength() {
                return size;
            }
        };
    }

    @Override
    public Resource downloadDocumentForAdmin(UUID documentId, DocumentDownloadVariant variant) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("DOC", documentId.toString()));

        String storagePath = resolveStoragePath(document, variant);
        String filename = resolveFilename(document, variant);
        long size = resolveSize(document, variant);

        InputStream inputStream = fileStorageService.openStream(
                document.getProcedureId(), storagePath);

        return new InputStreamResource(inputStream) {
            @Override
            public String getFilename() {
                return filename;
            }

            @Override
            public long contentLength() {
                return size;
            }
        };
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException(List.of(
                    new ValidationException.ValidationError("file", "File is required")));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException(List.of(
                    new ValidationException.ValidationError("file",
                            "File size exceeds maximum allowed size of 10MB")));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new ValidationException(List.of(
                    new ValidationException.ValidationError("file",
                            "File type not allowed. Allowed types: PDF, JPEG, PNG, GIF, DOC, DOCX")));
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

    private void verifyCaseAcceptsUploads(Procedure procedure) {
        if (!UPLOAD_ACCEPTING_STATES.contains(procedure.getStatus())) {
            throw new ConflictException("DOC",
                    "Case is not accepting document uploads. Current status: " + procedure.getStatus(),
                    "CASE_NOT_ACCEPTING");
        }
    }

    private void signDocumentImmediately(UUID caseId, Document document) {
        try {
            if (document.getSignedStoragePath() != null) {
                return;
            }

            if (document.getOriginalStoragePath() == null) {
                document.setOriginalStoragePath(document.getStoragePath());
            }
            if (document.getOriginalMimeType() == null) {
                document.setOriginalMimeType(document.getMimeType());
            }
            if (document.getOriginalSize() == null) {
                document.setOriginalSize(document.getSize());
            }

            byte[] originalContent;
            String sourcePath = document.getOriginalStoragePath() != null ? document.getOriginalStoragePath() : document.getStoragePath();
            try (InputStream is = fileStorageService.openStream(caseId, sourcePath)) {
                originalContent = is.readAllBytes();
            }

            byte[] signedContent = signatureService.signDocument(originalContent, document.getOriginalMimeType() != null ? document.getOriginalMimeType() : document.getMimeType());
            String signedStoragePath = fileStorageService.storeBytes(caseId, "pdf", signedContent);

            String newName = document.getName().endsWith(".pdf") ? document.getName() : document.getName() + ".pdf";
            document.setName(newName);
            document.setSignedStoragePath(signedStoragePath);
            document.setSignedMimeType("application/pdf");
            document.setSignedSize((long) signedContent.length);
            document.setSignedAt(Instant.now());
            document.setMimeType("application/pdf");
            document.setStoragePath(signedStoragePath);

            document.setStatus(DocumentStatus.SIGNED);
            document.setSize((long) signedContent.length);
            documentRepository.save(document);
            publicSignatureVerificationService.registerSignedDocument(document, signedContent);

            log.info("Document {} signed immediately on upload for case: {}", document.getId(), caseId);
        } catch (Exception e) {
            log.error("Failed to sign document {} on upload for case {}: {}", document.getId(), caseId, e.getMessage());
        }
    }

    private String resolveStoragePath(Document document, DocumentDownloadVariant variant) {
        if (variant == DocumentDownloadVariant.ORIGINAL) {
            if (document.getOriginalStoragePath() == null) {
                throw new ResourceNotFoundException("DOC", "Original document artifact is not available");
            }
            return document.getOriginalStoragePath();
        }

        if (variant == DocumentDownloadVariant.SIGNED) {
            if (document.getSignedStoragePath() == null) {
                throw new ResourceNotFoundException("DOC", "Signed document artifact is not available");
            }
            return document.getSignedStoragePath();
        }

        if (document.getStoragePath() == null) {
            throw new ResourceNotFoundException("DOC", "Document has no associated file");
        }
        return document.getStoragePath();
    }

    private String resolveFilename(Document document, DocumentDownloadVariant variant) {
        if (variant == DocumentDownloadVariant.ORIGINAL) {
            return document.getName();
        }

        if (variant == DocumentDownloadVariant.SIGNED && !document.getName().startsWith("signed-")) {
            return "signed-" + document.getName();
        }

        return document.getName();
    }

    private long resolveSize(Document document, DocumentDownloadVariant variant) {
        if (variant == DocumentDownloadVariant.ORIGINAL && document.getOriginalSize() != null) {
            return document.getOriginalSize();
        }
        if (variant == DocumentDownloadVariant.SIGNED && document.getSignedSize() != null) {
            return document.getSignedSize();
        }
        return document.getSize();
    }
}
