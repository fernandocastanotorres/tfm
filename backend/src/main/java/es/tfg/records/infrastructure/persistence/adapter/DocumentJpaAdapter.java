package es.tfg.records.infrastructure.persistence.adapter;

import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.mapper.DocumentEntityMapper;
import es.tfg.records.infrastructure.persistence.repository.DocumentJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Infrastructure adapter implementing the DocumentRepository port using Spring Data JPA.
 */
@Component
public class DocumentJpaAdapter implements DocumentRepository {

    private final DocumentJpaRepository jpaRepository;
    private final ProcedureJpaRepository procedureJpaRepository;

    public DocumentJpaAdapter(DocumentJpaRepository jpaRepository,
                              ProcedureJpaRepository procedureJpaRepository) {
        this.jpaRepository = jpaRepository;
        this.procedureJpaRepository = procedureJpaRepository;
    }

    @Override
    public List<Document> findByProcedureId(UUID procedureId) {
        return DocumentEntityMapper.toDomainList(jpaRepository.findByProcedureId(procedureId));
    }

    @Override
    public Optional<Document> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(DocumentEntityMapper::toDomain);
    }

    @Override
    public Document save(Document document) {
        ProcedureEntity procedure = procedureJpaRepository.findById(document.getProcedureId())
                .orElseThrow(() -> new ResourceNotFoundException("PROC", document.getProcedureId().toString()));
        var entity = DocumentEntityMapper.toEntity(document, procedure);
        var saved = jpaRepository.save(entity);
        return DocumentEntityMapper.toDomain(saved);
    }
}
