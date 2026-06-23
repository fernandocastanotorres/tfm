package es.tfm.records.infrastructure.config;

import es.tfm.records.infrastructure.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Bean configuration for JWT infrastructure components.
 */
@Configuration
public class JwtBeanConfig {

    @Bean
    public JwtTokenProvider jwtTokenProvider(JwtConfig jwtConfig) {
        return new JwtTokenProvider(jwtConfig);
    }
}
