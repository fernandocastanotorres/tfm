package es.tfg.records.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

/**
 * Configures Spring Data web support with global pagination defaults.
 * Default: page=0, size=20, max size=100.
 */
@Configuration
@EnableSpringDataWebSupport  // Deprecated parameter removed for compatibility
public class PaginationConfig {
    // Spring Data web support automatically applies pageable defaults
    // from @RequestParam annotations in controllers.
    // The CaseController already defines:
    //   page default=0, size default=10, max clamped to 100 in service layer.
    // This configuration enables Page-as-JSON serialization (VIA_DTO mode)
    // for any Spring Data Pageable parameters used across the application.
}
