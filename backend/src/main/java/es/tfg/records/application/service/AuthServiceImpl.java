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

    // In-memory OTP store for development (console log mode)
    private final Map<String, OtpEntry> otpStore = new HashMap<>();

    // In-memory password reset token store for development
    private final Map<String, ResetTokenEntry> resetTokenStore = new HashMap<>();

    // In-memory refresh token store for rotation
    private final Set<String> activeRefreshTokens = new HashSet<>();

    public AuthServiceImpl(UserRepository userRepository,
                           JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
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
        user.setDisplayName(request.displayName());
        user.setRoles(Set.of("ROLE_CITIZEN"));
        user.setActive(false);

        // Generate OTP
        String otpCode = generateOtp();
        user.setOtpCode(otpCode);
        user.setOtpExpiry(Instant.now().plusSeconds(900)); // 15 minutes

        User saved = userRepository.save(user);

        // Store OTP for verification (dev mode - console log)
        otpStore.put(request.email(), new OtpEntry(otpCode, user.getOtpExpiry()));
        log.info("=== OTP FOR {} === Code: {} (expires at {}) ===",
                request.email(), otpCode, user.getOtpExpiry());

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

        OtpEntry entry = otpStore.get(request.email());
        if (entry == null || !entry.code().equals(request.code())) {
            throw new AuthenticationException(
                    "AUTH-400-INVALID_OTP",
                    "Invalid OTP code");
        }

        if (Instant.now().isAfter(entry.expiry())) {
            otpStore.remove(request.email());
            throw new AuthenticationException(
                    "AUTH-400-INVALID_OTP",
                    "OTP code has expired");
        }

        // Activate account
        user.setActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        otpStore.remove(request.email());
        log.info("Account verified for: {}", request.email());
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

    private String generateOtp() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }

    private record OtpEntry(String code, Instant expiry) {}

    private record ResetTokenEntry(UUID userId, Instant expiry) {}
}
