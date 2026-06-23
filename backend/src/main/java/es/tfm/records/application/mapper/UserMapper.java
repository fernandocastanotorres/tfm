package es.tfm.records.application.mapper;

import es.tfm.records.domain.model.User;
import es.tfm.records.application.dto.UserProfile;

import java.util.ArrayList;

/**
 * Manual mapper for User domain model to DTOs.
 */
public final class UserMapper {

    private UserMapper() {
    }

    public static UserProfile toUserProfile(User user) {
        return new UserProfile(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getNationalId(),
                user.getPhone(),
                user.getAddress(),
                user.getRoles() != null ? new ArrayList<>(user.getRoles()) : new ArrayList<>()
        );
    }
}
