package es.tfm.records.tests.mapper;

import es.tfm.records.application.dto.UserProfile;
import es.tfm.records.application.mapper.UserMapper;
import es.tfm.records.domain.model.User;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private UUID userId = UUID.randomUUID();

    // ===== toUserProfile Tests =====

    @Test
    void toUserProfile_shouldMapUserToUserProfile() {
        // Given
        User user = new User(
                userId,
                "citizen@example.com",
                "hashedPassword",
                "John Citizen",
                Set.of("ROLE_CITIZEN"),
                true
        );

        // When
        UserProfile result = UserMapper.toUserProfile(user);

        // Then
        assertThat(result.id()).isEqualTo(userId);
        assertThat(result.email()).isEqualTo("citizen@example.com");
        assertThat(result.roles()).containsExactly("ROLE_CITIZEN");
    }

    @Test
    void toUserProfile_shouldHandleMultipleRoles() {
        // Given
        User user = new User(
                userId,
                "admin@example.com",
                "hashedPassword",
                "Admin User",
                Set.of("ROLE_ADMIN", "ROLE_USER", "ROLE_MANAGER"),
                true
        );

        // When
        UserProfile result = UserMapper.toUserProfile(user);

        // Then
        assertThat(result.roles()).containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_USER", "ROLE_MANAGER");
    }

    @Test
    void toUserProfile_shouldHandleNullRoles() {
        // Given
        User user = new User(
                userId,
                "test@example.com",
                "hashedPassword",
                "Test User",
                null,
                true
        );

        // When
        UserProfile result = UserMapper.toUserProfile(user);

        // Then
        assertThat(result.roles()).isEmpty();
    }

    @Test
    void toUserProfile_shouldReturnEmptyListForEmptyRoles() {
        // Given
        User user = new User(
                userId,
                "test@example.com",
                "hashedPassword",
                "Test User",
                Set.of(),
                true
        );

        // When
        UserProfile result = UserMapper.toUserProfile(user);

        // Then
        assertThat(result.roles()).isEmpty();
    }

    @Test
    void toUserProfile_shouldPreserveIndependentCopy() {
        // Given
        User user = new User(
                userId,
                "test@example.com",
                "hashedPassword",
                "Test User",
                Set.of("ROLE_USER"),
                true
        );

        // When
        UserProfile result = UserMapper.toUserProfile(user);

        // Then - verify it returns a new ArrayList, not the original
        assertThat(result.roles()).isNotSameAs(user.getRoles());
    }
}