# ADR-0017: Select Loki + Grafana (with Promtail) for Container Log Observability

## Status
Accepted

## Date
2026-05-25

## Context
The project needs centralized logs for the Docker Compose stack (`backend`, `frontend`, `backoffice`, `postgres`, `mailpit`) to support:

- Faster incident triage during development and validation
- Cross-service traceability using `correlationId` and request context
- Operational visibility aligned with ENS-oriented controls (auditability and evidence)

The selected solution must work well in local/dev environments, keep infrastructure complexity reasonable, and avoid introducing heavy dependencies that compete with the functional stack resources.

## Decision
Adopt **Loki + Grafana + Promtail** as the default centralized logging stack for this repository.

Implementation principles:

- Keep Docker service log driver as `json-file`
- Use Promtail to collect Docker container logs and push to Loki
- Use Grafana for log exploration, dashboarding, and alerting
- Standardize backend logs as structured JSON for better queryability

## Rationale

### Why this option fits this project

1. **Lower operational footprint than Elasticsearch-based stacks**
   - Loki indexes labels, not full log bodies, which drastically reduces storage and RAM needs for this scale.
2. **Native Docker Compose fit**
   - Promtail can scrape Docker logs without replacing runtime logging drivers or adding sidecars per service.
3. **Fast path to value**
   - Grafana provisioning enables datasource, dashboards, and alerting with versioned files in-repo.
4. **Structured backend logs already leveraged**
   - Spring Boot JSON logs can be parsed and labeled (`level`, `logger`, `correlationId`) for focused troubleshooting.
5. **Good growth path**
   - The same stack can later connect to Alertmanager/webhooks, Telegram notifications, and retention-by-environment without re-platforming.

## Consequences

### Positive
- Centralized, searchable logs across all services in one place
- Better incident diagnosis via label-based filtering and correlation IDs
- Lower resource usage than ELK/OpenSearch-first approaches
- Observability configuration is declarative and version-controlled

### Negative
- Query model is label-centric; full-text historical analytics are less powerful than Elasticsearch for some use cases
- Requires discipline in label design to avoid high-cardinality performance issues
- Adds three new services to local compose (`loki`, `promtail`, `grafana`)

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Graylog + Elasticsearch/OpenSearch + MongoDB** | Mature log management UX, pipelines, enterprise familiarity | High footprint and operational complexity for this project size; more moving parts | Rejected (for now) |
| **ELK (Elasticsearch + Logstash + Kibana)** | Powerful search and ecosystem | Heavier memory/CPU and maintenance cost; overkill for current scope | Rejected |
| **OpenSearch + OpenSearch Dashboards + Fluent Bit** | Strong open-source stack, no Elastic license concerns | Still heavier than Loki stack, more ops overhead for local environment | Deferred |
| **Cloud-managed logging only** | Minimal local ops | Weak local/offline reproducibility; external dependency for day-to-day debugging | Rejected |
| **Loki + Grafana + Promtail** | Lightweight, compose-friendly, quick setup, good observability baseline | Less advanced full-text analytics vs ES | Selected |

## Revisit Criteria
- If log volume grows beyond label-centric query efficiency, evaluate OpenSearch/Graylog migration.
- If compliance requires advanced retention/legal hold features not covered by current setup, reassess platform.
- If multi-tenant observability becomes mandatory, evaluate stronger tenancy/isolation capabilities.

## References
- [ADR-0006](./0006-containerized-deployment-with-docker-compose.md) — Containerized deployment baseline
- [ADR-0007](./0007-architectural-style-hexagonal-boundaries.md) — Operational boundaries and maintainability principles
- `docker-compose.yml` — observability services (`loki`, `promtail`, `grafana`)
- `infrastructure/loki/config.yml`
- `infrastructure/promtail/config.yml`
- `infrastructure/grafana/provisioning/datasources/loki.yml`
