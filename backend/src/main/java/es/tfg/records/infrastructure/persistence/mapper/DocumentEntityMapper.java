package es.tfg.records.infrastructure.persistence.mapper;

import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.infrastructure.persistence.entity.DocumentEntity;

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
        document.setUploadedAt(entity.getUploadedAt());
        document.setCreatedAt(entity.getCreatedAt());
        document.setUpdatedAt(entity.getUpdatedAt());
        return document;
    }

    public static DocumentEntity toEntity(Document domain) {
        if (domain == null) return null;
        DocumentEntity entity = new DocumentEntity();
        entity.setId(domain.getId());
        // Resolver y asignar ProcedureEntity antes de mapear. Revisar diseño al manejar relaciones.
        entity.setName(domain.getName());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());
        entity.setVersion(domain.getVersion());
        entity.setStatus(domain.getStatus() != null ? domain.getStatus() : DocumentStatus.PENDING);
        entity.setStoragePath(domain.getStoragePath());
        entity.setUploadedAt(domain.getUploadedAt());
        return entity;
    }

    public static List<Document> toDomainList(List<DocumentEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream()
                .map(DocumentEntityMapper::toDomain)
                .toList();
    }
}
