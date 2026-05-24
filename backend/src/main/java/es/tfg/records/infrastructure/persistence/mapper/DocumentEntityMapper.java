package es.tfg.records.infrastructure.persistence.mapper;

import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.infrastructure.persistence.entity.DocumentEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;

import java.util.List;

/**
 * Mapper between JPA DocumentEntity and domain Document model.
 */
public final class DocumentEntityMapper {

    private DocumentEntityMapper() {
    }

    public static Document toDomain(DocumentEntity entity) {
        if (entity == null) return null;
        Document document = new Document();
        document.setId(entity.getId());
        document.setProcedureId(entity.getProcedure() != null ? entity.getProcedure().getId() : null);
        document.setName(entity.getName());
        document.setMimeType(entity.getMimeType());
        document.setSize(entity.getSize());
        document.setVersion(entity.getVersion());
        document.setStatus(entity.getStatus());
        document.setStoragePath(entity.getStoragePath());
        document.setOriginalStoragePath(entity.getOriginalStoragePath());
        document.setSignedStoragePath(entity.getSignedStoragePath());
        document.setOriginalMimeType(entity.getOriginalMimeType());
        document.setSignedMimeType(entity.getSignedMimeType());
        document.setOriginalSize(entity.getOriginalSize());
        document.setSignedSize(entity.getSignedSize());
        document.setUploadedAt(entity.getUploadedAt());
        document.setSignedAt(entity.getSignedAt());
        document.setCreatedAt(entity.getCreatedAt());
        document.setUpdatedAt(entity.getUpdatedAt());
        return document;
    }

    public static DocumentEntity toEntity(Document domain, ProcedureEntity procedure) {
        if (domain == null) return null;
        DocumentEntity entity = new DocumentEntity();
        entity.setId(domain.getId());
        entity.setProcedure(procedure);
        entity.setName(domain.getName());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());
        entity.setVersion(domain.getVersion());
        entity.setStatus(domain.getStatus() != null ? domain.getStatus() : DocumentStatus.PENDING);
        entity.setStoragePath(domain.getStoragePath());
        entity.setOriginalStoragePath(domain.getOriginalStoragePath());
        entity.setSignedStoragePath(domain.getSignedStoragePath());
        entity.setOriginalMimeType(domain.getOriginalMimeType());
        entity.setSignedMimeType(domain.getSignedMimeType());
        entity.setOriginalSize(domain.getOriginalSize());
        entity.setSignedSize(domain.getSignedSize());
        entity.setUploadedAt(domain.getUploadedAt());
        entity.setSignedAt(domain.getSignedAt());
        return entity;
    }

    public static List<Document> toDomainList(List<DocumentEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream()
                .map(DocumentEntityMapper::toDomain)
                .toList();
    }
}
