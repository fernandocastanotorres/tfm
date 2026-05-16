package es.tfg.records.domain.port;

import es.tfg.records.domain.model.ProcedureType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for procedure type (catalog) persistence operations.
 * Implemented by infrastructure adapters.
 */
public interface ProcedureTypeRepository {

    List<ProcedureType> findAll();

    Optional<ProcedureType> findById(UUID id);
}
