package es.tfm.records.application.mapper;

import es.tfm.records.domain.model.Document;
import es.tfm.records.application.dto.DocumentItem;
import es.tfm.records.application.dto.DocumentDetail;

import java.util.Collections;

/**
 * Manual mapper for Document domain model to DTOs.
 */
public final class DocumentMapper {

    private DocumentMapper() {
    }

    public static DocumentItem toDocumentItem(Document document) {
        return new DocumentItem(
                document.getId(),
                document.getName(),
                document.getMimeType(),
                document.getSize(),
                document.getVersion(),
                document.getUploadedAt(),
                document.getStatus().name(),
                document.getOriginalStoragePath() != null,
                document.getSignedStoragePath() != null,
                document.getProcedureId()
        );
    }

    public static DocumentDetail toDocumentDetail(Document document) {
        return new DocumentDetail(
                document.getId(),
                document.getName(),
                document.getMimeType(),
                document.getSize(),
                document.getVersion(),
                document.getUploadedAt(),
                document.getStatus().name(),
                document.getOriginalStoragePath() != null,
                document.getSignedStoragePath() != null,
                document.getProcedureId(),
                Collections.emptyList()
        );
    }
}
