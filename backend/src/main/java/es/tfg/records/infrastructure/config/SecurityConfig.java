package es.tfg.records.infrastructure.config;

import es.tfg.records.infrastructure.security.JwtAuthenticationFilter;
import es.tfg.records.infrastructure.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration with JWT filter chain and role-based access.
 *
 * Security chain order (first to last):
 * 1. CorrelationIdFilter — adds X-Correlation-Id to MDC and response
 * 2. JwtAuthenticationFilter — validates JWT and sets SecurityContext
 * 3. Spring Security authorization — enforces role-based access rules
 *
 * Public endpoints (no JWT required): auth endpoints, health/liveness,
 * H2 console (dev only), and OpenAPI documentation.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Endpoints accessible without authentication.
     * These are excluded from the JWT filter's authentication requirement.
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/auth/login",
            "/auth/register",
            "/auth/verify-otp",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh",
            "/auth/logout",
            "/health/live",
            "/h2-console/**"
    };

    /**
     * Endpoints accessible by citizens and admins.
     */
    private static final String[] CITIZEN_ENDPOINTS = {
            "/citizen/**"
    };

    /**
     * Endpoints restricted to admin role only.
     */
    private static final String[] ADMIN_ENDPOINTS = {
            "/admin/**",
            "/health/ready"
    };

    private final JwtTokenProvider jwtTokenProvider;
    private final CorrelationIdFilter correlationIdFilter;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, CorrelationIdFilter correlationIdFilter) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.correlationIdFilter = correlationIdFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints — no JWT required
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        // OpenAPI / Swagger — public read access
                        .requestMatchers(HttpMethod.GET, "/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        // Admin-only endpoints
                        .requestMatchers(ADMIN_ENDPOINTS).hasRole("ADMIN")
                        // Citizen endpoints — citizen or admin
                        .requestMatchers(CITIZEN_ENDPOINTS).hasAnyRole("CITIZEN", "ADMIN")
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                        // Allow H2 console iframe in dev
                        .frameOptions(frameOptions -> frameOptions.sameOrigin())
                )
                // Filter chain order: CorrelationId → JwtAuth → UsernamePassword
                .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * JWT authentication filter as a Spring bean.
     * Placed before UsernamePasswordAuthenticationFilter in the chain.
     * Public endpoints are handled by Spring Security's permitAll() rules —
     * the filter still runs but does not block unauthenticated requests.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
