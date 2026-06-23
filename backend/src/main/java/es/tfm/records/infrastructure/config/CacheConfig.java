package es.tfm.records.infrastructure.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Caffeine-based cache configuration for read-heavy, rarely-changing data.
 *
 * Cache regions:
 * - procedure-catalog: Procedure types, form schemas, task schemas (TTL 30 min)
 * - public-content: FAQ, legislation, calendar, institutional, organisms, resources, theme (TTL 15 min)
 *
 * See ADR-0015 for rationale.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final int CATALOG_MAX_ENTRIES = 200;
    private static final int PUBLIC_CONTENT_MAX_ENTRIES = 300;
    private static final int CATALOG_TTL_MINUTES = 30;
    private static final int PUBLIC_CONTENT_TTL_MINUTES = 15;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();

        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(CATALOG_MAX_ENTRIES)
                .expireAfterWrite(CATALOG_TTL_MINUTES, TimeUnit.MINUTES)
                .recordStats());

        return manager;
    }
}
