package es.tfg.records.application.mapper;

import es.tfg.records.domain.model.Document;
import es.tfg.records.application.dto.DocumentItem;
import es.tfg.records.application.dto.DocumentDetail;

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
                document.getProcedureId(),
                Collections.emptyList()
        );
    }
}
