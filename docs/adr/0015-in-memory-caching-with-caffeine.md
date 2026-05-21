# ADR-0015: In-Memory Caching with Caffeine for Read-Heavy Endpoints

## Status
Accepted

## Date
2026-05-21

## Context

The platform serves two categories of endpoints with very different access patterns:

1. **Read-heavy, rarely-changing data**: Procedure catalog, public content (FAQ, institutional pages, legislation, calendar, organisms, resources). These are queried on every page load by anonymous citizens and change only when an admin updates them via backoffice.

2. **Read-write, user-specific data**: Case details, documents, messages, profile. These change frequently and are scoped to individual users.

The first category represents the majority of anonymous traffic but currently hits PostgreSQL on every request. Each catalog query involves `procedure_type` + `procedure_type_i18n` joins across 5 locales. Public content queries scan `public_content_entry` with locale resolution logic.

Adding Redis would introduce:
- An additional container service in `docker-compose.yml`
- Network configuration and health checks
- Serialization/deserialization overhead
- Operational complexity for a single-node deployment

## Decision

Use **Spring Cache abstraction with Caffeine** as the in-memory cache provider for read-heavy, rarely-changing endpoints.

### Scope

Cached data:
- Procedure catalog (list, detail, form schema, task schema)
- Public content (legislation, FAQ, calendar, institutional, organisms, resources, theme palette)

Not cached:
- User-specific data (cases, documents, messages, profile)
- Admin listing endpoints (need real-time data)
- Authentication/session data

### Configuration

- **Max entries**: 500 per cache region
- **TTL**: 30 minutes for catalog, 15 minutes for public content
- **Eviction**: Manual `@CacheEvict` on admin create/update/delete operations

## Rationale

### Why Caffeine over Redis

| Criterion | Caffeine | Redis |
|-----------|----------|-------|
| Infrastructure | Zero (in-process) | Additional container |
| Latency | Sub-millisecond (in-JVM) | ~1-5ms (network round-trip) |
| Complexity | 1 dependency, 1 config class | Container, connection pool, serialization |
| Single-node | Optimal | Overkill |
| Multi-node | Not suitable | Required |
| Spring integration | Native `@Cacheable` | Native `@Cacheable` |

For a single Spring Boot instance (the TFG deployment model), Caffeine provides the same developer experience (`@Cacheable`, `@CacheEvict`) with zero operational overhead.

### Why not HTTP caching

HTTP `Cache-Control` headers could work for public endpoints but:
- Don't cover authenticated endpoints (catalog with user context)
- Harder to invalidate on data changes
- Browser caches are unpredictable

### Compliance considerations

- Cached data is derived from the database; no personal data is stored
- Cache is in-memory only; cleared on application restart
- ENS audit log is not affected (caching is transparent to the audit layer)

## Consequences

### Positive
- Reduced database load for anonymous traffic (catalog + public content)
- Sub-millisecond response times for cached endpoints
- Zero infrastructure changes (no new containers)
- Same Spring Cache API works if we migrate to Redis later
- Easy to measure impact via actuator cache metrics

### Negative
- Cache staleness: up to 30 minutes for catalog, 15 minutes for public content
- Memory usage: ~500 entries × avg object size (negligible for this dataset)
- Manual cache eviction required on admin operations (risk of stale data if missed)
- Not suitable for multi-instance deployments (would need Redis)

## Alternatives Considered

- **Redis**: Rejected for current scope. Will revisit if deployment scales to multiple backend instances.
- **HTTP Cache-Control**: Deferred. Could complement server-side caching for fully public endpoints.
- **No caching**: The current state. Acceptable for demo load but not representative of production behavior.

## Revisit Criteria

Reevaluate this decision when:
1. Backend scales to 2+ instances (need distributed cache → Redis)
2. Cache hit rate drops below 50% (TTL or max-size misconfigured)
3. Admin users report stale data complaints (TTL too long)
4. Memory pressure detected (heap analysis shows cache growth)

## References

- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html)
- [Caffeine GitHub](https://github.com/ben-manes/caffeine)
- ADR-0006: Containerized Deployment with Docker Compose
- ADR-0009: Stable Procedure Identifier and DB-Backed Catalog i18n
