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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Implementation of authentication and user management use cases.
 * Handles login, registration, OTP verification, password reset, and token refresh.
 * All tokens (verification, password reset, refresh) are persisted in the database.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");

    private static final long OTP_EXPIRY_SECONDS = 86400L;
    private static final long PASSWORD_RESET_TOKEN_EXPIRY_SECONDS = 3600L;

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailGateway emailGateway;
    private final AccountLockoutManager lockoutManager;
    private final AuditService auditService;
    private final String verificationBaseUrl;
    private final String passwordResetBaseUrl;

    public AuthServiceImpl(UserRepository userRepository,
                           JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder,
                           EmailGateway emailGateway,
                           AccountLockoutManager lockoutManager,
                           AuditService auditService,
                           @Value("${mailing.verification-base-url:http://localhost:4200/sede/verificar-email}") String verificationBaseUrl,
                           @Value("${mailing.password-reset-base-url:http://localhost:4200/sede/restablecer-contrasena}") String passwordResetBaseUrl) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.emailGateway = emailGateway;
        this.lockoutManager = lockoutManager;
        this.auditService = auditService;
        this.verificationBaseUrl = verificationBaseUrl;
        this.passwordResetBaseUrl = passwordResetBaseUrl;
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

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRoles());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), user.getEmail());

        user.setRefreshTokenHash(hashToken(refreshToken));
        userRepository.save(user);

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
        user.setOtpExpiry(Instant.now().plusSeconds(OTP_EXPIRY_SECONDS));
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(Instant.now().plusSeconds(OTP_EXPIRY_SECONDS));
        user.setLastVerificationEmailSentAt(Instant.now());

        User saved = userRepository.save(user);

        String verificationUrl = verificationBaseUrl + "?token=" + user.getVerificationToken();
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

        var claims = jwtTokenProvider.getClaims(token);
        String type = claims.get("type", String.class);
        if (!"refresh".equals(type)) {
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Invalid token type");
        }

        UUID userId = jwtTokenProvider.getUserId(token);
        String email = jwtTokenProvider.getEmail(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-401-USER_NOT_FOUND",
                        "User not found"));

        String tokenHash = hashToken(token);
        if (!tokenHash.equals(user.getRefreshTokenHash())) {
            auditService.record(AuditAction.LOGIN, "USER", AuditResult.FAILURE,
                    "Token refresh failed - token hash mismatch for " + email);
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Refresh token has been rotated");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                userId, email, user.getRoles());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                userId, email);

        user.setRefreshTokenHash(hashToken(newRefreshToken));
        userRepository.save(user);

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
            Instant expiry = Instant.now().plusSeconds(PASSWORD_RESET_TOKEN_EXPIRY_SECONDS);

            user.setPasswordResetToken(resetToken);
            user.setPasswordResetExpiry(expiry);
            userRepository.save(user);

            String resetUrl = passwordResetBaseUrl + "?token=" + resetToken;
            try {
                emailGateway.sendPasswordResetEmail(user.getEmail(), user.getDisplayName(), resetUrl);
            } catch (Exception ex) {
                log.error("Password reset email dispatch failed for {}: {}", user.getEmail(), ex.getMessage(), ex);
            }

            log.info("Password reset token persisted for {} (expires at {})",
                    request.email(), expiry);
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

            String verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            user.setVerificationTokenExpiry(now.plusSeconds(OTP_EXPIRY_SECONDS));
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
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-400-INVALID_OTP",
                        "Invalid verification token"));

        if (user.getVerificationTokenExpiry() == null || Instant.now().isAfter(user.getVerificationTokenExpiry())) {
            throw new AuthenticationException(
                    "AUTH-400-INVALID_OTP",
                    "Verification token has expired");
        }

        user.setActive(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
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
        User user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() -> {
                    auditService.record(AuditAction.UPDATE, "USER", AuditResult.FAILURE,
                            "Password reset failed - invalid token");
                    return new AuthenticationException(
                            "AUTH-400-INVALID_TOKEN",
                            "Invalid or expired reset token");
                });

        if (user.getPasswordResetExpiry() == null || Instant.now().isAfter(user.getPasswordResetExpiry())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetExpiry(null);
            userRepository.save(user);
            auditService.record(AuditAction.UPDATE, "USER", AuditResult.FAILURE,
                    "Password reset failed - expired token for " + user.getEmail());
            throw new AuthenticationException(
                    "AUTH-400-INVALID_TOKEN",
                    "Reset token has expired");
        }

        validatePassword(request.newPassword());

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
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
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            try {
                UUID userId = jwtTokenProvider.getUserId(refreshToken);
                userRepository.findById(userId).ifPresent(user -> {
                    user.setRefreshTokenHash(null);
                    userRepository.save(user);
                });
            } catch (Exception e) {
                log.warn("Logout: could not resolve user, logging anyway");
            }
        }
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

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private String generateOtpCode() {
        int value = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", value);
    }

    private String hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}
