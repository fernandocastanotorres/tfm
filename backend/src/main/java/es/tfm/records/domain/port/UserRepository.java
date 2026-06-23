package es.tfm.records.domain.port;

import es.tfm.records.domain.model.User;

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

    Optional<User> findByOtpCode(String otpCode);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    boolean existsByEmail(String email);
}
