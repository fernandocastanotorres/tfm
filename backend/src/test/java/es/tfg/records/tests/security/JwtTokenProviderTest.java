package es.tfg.records.tests.security;

import es.tfg.records.infrastructure.config.JwtConfig;
import es.tfg.records.infrastructure.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private JwtConfig jwtConfig;

    @BeforeEach
    void setUp() {
        MockEnvironment env = new MockEnvironment();
        jwtConfig = new JwtConfig(env);
        jwtConfig.setSecret("dGVzdC1zZWNyZXQta2V5LXRoYXQtaXMtYXQtbGVhc3QtMzItY2hhcnMtbG9uZyE=");
        jwtConfig.setIssuer("records-api");
        jwtConfig.setAccessTokenExpiration(3600000L);
        jwtConfig.setRefreshTokenExpiration(86400000L);
        tokenProvider = new JwtTokenProvider(jwtConfig);
    }

    @Test
    void generateAccessToken_shouldCreateValidToken() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        Set<String> roles = Set.of("ROLE_CITIZEN");

        String token = tokenProvider.generateAccessToken(userId, email, roles);

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void generateAccessToken_shouldContainCorrectClaims() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        Set<String> roles = Set.of("ROLE_CITIZEN", "ROLE_ADMIN");

        String token = tokenProvider.generateAccessToken(userId, email, roles);
        Claims claims = tokenProvider.getClaims(token);

        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.getIssuer()).isEqualTo("records-api");
        assertThat(claims.get("email", String.class)).isEqualTo(email);
        assertThat(claims.get("type", String.class)).isEqualTo("access");
    }

    @Test
    void generateAccessToken_shouldContainRoles() {
        UUID userId = UUID.randomUUID();
        Set<String> roles = Set.of("ROLE_CITIZEN", "ROLE_ADMIN");

        String token = tokenProvider.generateAccessToken(userId, "test@example.com", roles);

        List<String> extractedRoles = tokenProvider.getRoles(token);
        assertThat(extractedRoles).containsExactlyInAnyOrder("ROLE_CITIZEN", "ROLE_ADMIN");
    }

    @Test
    void generateAccessToken_shouldExtractUserId() {
        UUID userId = UUID.randomUUID();

        String token = tokenProvider.generateAccessToken(userId, "test@example.com", Set.of());

        assertThat(tokenProvider.getUserId(token)).isEqualTo(userId);
    }

    @Test
    void generateRefreshToken_shouldCreateValidToken() {
        UUID userId = UUID.randomUUID();

        String token = tokenProvider.generateRefreshToken(userId, "test@example.com");

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void generateRefreshToken_shouldHaveRefreshType() {
        UUID userId = UUID.randomUUID();

        String token = tokenProvider.generateRefreshToken(userId, "test@example.com");
        Claims claims = tokenProvider.getClaims(token);

        assertThat(claims.get("type", String.class)).isEqualTo("refresh");
        assertThat(claims.get("roles")).isNull();
    }

    @Test
    void validateToken_shouldReturnFalseForInvalidToken() {
        assertThat(tokenProvider.validateToken("invalid-token")).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForEmptyToken() {
        assertThat(tokenProvider.validateToken("")).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForTamperedToken() {
        UUID userId = UUID.randomUUID();
        String token = tokenProvider.generateAccessToken(userId, "test@example.com", Set.of());
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";

        assertThat(tokenProvider.validateToken(tampered)).isFalse();
    }

    @Test
    void getClaims_shouldThrowForInvalidToken() {
        assertThatThrownBy(() -> tokenProvider.getClaims("invalid-token"))
                .isInstanceOf(Exception.class);
    }

    @Test
    void getUserId_shouldThrowForInvalidToken() {
        assertThatThrownBy(() -> tokenProvider.getUserId("invalid-token"))
                .isInstanceOf(Exception.class);
    }

    @Test
    void getEmail_shouldReturnEmailFromToken() {
        String email = "user@domain.com";
        String token = tokenProvider.generateAccessToken(UUID.randomUUID(), email, Set.of());

        assertThat(tokenProvider.getEmail(token)).isEqualTo(email);
    }

    @Test
    void getRoles_shouldReturnEmptyListWhenNoRoles() {
        String token = tokenProvider.generateRefreshToken(UUID.randomUUID(), "test@example.com");

        assertThat(tokenProvider.getRoles(token)).isEmpty();
    }

    @Test
    void getAccessTokenExpiration_shouldReturnConfiguredValue() {
        assertThat(tokenProvider.getAccessTokenExpiration()).isEqualTo(3600000L);
    }
}
