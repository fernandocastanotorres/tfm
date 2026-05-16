package es.tfg.records.tests.domain;

import es.tfg.records.domain.model.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    void user_constructorShouldAssignCoreFields() {
        UUID id = UUID.randomUUID();
        User user = new User(id, "citizen@example.com", "hash", "Citizen", Set.of("ROLE_CITIZEN"), true);

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmail()).isEqualTo("citizen@example.com");
        assertThat(user.getDisplayName()).isEqualTo("Citizen");
        assertThat(user.getRoles()).contains("ROLE_CITIZEN");
        assertThat(user.isActive()).isTrue();
    }

    @Test
    void user_shouldStoreOtpAndTimestamps() {
        User user = new User();
        Instant now = Instant.now();
        user.setOtpCode("123456");
        user.setOtpExpiry(now);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        assertThat(user.getOtpCode()).isEqualTo("123456");
        assertThat(user.getOtpExpiry()).isEqualTo(now);
        assertThat(user.getCreatedAt()).isEqualTo(now);
        assertThat(user.getUpdatedAt()).isEqualTo(now);
    }
}
