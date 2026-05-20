package es.tfg.records.tests.service;

import es.tfg.records.application.dto.LoginRequest;
import es.tfg.records.application.dto.RegisterRequest;
import es.tfg.records.application.exception.AuthenticationException;
import es.tfg.records.application.service.EmailGateway;
import es.tfg.records.application.service.AuthServiceImpl;
import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.UserRepository;
import es.tfg.records.infrastructure.audit.AuditService;
import es.tfg.records.infrastructure.security.AccountLockoutManager;
import es.tfg.records.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.Mockito.doNothing;
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

    @Mock
    private EmailGateway emailGateway;

    @Mock
    private AccountLockoutManager lockoutManager;

    @Mock
    private AuditService auditService;

    private AuthServiceImpl authService;

    private UUID userId;
    private String email;
    private String password;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        email = "test@example.com";
        password = "Password123!";
        authService = new AuthServiceImpl(
                userRepository, jwtTokenProvider, passwordEncoder, emailGateway,
                lockoutManager, auditService,
                "http://localhost:4200/sede/verificar-email");
        doNothing().when(emailGateway).sendVerificationEmail(any(), any(), any());
        when(lockoutManager.isLocked(any())).thenReturn(false);
        doNothing().when(lockoutManager).resetFailedAttempts(any());
    }

    @Test
    void login_shouldThrowExceptionWhenUserNotFound() {
        LoginRequest request = new LoginRequest(email, password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void login_shouldThrowExceptionWhenPasswordIsIncorrect() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash("encodedPassword");

        LoginRequest request = new LoginRequest(email, "wrongPassword");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void register_shouldCreateUserWhenEmailIsNotInUse() {
        RegisterRequest request = new RegisterRequest(
                email,
                "Test User",
                "12345678A",
                "600123456",
                "Calle Mayor 10",
                password
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(password)).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(userId);
            return u;
        });

        var result = authService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(email);
    }

    @Test
    void register_shouldThrowExceptionWhenEmailIsAlreadyInUse() {
        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail(email);

        RegisterRequest request = new RegisterRequest(
                email,
                "Test User",
                "12345678A",
                "600123456",
                "Calle Mayor 10",
                password
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void login_shouldThrowExceptionWhenAccountIsNotActive() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash("encodedPassword");
        user.setActive(false);

        LoginRequest request = new LoginRequest(email, password);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("not verified");
    }

    @Test
    void login_shouldSucceedWhenCredentialsAreValidAndActive() {
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

        var result = authService.login(request);

        assertThat(result.accessToken()).isEqualTo("accessToken");
        assertThat(result.refreshToken()).isEqualTo("refreshToken");
        assertThat(result.user().email()).isEqualTo(email);
    }

    @Test
    void register_shouldThrowExceptionWhenPasswordTooShort() {
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "New User",
                "12345678A",
                "600123456",
                "Calle Mayor 10",
                "Pass1"
        );

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void register_shouldThrowExceptionWhenPasswordMissingUppercase() {
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "New User",
                "12345678A",
                "600123456",
                "Calle Mayor 10",
                "password123"
        );

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void register_shouldThrowExceptionWhenPasswordMissingDigit() {
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "New User",
                "12345678A",
                "600123456",
                "Calle Mayor 10",
                "Password"
        );

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(Exception.class);
    }

    @Test
    void register_shouldEncodePasswordAndSetDefaultRole() {
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "New User",
                "12345678A",
                "600123456",
                "Calle Mayor 10",
                "Password123!"
        );

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(userId);
            return u;
        });

        var result = authService.register(request);

        assertThat(result.roles()).contains("ROLE_CITIZEN");
    }
}
