package es.tfg.records.application.service;

import es.tfg.records.application.dto.*;
import es.tfg.records.application.exception.AuthenticationException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ValidationException;
import es.tfg.records.application.mapper.UserMapper;
import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.UserRepository;
import es.tfg.records.infrastructure.audit.AuditService;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import es.tfg.records.infrastructure.security.AccountLockoutManager;
import es.tfg.records.infrastructure.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Implementation of authentication and user management use cases.
 * Handles login, registration, OTP verification, password reset, and token refresh.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailGateway emailGateway;
    private final AccountLockoutManager lockoutManager;
    private final AuditService auditService;
    private final String verificationBaseUrl;

    private final Map<String, ResetTokenEntry> resetTokenStore = new HashMap<>();

    private final Set<String> activeRefreshTokens = new HashSet<>();

    public AuthServiceImpl(UserRepository userRepository,
                           JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder,
                           EmailGateway emailGateway,
                           AccountLockoutManager lockoutManager,
                           AuditService auditService,
                           @Value("${mailing.verification-base-url:http://localhost:4200/sede/verificar-email}") String verificationBaseUrl) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.emailGateway = emailGateway;
        this.lockoutManager = lockoutManager;
        this.auditService = auditService;
        this.verificationBaseUrl = verificationBaseUrl;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = request.email();

        if (lockoutManager.isLocked(email)) {
            auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                    "Account locked due to too many failed attempts");
            throw new AuthenticationException(
                    "AUTH-401-ACCOUNT_LOCKED",
                    "Account is temporarily locked. Please try again later.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    lockoutManager.recordFailedAttempt(email);
                    auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                            "User not found: " + email);
                    return new AuthenticationException(
                            "AUTH-401-INVALID_CREDENTIALS",
                            "Invalid email or password");
                });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            boolean isLocked = lockoutManager.recordFailedAttempt(email);
            int remaining = 5 - lockoutManager.getFailedAttempts(email);
            auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                    "Invalid password for " + email);

            if (isLocked) {
                throw new AuthenticationException(
                        "AUTH-401-ACCOUNT_LOCKED",
                        "Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.");
            }

            throw new AuthenticationException(
                    "AUTH-401-INVALID_CREDENTIALS",
                    "Invalid email or password. " + remaining + " attempts remaining.");
        }

        if (!user.isActive()) {
            auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                    "Inactive account: " + email);
            throw new AuthenticationException(
                    "AUTH-401-ACCOUNT_NOT_ACTIVE",
                    "Account is not verified. Please verify your OTP first.");
        }

        lockoutManager.resetFailedAttempts(email);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRoles());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), user.getEmail());

        activeRefreshTokens.add(refreshToken);

        auditService.record(AuditAction.LOGIN, "USER", AuditResult.SUCCESS,
                "Login successful for " + email);

        return new LoginResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration() / 1000,
                UserMapper.toUserProfile(user));
    }

    @Override
    public UserProfile register(RegisterRequest request) {
        validatePassword(request.password());

        if (userRepository.existsByEmail(request.email())) {
            auditService.record(AuditAction.CREATE, "USER", AuditResult.FAILURE,
                    "Registration failed - email exists: " + request.email());
            throw new ConflictException("AUTH", "EMAIL_EXISTS");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.fullName());
        user.setNationalId(request.nationalId());
        user.setPhone(request.phone());
        user.setAddress(request.address());
        user.setRoles(Set.of("ROLE_CITIZEN"));
        user.setActive(false);

        String otpCode = generateOtpCode();
        user.setOtpCode(otpCode);
        user.setOtpExpiry(Instant.now().plusSeconds(86400));
        user.setLastVerificationEmailSentAt(Instant.now());

        User saved = userRepository.save(user);

        String verificationUrl = verificationBaseUrl + "?token=" + otpCode;
        try {
            emailGateway.sendVerificationEmail(request.email(), request.fullName(), verificationUrl);
            log.info("Verification email generated for {} with expiry {}", request.email(), user.getOtpExpiry());
        } catch (Exception ex) {
            log.error("Registration email dispatch failed for {}: {}", request.email(), ex.getMessage(), ex);
        }

        auditService.record(AuditAction.CREATE, "USER", AuditResult.SUCCESS,
                "New user registered: " + request.email());

        return UserMapper.toUserProfile(saved);
    }

    @Override
    public LoginResponse refreshToken(TokenRefreshRequest request) {
        String token = request.refreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                    "Token refresh failed - invalid token");
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Refresh token is expired or invalid");
        }

        if (!activeRefreshTokens.contains(token)) {
            auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                    "Token refresh failed - token already rotated");
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Refresh token has been rotated");
        }

        var claims = jwtTokenProvider.getClaims(token);
        String type = claims.get("type", String.class);
        if (!"refresh".equals(type)) {
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Invalid token type");
        }

        activeRefreshTokens.remove(token);

        UUID userId = jwtTokenProvider.getUserId(token);
        String email = jwtTokenProvider.getEmail(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-401-USER_NOT_FOUND",
                        "User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                userId, email, user.getRoles());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                userId, email);

        activeRefreshTokens.add(newRefreshToken);

        auditService.record(AuditAction.LOGIN, "USER", AuditResult.SUCCESS,
                "Token refreshed for " + email);

        return new LoginResponse(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration() / 1000,
                UserMapper.toUserProfile(user));
    }

    @Override
    public void forgotPassword(PasswordResetRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plusSeconds(3600);

            resetTokenStore.put(resetToken, new ResetTokenEntry(user.getId(), expiry));

            log.info("=== PASSWORD RESET TOKEN FOR {} === Token: {} (expires at {}) ===",
                    request.email(), resetToken, expiry);
        });
    }

    @Override
    public void resendVerificationEmail(PasswordResetRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            if (user.isActive()) {
                return;
            }

            Instant now = Instant.now();
            Instant lastSentAt = user.getLastVerificationEmailSentAt();
            if (lastSentAt != null && now.isBefore(lastSentAt.plusSeconds(60))) {
                return;
            }

            String verificationToken = generateOtpCode();
            user.setOtpCode(verificationToken);
            user.setOtpExpiry(now.plusSeconds(86400));
            user.setLastVerificationEmailSentAt(now);
            userRepository.save(user);

            String verificationUrl = verificationBaseUrl + "?token=" + verificationToken;
            try {
                emailGateway.sendVerificationEmail(user.getEmail(), user.getDisplayName(), verificationUrl);
            } catch (Exception ex) {
                log.error("Resend verification email failed for {}: {}", user.getEmail(), ex.getMessage(), ex);
            }
        });
    }

    @Override
    public void verifyOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-400-INVALID_OTP",
                        "Invalid OTP code"));

        if (user.isActive()) {
            throw new AuthenticationException(
                    "AUTH-400-ALREADY_VERIFIED",
                    "Account is already verified");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.code())) {
            throw new AuthenticationException(
                    "AUTH-400-INVALID_OTP",
                    "Invalid OTP code");
        }

        if (user.getOtpExpiry() == null || Instant.now().isAfter(user.getOtpExpiry())) {
            throw new AuthenticationException(
                    "AUTH-400-INVALID_OTP",
                    "OTP code has expired");
        }

        user.setActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        log.info("Account verified for: {}", request.email());

        auditService.record(AuditAction.CREATE, "USER", AuditResult.SUCCESS,
                "Account verified: " + request.email());
    }

    @Override
    public void verifyEmailToken(String token) {
        User user = userRepository.findByOtpCode(token)
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-400-INVALID_OTP",
                        "Invalid verification token"));

        if (user.getOtpExpiry() == null || Instant.now().isAfter(user.getOtpExpiry())) {
            throw new AuthenticationException(
                    "AUTH-400-INVALID_OTP",
                    "Verification token has expired");
        }

        user.setActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        auditService.record(AuditAction.CREATE, "USER", AuditResult.SUCCESS,
                "Email verified via token for: " + user.getEmail());
    }

    @Override
    public UserProfile getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("AUTH-401-USER_NOT_FOUND", "User not found"));
        return UserMapper.toUserProfile(user);
    }

    @Override
    public UserProfile updateProfile(UUID userId, UpdateCitizenProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("AUTH-401-USER_NOT_FOUND", "User not found"));
        user.setDisplayName(request.fullName());
        user.setPhone(request.phone());
        user.setNationalId(request.nationalId());
        user.setAddress(request.address());

        auditService.record(AuditAction.UPDATE, "USER", AuditResult.SUCCESS,
                "Profile updated for user: " + user.getEmail());

        return UserMapper.toUserProfile(userRepository.save(user));
    }

    @Override
    public void resetPassword(PasswordResetConfirmRequest request) {
        ResetTokenEntry entry = resetTokenStore.get(request.token());
        if (entry == null) {
            auditService.record(AuditAction.UPDATE, "USER", AuditResult.FAILURE,
                    "Password reset failed - invalid token");
            throw new AuthenticationException(
                    "AUTH-400-INVALID_TOKEN",
                    "Invalid or expired reset token");
        }

        if (Instant.now().isAfter(entry.expiry())) {
            resetTokenStore.remove(request.token());
            throw new AuthenticationException(
                    "AUTH-400-INVALID_TOKEN",
                    "Reset token has expired");
        }

        validatePassword(request.newPassword());

        User user = userRepository.findById(entry.userId())
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-401-USER_NOT_FOUND",
                        "User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetTokenStore.remove(request.token());
        log.info("Password reset for user: {}", user.getEmail());

        auditService.record(AuditAction.UPDATE, "USER", AuditResult.SUCCESS,
                "Password reset for: " + user.getEmail());
    }

    @Override
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-401-USER_NOT_FOUND",
                        "User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            auditService.record(AuditAction.UPDATE, "USER", AuditResult.FAILURE,
                    "Password change failed - invalid current password for " + user.getEmail());
            throw new AuthenticationException(
                    "AUTH-401-INVALID_CREDENTIALS",
                    "Current password is incorrect");
        }

        validatePassword(request.newPassword());

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ValidationException(List.of(
                    new ValidationException.ValidationError("newPassword",
                            "New password must be different from current password")));
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());

        auditService.record(AuditAction.UPDATE, "USER", AuditResult.SUCCESS,
                "Password changed for: " + user.getEmail());
    }

    @Override
    public void logout(String refreshToken) {
        activeRefreshTokens.remove(refreshToken);
        auditService.record(AuditAction.LOGOUT, "USER", AuditResult.SUCCESS,
                "User logout");
        log.info("Logout: refresh token invalidated");
    }

    private void validatePassword(String password) {
        if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
            List<ValidationException.ValidationError> errors = new ArrayList<>();
            if (password == null || password.length() < 8) {
                errors.add(new ValidationException.ValidationError("password", "Must be at least 8 characters"));
            }
            if (password != null && !password.matches(".*[A-Z].*")) {
                errors.add(new ValidationException.ValidationError("password", "Must contain at least one uppercase letter"));
            }
            if (password != null && !password.matches(".*\\d.*")) {
                errors.add(new ValidationException.ValidationError("password", "Must contain at least one number"));
            }
            if (password != null && !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
                errors.add(new ValidationException.ValidationError("password", "Must contain at least one special character"));
            }
            throw new ValidationException(errors);
        }
    }

    private record ResetTokenEntry(UUID userId, Instant expiry) {}

    private String generateOtpCode() {
        int value = new Random().nextInt(1_000_000);
        return String.format("%06d", value);
    }
}
