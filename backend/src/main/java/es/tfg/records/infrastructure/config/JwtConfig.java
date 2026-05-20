package es.tfg.records.infrastructure.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Type-safe configuration properties for JWT settings.
 * Validates that a secure secret is configured in production environments.
 */
@ConfigurationProperties(prefix = "jwt")
@Component
public class JwtConfig {

    private String secret;
    private String issuer;
    private long accessTokenExpiration;
    private long refreshTokenExpiration;

    private final Environment environment;

    public JwtConfig(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateSecret() {
        if (environment == null) {
            return;
        }
        boolean isProd = environment.acceptsProfiles("prod") || environment.acceptsProfiles("production");
        String activeProfiles = String.join(",", environment.getActiveProfiles());

        if (isProd && (secret == null || secret.isEmpty() || secret.contains("change-me") || secret.contains("dev-"))) {
            throw new IllegalStateException(
                    "JWT secret is not configured for production. " +
                    "Set the JWT_SECRET environment variable to a secure Base64-encoded key " +
                    "(at least 256 bits). Active profiles: " + activeProfiles);
        }
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public void setAccessTokenExpiration(long accessTokenExpiration) {
        this.accessTokenExpiration = accessTokenExpiration;
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    public void setRefreshTokenExpiration(long refreshTokenExpiration) {
        this.refreshTokenExpiration = refreshTokenExpiration;
    }
}
