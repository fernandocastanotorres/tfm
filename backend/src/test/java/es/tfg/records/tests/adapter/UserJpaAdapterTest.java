package es.tfg.records.tests.adapter;

import es.tfg.records.domain.model.User;
import es.tfg.records.infrastructure.persistence.adapter.UserJpaAdapter;
import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserJpaAdapterTest {

    @Mock
    private UserJpaRepository jpaRepository;

    @InjectMocks
    private UserJpaAdapter adapter;

    @Test
    void findByEmail_shouldReturnUserWhenFound() {
        String email = "test@example.com";
        UserEntity entity = new UserEntity();
        entity.setId(UUID.randomUUID());
        entity.setEmail(email);
        entity.setDisplayName("Test User");
        entity.setRoles(Set.of("ROLE_CITIZEN"));

        when(jpaRepository.findByEmail(email)).thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findByEmail(email);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(email);
    }

    @Test
    void save_shouldSaveAndReturnUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");

        UserEntity entity = new UserEntity();
        entity.setId(user.getId());
        entity.setEmail(user.getEmail());

        when(jpaRepository.save(any(UserEntity.class))).thenReturn(entity);

        User result = adapter.save(user);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(entity.getId());
        verify(jpaRepository).save(any(UserEntity.class));
    }

    @Test
    void findById_shouldReturnUserWhenFound() {
        UUID id = UUID.randomUUID();
        UserEntity entity = new UserEntity();
        entity.setId(id);
        entity.setEmail("test@example.com");

        when(jpaRepository.findById(id)).thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findById(id);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(id);
    }

    @Test
    void findByOtpCode_shouldReturnUserWhenFound() {
        String otp = "123456";
        UserEntity entity = new UserEntity();
        entity.setId(UUID.randomUUID());
        entity.setOtpCode(otp);

        when(jpaRepository.findByOtpCode(otp)).thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findByOtpCode(otp);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(entity.getId());
    }

    @Test
    void findByVerificationToken_shouldReturnUserWhenFound() {
        String token = "token123";
        UserEntity entity = new UserEntity();
        entity.setId(UUID.randomUUID());
        entity.setVerificationToken(token);

        when(jpaRepository.findByVerificationToken(token)).thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findByVerificationToken(token);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(entity.getId());
    }

    @Test
    void findByPasswordResetToken_shouldReturnUserWhenFound() {
        String token = "reset123";
        UserEntity entity = new UserEntity();
        entity.setId(UUID.randomUUID());
        entity.setPasswordResetToken(token);

        when(jpaRepository.findByPasswordResetToken(token)).thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findByPasswordResetToken(token);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(entity.getId());
    }

    @Test
    void existsByEmail_shouldReturnTrueWhenExists() {
        String email = "test@example.com";
        when(jpaRepository.existsByEmail(email)).thenReturn(true);

        boolean exists = adapter.existsByEmail(email);

        assertThat(exists).isTrue();
    }
}
