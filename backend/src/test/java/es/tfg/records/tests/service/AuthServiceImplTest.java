package es.tfg.records.tests.service;

import es.tfg.records.application.dto.LoginRequest;
import es.tfg.records.application.dto.RegisterRequest;
import es.tfg.records.application.exception.AuthenticationException;
import es.tfg.records.application.service.AuthServiceImpl;
import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.UserRepository;
import es.tfg.records.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private UUID userId;
    private String email;
    private String password;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        email = "test@example.com";
        password = "Password123";
    }

    @Test
    void login_shouldThrowExceptionWhenUserNotFound() {
        // Given
        LoginRequest request = new LoginRequest(email, password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void login_shouldThrowExceptionWhenPasswordIsIncorrect() {
        // Given
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash("encodedPassword");

        LoginRequest request = new LoginRequest(email, "wrongPassword");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void register_shouldCreateUserWhenEmailIsNotInUse() {
        // Given
        RegisterRequest request = new RegisterRequest(
                email,
                password,
                "Test User"
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(password)).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(userId);
            return u;
        });

        // When
        var result = authService.register(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(email);
    }

    @Test
    void register_shouldThrowExceptionWhenEmailIsAlreadyInUse() {
        // Given
        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail(email);

        RegisterRequest request = new RegisterRequest(
                email,
                password,
                "Test User"
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));

        // When/Then
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    // ===== Additional Edge Case Tests =====

    @Test
    void login_shouldThrowExceptionWhenAccountIsNotActive() {
        // Given
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash("encodedPassword");
        user.setActive(false);

        LoginRequest request = new LoginRequest(email, password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("not verified");
    }

    @Test
    void login_shouldSucceedWhenCredentialsAreValidAndActive() {
        // Given
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash("encodedPassword");
        user.setActive(true);
        user.setRoles(Set.of("ROLE_CITIZEN"));

        LoginRequest request = new LoginRequest(email, password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(), any(), any())).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken(any(), any())).thenReturn("refreshToken");
        when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(3600000L);

        // When
        var result = authService.login(request);

        // Then
        assertThat(result.accessToken()).isEqualTo("accessToken");
        assertThat(result.refreshToken()).isEqualTo("refreshToken");
        assertThat(result.user().email()).isEqualTo(email);
    }

    @Test
    void register_shouldThrowExceptionWhenPasswordTooShort() {
        // Given - password less than 8 characters
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "Pass1", // Only 5 characters
                "New User"
        );

        // When/Then
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void register_shouldThrowExceptionWhenPasswordMissingUppercase() {
        // Given - password without uppercase
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "password123", // No uppercase
                "New User"
        );

        // When/Then
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void register_shouldThrowExceptionWhenPasswordMissingDigit() {
        // Given - password without digit
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "Password", // No digit
                "New User"
        );

        // When/Then
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void register_shouldEncodePasswordAndSetDefaultRole() {
        // Given
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "Password123",
                "New User"
        );

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(userId);
            return u;
        });

        // When
        var result = authService.register(request);

        // Then
        assertThat(result.roles()).contains("ROLE_CITIZEN");
    }
}
