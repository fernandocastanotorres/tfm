package es.tfm.records.tests.service;

import es.tfm.records.application.dto.ChangePasswordRequest;
import es.tfm.records.application.dto.LoginRequest;
import es.tfm.records.application.dto.OtpRequest;
import es.tfm.records.application.dto.PasswordResetConfirmRequest;
import es.tfm.records.application.dto.PasswordResetRequest;
import es.tfm.records.application.dto.RegisterRequest;
import es.tfm.records.application.dto.TokenRefreshRequest;
import es.tfm.records.application.dto.UpdateCitizenProfileRequest;
import es.tfm.records.application.exception.AuthenticationException;
import es.tfm.records.application.exception.ValidationException;
import es.tfm.records.application.service.EmailGateway;
import es.tfm.records.application.service.AuthServiceImpl;
import es.tfm.records.domain.model.User;
import es.tfm.records.domain.port.UserRepository;
import es.tfm.records.infrastructure.audit.AuditService;
import es.tfm.records.infrastructure.security.AccountLockoutManager;
import es.tfm.records.infrastructure.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
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
                "http://localhost:4200/sede/verificar-email",
                "http://localhost:4200/sede/restablecer-contrasena");
        doNothing().when(emailGateway).sendVerificationEmail(any(), any(), any());
        doNothing().when(emailGateway).sendPasswordResetEmail(any(), any(), any());
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

    @Test
    void refreshToken_shouldSucceed_whenValidTokenAndUserFound() {
        String token = "valid-refresh-token";
        String newAccessToken = "new-access-token";
        String newRefreshToken = "new-refresh-token";
        String tokenHash = hashToken(token);
        String newTokenHash = hashToken(newRefreshToken);

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(true);
        user.setRoles(Set.of("ROLE_CITIZEN"));
        user.setRefreshTokenHash(tokenHash);

        Claims claims = Jwts.claims(Map.of("type", "refresh"));

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getClaims(token)).thenReturn(claims);
        when(jwtTokenProvider.getUserId(token)).thenReturn(userId);
        when(jwtTokenProvider.getEmail(token)).thenReturn(email);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateAccessToken(userId, email, user.getRoles())).thenReturn(newAccessToken);
        when(jwtTokenProvider.generateRefreshToken(userId, email)).thenReturn(newRefreshToken);
        when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(3600000L);

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = authService.refreshToken(new TokenRefreshRequest(token));

        assertThat(result.accessToken()).isEqualTo(newAccessToken);
        assertThat(result.refreshToken()).isEqualTo(newRefreshToken);
        assertThat(result.user().email()).isEqualTo(email);
    }

    @Test
    void refreshToken_shouldThrowException_whenTokenInvalid() {
        String token = "invalid-token";

        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken(new TokenRefreshRequest(token)))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void refreshToken_shouldThrowException_whenWrongTokenType() {
        String token = "access-token";

        Claims claims = Jwts.claims(Map.of("type", "access"));

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getClaims(token)).thenReturn(claims);

        assertThatThrownBy(() -> authService.refreshToken(new TokenRefreshRequest(token)))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void refreshToken_shouldThrowException_whenUserNotFound() {
        String token = "valid-refresh-token";

        Claims claims = Jwts.claims(Map.of("type", "refresh"));

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getClaims(token)).thenReturn(claims);
        when(jwtTokenProvider.getUserId(token)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshToken(new TokenRefreshRequest(token)))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void refreshToken_shouldThrowException_whenHashMismatch() {
        String token = "valid-refresh-token";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setRefreshTokenHash("different-hash");

        Claims claims = Jwts.claims(Map.of("type", "refresh"));

        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.getClaims(token)).thenReturn(claims);
        when(jwtTokenProvider.getUserId(token)).thenReturn(userId);
        when(jwtTokenProvider.getEmail(token)).thenReturn(email);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refreshToken(new TokenRefreshRequest(token)))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void forgotPassword_shouldGenerateResetToken_whenUserFound() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Test User");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.forgotPassword(new PasswordResetRequest(email));

        verify(userRepository).save(any(User.class));
        verify(emailGateway).sendPasswordResetEmail(any(), any(), any());
    }

    @Test
    void forgotPassword_shouldDoNothing_whenCooldownActive() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Test User");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PasswordResetRequest request = new PasswordResetRequest(email);

        authService.forgotPassword(request);
        authService.forgotPassword(request);

        verify(userRepository, times(1)).save(any(User.class));
        verify(emailGateway, times(1)).sendPasswordResetEmail(any(), any(), any());
    }

    @Test
    void forgotPassword_shouldDoNothing_whenUserNotFound() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        authService.forgotPassword(new PasswordResetRequest(email));

        verify(userRepository, never()).save(any());
        verify(emailGateway, never()).sendPasswordResetEmail(any(), any(), any());
    }

    @Test
    void resendVerificationEmail_shouldResend_whenUserExistsAndNotActive() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Test User");
        user.setActive(false);
        user.setLastVerificationEmailSentAt(Instant.now().minusSeconds(120));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.resendVerificationEmail(new PasswordResetRequest(email));

        verify(userRepository).save(any(User.class));
        verify(emailGateway).sendVerificationEmail(any(), any(), any());
    }

    @Test
    void resendVerificationEmail_shouldDoNothing_whenAlreadyActive() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Test User");
        user.setActive(true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        authService.resendVerificationEmail(new PasswordResetRequest(email));

        verify(userRepository, never()).save(any());
        verify(emailGateway, never()).sendVerificationEmail(any(), any(), any());
    }

    @Test
    void resendVerificationEmail_shouldDoNothing_whenCooldownActive() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Test User");
        user.setActive(false);
        user.setLastVerificationEmailSentAt(Instant.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        authService.resendVerificationEmail(new PasswordResetRequest(email));

        verify(userRepository, never()).save(any());
        verify(emailGateway, never()).sendVerificationEmail(any(), any(), any());
    }

    @Test
    void verifyOtp_shouldActivateAccount_whenValidCode() {
        String otpCode = "123456";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(false);
        user.setOtpCode(otpCode);
        user.setOtpExpiry(Instant.now().plusSeconds(3600));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.verifyOtp(new OtpRequest(email, otpCode));

        verify(userRepository).save(any(User.class));
    }

    @Test
    void verifyOtp_shouldThrowException_whenRateLimited() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        OtpRequest request = new OtpRequest(email, "000000");

        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> authService.verifyOtp(request))
                    .isInstanceOf(AuthenticationException.class);
        }

        assertThatThrownBy(() -> authService.verifyOtp(request))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Too many OTP attempts");
    }

    @Test
    void verifyOtp_shouldThrowException_whenUserNotFound() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyOtp(new OtpRequest(email, "000000")))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void verifyOtp_shouldThrowException_whenAlreadyActive() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyOtp(new OtpRequest(email, "000000")))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void verifyOtp_shouldThrowException_whenWrongCode() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(false);
        user.setOtpCode("123456");
        user.setOtpExpiry(Instant.now().plusSeconds(3600));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyOtp(new OtpRequest(email, "000000")))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void verifyOtp_shouldThrowException_whenCodeExpired() {
        String otpCode = "123456";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(false);
        user.setOtpCode(otpCode);
        user.setOtpExpiry(Instant.now().minusSeconds(10));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyOtp(new OtpRequest(email, otpCode)))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void verifyEmailToken_shouldActivateAccount_whenValidToken() {
        String token = "valid-token";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(false);
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(Instant.now().plusSeconds(3600));

        when(userRepository.findByVerificationToken(token)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.verifyEmailToken(token);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void verifyEmailToken_shouldThrowException_whenTokenExpired() {
        String token = "expired-token";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setActive(false);
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(Instant.now().minusSeconds(10));

        when(userRepository.findByVerificationToken(token)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyEmailToken(token))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void getProfile_shouldReturnProfile_whenUserFound() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Test User");
        user.setNationalId("12345678A");
        user.setPhone("600123456");
        user.setAddress("Calle Mayor 10");
        user.setRoles(Set.of("ROLE_CITIZEN"));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        var result = authService.getProfile(userId);

        assertThat(result.id()).isEqualTo(userId);
        assertThat(result.email()).isEqualTo(email);
        assertThat(result.fullName()).isEqualTo("Test User");
    }

    @Test
    void getProfile_shouldThrowException_whenUserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getProfile(userId))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void updateProfile_shouldUpdateAndReturn_whenUserFound() {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setDisplayName("Old Name");
        user.setNationalId("12345678A");
        user.setPhone("600123456");
        user.setAddress("Old Address");
        user.setRoles(Set.of("ROLE_CITIZEN"));

        UpdateCitizenProfileRequest request = new UpdateCitizenProfileRequest(
                "New Name", "600000000", "87654321B", "New Address"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = authService.updateProfile(userId, request);

        assertThat(result.fullName()).isEqualTo("New Name");
        assertThat(result.phone()).isEqualTo("600000000");
        assertThat(result.nationalId()).isEqualTo("87654321B");
        assertThat(result.address()).isEqualTo("New Address");
    }

    @Test
    void updateProfile_shouldThrowException_whenUserNotFound() {
        UpdateCitizenProfileRequest request = new UpdateCitizenProfileRequest(
                "New Name", "600000000", "87654321B", "New Address"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.updateProfile(userId, request))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void resetPassword_shouldSucceed_whenValidTokenAndPassword() {
        String resetToken = "valid-reset-token";
        String newPassword = "NewPassword1!";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(Instant.now().plusSeconds(3600));

        when(userRepository.findByPasswordResetToken(resetToken)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.resetPassword(new PasswordResetConfirmRequest(resetToken, newPassword));

        verify(userRepository).save(any(User.class));
    }

    @Test
    void resetPassword_shouldThrowException_whenTokenExpired() {
        String resetToken = "expired-reset-token";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(Instant.now().minusSeconds(10));

        when(userRepository.findByPasswordResetToken(resetToken)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> authService.resetPassword(
                new PasswordResetConfirmRequest(resetToken, "NewPassword1!")))
                .isInstanceOf(AuthenticationException.class);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void resetPassword_shouldThrowException_whenInvalidPassword() {
        String resetToken = "valid-reset-token";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(Instant.now().plusSeconds(3600));

        when(userRepository.findByPasswordResetToken(resetToken)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.resetPassword(
                new PasswordResetConfirmRequest(resetToken, "short")))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void changePassword_shouldSucceed_whenCurrentPasswordCorrect() {
        String currentPassword = "CurrentPass1!";
        String newPassword = "NewPass1!";
        String passwordHash = "encodedHash";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(currentPassword, passwordHash)).thenReturn(true);
        when(passwordEncoder.matches(newPassword, passwordHash)).thenReturn(false);
        when(passwordEncoder.encode(newPassword)).thenReturn("newEncodedHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.changePassword(userId, new ChangePasswordRequest(currentPassword, newPassword));

        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePassword_shouldThrowException_whenCurrentPasswordWrong() {
        String currentPassword = "WrongPass1!";
        String passwordHash = "encodedHash";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(currentPassword, passwordHash)).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(
                userId, new ChangePasswordRequest(currentPassword, "NewPass1!")))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void changePassword_shouldThrowException_whenNewPasswordSameAsCurrent() {
        String password = "Password1!";
        String passwordHash = "encodedHash";

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, passwordHash)).thenReturn(true);

        assertThatThrownBy(() -> authService.changePassword(
                userId, new ChangePasswordRequest(password, password)))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void logout_shouldClearToken_whenValidToken() {
        String refreshToken = "valid-refresh-token";
        String tokenHash = hashToken(refreshToken);

        User user = new User();
        user.setId(userId);
        user.setRefreshTokenHash(tokenHash);

        when(jwtTokenProvider.validateToken(refreshToken)).thenReturn(true);
        when(jwtTokenProvider.getUserId(refreshToken)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.logout(refreshToken);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void logout_shouldAudit_whenNullToken() {
        authService.logout(null);

        verify(userRepository, never()).save(any());
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
