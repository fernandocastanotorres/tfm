package es.tfm.records.entrypoints.config;

// Temporalmente removido: import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
// Temporalmente deshabilitado: import org.springframework.security.test.context.support.WithMockUser;

// Temporalmente removido: @TestConfiguration
public class TestSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
