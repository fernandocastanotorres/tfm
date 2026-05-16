package es.tfg.records.domain.port;

import es.tfg.records.domain.model.Document;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for document persistence operations.
 * Implemented by infrastructure adapters.
 */
public interface DocumentRepository {

    List<Document> findByProcedureId(UUID procedureId);

    Optional<Document> findById(UUID id);

    Document save(Document document);
}
