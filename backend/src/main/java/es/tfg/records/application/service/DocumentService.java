package es.tfg.records.application.service;

import es.tfg.records.application.dto.DocumentDetail;
import es.tfg.records.application.dto.DocumentItem;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Application service port for document management operations.
 */
public interface DocumentService {

    DocumentItem uploadDocument(UUID caseId, UUID ownerId, MultipartFile file);

    List<DocumentItem> listDocumentsByCase(UUID caseId, UUID ownerId);

    DocumentDetail getDocumentDetail(UUID procedureUuid, UUID documentId, UUID ownerId);

    void deleteDocument(UUID documentId, UUID ownerId);

    /**
     * Returns a streaming Resource for downloading a document.
     * The Resource is backed by an InputStream that reads the file in chunks,
     * avoiding loading the entire file into memory.
     */
    Resource downloadDocument(UUID documentId, UUID ownerId);

    /**
     * Returns a streaming Resource for downloading a document (admin access, no ownership check).
     */
    Resource downloadDocumentForAdmin(UUID documentId);
}
