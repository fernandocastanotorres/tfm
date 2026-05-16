package es.tfg.records.domain.port;

import es.tfg.records.domain.model.User;

import java.util.Optional;
import java.util.UUID;

/**
 * Port interface for user persistence operations.
 * Implemented by infrastructure adapters.
 */
public interface UserRepository {

    Optional<User> findByEmail(String email);

    User save(User user);

    Optional<User> findById(UUID id);

    boolean existsByEmail(String email);
}
