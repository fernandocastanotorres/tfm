package es.tfg.records.application.service;

import es.tfg.records.application.dto.*;
import es.tfg.records.application.exception.AuthenticationException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ValidationException;
import es.tfg.records.application.mapper.UserMapper;
import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.UserRepository;
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

    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d).{8,}$");

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailGateway emailGateway;
    private final String verificationBaseUrl;

    // In-memory password reset token store for development
    private final Map<String, ResetTokenEntry> resetTokenStore = new HashMap<>();

    private final Map<String, Instant> resendVerificationThrottle = new HashMap<>();

    // In-memory refresh token store for rotation
    private final Set<String> activeRefreshTokens = new HashSet<>();

    public AuthServiceImpl(UserRepository userRepository,
                           JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder,
                           EmailGateway emailGateway,
                           @Value("${mailing.verification-base-url:http://localhost:4200/sede/verificar-email}") String verificationBaseUrl) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.emailGateway = emailGateway;
        this.verificationBaseUrl = verificationBaseUrl;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-401-INVALID_CREDENTIALS",
                        "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthenticationException(
                    "AUTH-401-INVALID_CREDENTIALS",
                    "Invalid email or password");
        }

        if (!user.isActive()) {
            throw new AuthenticationException(
                    "AUTH-401-ACCOUNT_NOT_ACTIVE",
                    "Account is not verified. Please verify your OTP first.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRoles());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), user.getEmail());

        // Track refresh token for rotation
        activeRefreshTokens.add(refreshToken);

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

        String otpCode = UUID.randomUUID().toString();
        user.setOtpCode(otpCode);
        user.setOtpExpiry(Instant.now().plusSeconds(86400));

        User saved = userRepository.save(user);

        String verificationUrl = verificationBaseUrl + "?token=" + otpCode;
        emailGateway.sendVerificationEmail(request.email(), request.fullName(), verificationUrl);
        log.info("Verification email generated for {} with expiry {}", request.email(), user.getOtpExpiry());

        return UserMapper.toUserProfile(saved);
    }

    @Override
    public LoginResponse refreshToken(TokenRefreshRequest request) {
        String token = request.refreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Refresh token is expired or invalid");
        }

        // Check if token is in active set (not already rotated)
        if (!activeRefreshTokens.contains(token)) {
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Refresh token has been rotated");
        }

        // Validate it's a refresh token
        var claims = jwtTokenProvider.getClaims(token);
        String type = claims.get("type", String.class);
        if (!"refresh".equals(type)) {
            throw new AuthenticationException(
                    "AUTH-401-TOKEN_EXPIRED",
                    "Invalid token type");
        }

        // Rotation: invalidate old token
        activeRefreshTokens.remove(token);

        UUID userId = jwtTokenProvider.getUserId(token);
        String email = jwtTokenProvider.getEmail(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(
                        "AUTH-401-USER_NOT_FOUND",
                        "User not found"));

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                userId, email, user.getRoles());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                userId, email);

        activeRefreshTokens.add(newRefreshToken);

        return new LoginResponse(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration() / 1000,
                UserMapper.toUserProfile(user));
    }

    @Override
    public void forgotPassword(PasswordResetRequest request) {
        // Always return 200 regardless of email existence (security best practice)
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plusSeconds(3600); // 1 hour

            resetTokenStore.put(resetToken, new ResetTokenEntry(user.getId(), expiry));

            // Dev mode: log the reset token
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
            Instant nextAllowed = resendVerificationThrottle.get(request.email());
            if (nextAllowed != null && now.isBefore(nextAllowed)) {
                return;
            }

            String verificationToken = UUID.randomUUID().toString();
            user.setOtpCode(verificationToken);
            user.setOtpExpiry(now.plusSeconds(86400));
            userRepository.save(user);

            String verificationUrl = verificationBaseUrl + "?token=" + verificationToken;
            emailGateway.sendVerificationEmail(user.getEmail(), user.getDisplayName(), verificationUrl);
            resendVerificationThrottle.put(request.email(), now.plusSeconds(60));
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

        // Activate account
        user.setActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        log.info("Account verified for: {}", request.email());
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
        return UserMapper.toUserProfile(userRepository.save(user));
    }

    @Override
    public void resetPassword(PasswordResetConfirmRequest request) {
        ResetTokenEntry entry = resetTokenStore.get(request.token());
        if (entry == null) {
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
    }

    @Override
    public void logout(String refreshToken) {
        // Invalidate the refresh token by removing it from the active set
        activeRefreshTokens.remove(refreshToken);
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
            throw new ValidationException(errors);
        }
    }

    private record ResetTokenEntry(UUID userId, Instant expiry) {}
}
