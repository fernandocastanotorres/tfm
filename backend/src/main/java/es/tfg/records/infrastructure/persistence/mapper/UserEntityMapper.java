package es.tfg.records.infrastructure.persistence.mapper;

import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.domain.model.User;  // Verify domain package consistency

import java.util.Set;

/**
 * Mapper between JPA UserEntity and domain User model.
 */
public final class UserEntityMapper {

    private UserEntityMapper() {
    }

    public static User toDomain(UserEntity entity) {
        if (entity == null) return null;
        User user = new User();
        user.setId(entity.getId());
        user.setEmail(entity.getEmail());
        user.setPasswordHash(entity.getPasswordHash());
        user.setDisplayName(entity.getDisplayName());
        user.setActive(entity.isActive());
        user.setOtpCode(entity.getOtpCode());
        user.setOtpExpiry(entity.getOtpExpiry());
        user.setCreatedAt(entity.getCreatedAt());
        user.setUpdatedAt(entity.getUpdatedAt());
        // Roles are stored separately; set as empty for now
        user.setRoles(Set.of("ROLE_CITIZEN"));
        return user;
    }

    public static UserEntity toEntity(User domain) {
        if (domain == null) return null;
        UserEntity entity = new UserEntity();
        entity.setId(domain.getId());
        entity.setEmail(domain.getEmail());
        entity.setPasswordHash(domain.getPasswordHash());
        entity.setDisplayName(domain.getDisplayName());
        entity.setActive(domain.isActive());
        entity.setOtpCode(domain.getOtpCode());
        entity.setOtpExpiry(domain.getOtpExpiry());
        return entity;
    }
}
