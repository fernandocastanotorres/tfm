package es.tfg.records.infrastructure.config;

import es.tfg.records.infrastructure.security.JwtAuthenticationFilter;
import es.tfg.records.infrastructure.security.JwtTokenProvider;
import es.tfg.records.infrastructure.security.RateLimitFilter;
import es.tfg.records.infrastructure.security.SecurityHeadersFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;

/**
 * Spring Security configuration with JWT filter chain and role-based access.
 *
 * Security chain order (first to last):
 * 1. CorrelationIdFilter — adds X-Correlation-Id to MDC and response
 * 2. SecurityHeadersFilter — adds ENS-compliant security headers
 * 3. RateLimitFilter — rate limits auth endpoints
 * 4. JwtAuthenticationFilter — validates JWT and sets SecurityContext
 * 5. Spring Security authorization — enforces role-based access rules
 *
 * Public endpoints (no JWT required): auth endpoints, health/liveness,
 * H2 console (dev only), and OpenAPI documentation (dev only).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/auth/login",
            "/auth/register",
            "/auth/verify-otp",
            "/auth/verify-email",
            "/auth/forgot-password",
            "/auth/resend-verification",
            "/auth/reset-password",
            "/auth/refresh",
            "/auth/logout",
            "/citizen/contact",
            "/health/live",
            "/health/ready",
            "/actuator/health"
    };

    private static final String[] CITIZEN_ENDPOINTS = {
            "/citizen/**"
    };

    private static final String[] ADMIN_ONLY_ENDPOINTS = {
            "/admin/users/**",
            "/admin/procedure-types/**",
            "/health/ready"
    };

    private static final String[] BACKOFFICE_ENDPOINTS = {
            "/admin/**"
    };

    private final JwtTokenProvider jwtTokenProvider;
    private final CorrelationIdFilter correlationIdFilter;
    private final SecurityHeadersFilter securityHeadersFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                          CorrelationIdFilter correlationIdFilter,
                          SecurityHeadersFilter securityHeadersFilter,
                          RateLimitFilter rateLimitFilter) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.correlationIdFilter = correlationIdFilter;
        this.securityHeadersFilter = securityHeadersFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/citizen/procedures/catalog/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/citizen/procedures/catalog/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/citizen/public-content/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/citizen/public-content/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(ADMIN_ONLY_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(BACKOFFICE_ENDPOINTS).hasAnyRole("TRAMITADOR", "ADMIN")
                        .requestMatchers(CITIZEN_ENDPOINTS).hasAnyRole("CITIZEN", "ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.deny())
                )
                .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(securityHeadersFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * H2 console security override — only enabled when 'h2' profile is active.
     * In all other profiles, H2 console remains blocked by the frameOptions DENY above.
     */
    @Bean
    @Profile("h2")
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/h2-console/**")
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin())
                )
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
