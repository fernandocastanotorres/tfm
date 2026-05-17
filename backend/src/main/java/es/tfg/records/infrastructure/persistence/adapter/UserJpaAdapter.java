package es.tfg.records.infrastructure.persistence.adapter;

import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.UserRepository;
import es.tfg.records.infrastructure.persistence.mapper.UserEntityMapper;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Infrastructure adapter implementing the UserRepository port using Spring Data JPA.
 */
@Component
public class UserJpaAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;

    public UserJpaAdapter(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email)
                .map(UserEntityMapper::toDomain);
    }

    @Override
    public User save(User user) {
        var entity = UserEntityMapper.toEntity(user);
        var saved = jpaRepository.save(entity);
        return UserEntityMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(UserEntityMapper::toDomain);
    }

    @Override
    public Optional<User> findByOtpCode(String otpCode) {
        return jpaRepository.findByOtpCode(otpCode)
                .map(UserEntityMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }
}
