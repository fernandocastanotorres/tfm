package es.tfg.records.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables Spring Data JPA auditing for @CreatedDate and @LastModifiedDate.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
