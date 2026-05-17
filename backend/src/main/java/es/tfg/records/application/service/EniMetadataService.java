package es.tfg.records.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.BackofficeDtos;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.infrastructure.persistence.entity.EniMetadataEntity;
import es.tfg.records.infrastructure.persistence.repository.EniMetadataJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EniMetadataService {

    private static final String RESOURCE_PROCEDURE = "PROCEDURE";
    private static final String RESOURCE_DOCUMENT = "DOCUMENT";

    private final EniMetadataJpaRepository eniMetadataRepository;
    private final ObjectMapper objectMapper;

    public EniMetadataService(EniMetadataJpaRepository eniMetadataRepository,
                              ObjectMapper objectMapper) {
        this.eniMetadataRepository = eniMetadataRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void upsertProcedureMetadata(Procedure procedure) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("eniVersion", "ENI-NTI-2011");
        metadata.put("resourceType", RESOURCE_PROCEDURE);
        metadata.put("procedureId", procedure.getId());
        metadata.put("procedureTypeId", procedure.getProcedureTypeId());
        metadata.put("ownerId", procedure.getOwnerId());
        metadata.put("status", procedure.getStatus() == null ? null : procedure.getStatus().name());
        metadata.put("title", procedure.getTitle());
        metadata.put("assignedUnit", procedure.getAssignedUnit());
        metadata.put("submittedAt", procedure.getSubmittedAt());
        metadata.put("createdAt", procedure.getCreatedAt());
        metadata.put("updatedAt", procedure.getUpdatedAt());
        saveMetadata(RESOURCE_PROCEDURE, procedure.getId(), metadata);
    }

    @Transactional
    public void upsertDocumentMetadata(Document document) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("eniVersion", "ENI-NTI-2011");
        metadata.put("resourceType", RESOURCE_DOCUMENT);
        metadata.put("documentId", document.getId());
        metadata.put("procedureId", document.getProcedureId());
        metadata.put("name", document.getName());
        metadata.put("mimeType", document.getMimeType());
        metadata.put("size", document.getSize());
        metadata.put("version", document.getVersion());
        metadata.put("status", document.getStatus() == null ? null : document.getStatus().name());
        metadata.put("uploadedAt", document.getUploadedAt());
        metadata.put("createdAt", document.getCreatedAt());
        metadata.put("updatedAt", document.getUpdatedAt());
        saveMetadata(RESOURCE_DOCUMENT, document.getId(), metadata);
    }

    @Transactional(readOnly = true)
    public BackofficeDtos.EniMetadataEntry getProcedureMetadata(UUID procedureId) {
        return toDto(eniMetadataRepository.findByResourceTypeAndResourceId(RESOURCE_PROCEDURE, procedureId)
                .orElseThrow(() -> new ResourceNotFoundException("ENI_METADATA", procedureId.toString())));
    }

    @Transactional(readOnly = true)
    public BackofficeDtos.EniMetadataEntry getDocumentMetadata(UUID documentId) {
        return toDto(eniMetadataRepository.findByResourceTypeAndResourceId(RESOURCE_DOCUMENT, documentId)
                .orElseThrow(() -> new ResourceNotFoundException("ENI_METADATA", documentId.toString())));
    }

    private void saveMetadata(String resourceType, UUID resourceId, Map<String, Object> metadata) {
        EniMetadataEntity entity = eniMetadataRepository.findByResourceTypeAndResourceId(resourceType, resourceId)
                .orElseGet(() -> {
                    EniMetadataEntity created = new EniMetadataEntity();
                    created.setId(UUID.randomUUID());
                    created.setResourceType(resourceType);
                    created.setResourceId(resourceId);
                    return created;
                });

        entity.setMetadataJson(writeJson(metadata));
        eniMetadataRepository.save(entity);
    }

    private BackofficeDtos.EniMetadataEntry toDto(EniMetadataEntity entity) {
        return new BackofficeDtos.EniMetadataEntry(
                entity.getResourceType(),
                entity.getResourceId(),
                entity.getUpdatedAt(),
                parseJson(entity.getMetadataJson())
        );
    }

    private String writeJson(Map<String, Object> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize ENI metadata", ex);
        }
    }

    private Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            return Map.of("raw", json, "parseErrorAt", Instant.now().toString());
        }
    }
}
