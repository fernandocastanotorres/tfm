package es.tfm.records.domain.port;

import es.tfm.records.domain.model.Procedure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for procedure (case) persistence operations.
 * Implemented by infrastructure adapters.
 */
public interface ProcedureRepository {

    List<Procedure> findByOwnerId(UUID ownerId, int page, int size);

    long countByOwnerId(UUID ownerId);

    Optional<Procedure> findById(UUID id);

    Procedure save(Procedure procedure);

    boolean existsById(UUID id);
}
