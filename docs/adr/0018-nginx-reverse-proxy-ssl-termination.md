# ADR-0018: Nginx as Centralized Reverse Proxy with SSL Termination

## Status
Accepted

## Date
2026-06-23

## Context

The current Docker Compose stack exposes services directly on individual ports:
- `frontend` → :4200
- `backoffice` → :4300
- `backend` → :8080
- `grafana` → :3000
- `prometheus` → :9090
- `loki` → :3100
- `mailpit` → :8025

This creates several problems:
1. **No unified entry point** — citizens and internal users must remember different ports
2. **No central SSL termination** — each service would need its own certificate
3. **Internal services exposed** — Prometheus, Loki, Grafana are development tools that should not be directly internet-accessible
4. **CORS complexity** — backend must allow multiple origin ports
5. **No caching layer** — static assets are served without CDN-like optimization

## Decision

Introduce **nginx:1.25-alpine** as the sole entry point for all HTTP/HTTPS traffic:

| Subdomain | Target Service | Internal Port | Purpose |
|---|---|---|---|
| `sede.nbpdev.com` | frontend | 80 | Citizen-facing portal |
| `tramitador.nbpdev.com` | backoffice | 80 | Internal tramitador interface |
| `api.nbpdev.com` | backend | 8080 | REST API for integrations |
| `grafana.nbpdev.com` | grafana | 3000 | Observability dashboards |
| `prometheus.nbpdev.com` | prometheus | 9090 | Metrics collection |
| `loki.nbpdev.com` | loki | 3100 | Log aggregation |
| `mail.nbpdev.com` | mailpit | 8025 | Email inspection UI |

**SSL/TLS:**
- Let's Encrypt with certbot for certificate generation and renewal
- Port 80 only for initial certificate fetch (standalone mode)
- Port 443 is the only publicly exposed port for HTTPS
- Certificates stored in `infrastructure/nginx/certs/`

**Nginx configuration:**
- Virtual host per subdomain using `server_name` directive
- `proxy_pass` to internal service addresses
- Static asset caching headers for Angular builds
- HTTP/2 enabled
- OCSP stapling configured

## Rationale

**Why nginx instead of Traefik, Caddy, or HAProxy?**
- nginx is battle-tested, widely documented, and has proven performance in production
- Native `server_name` routing eliminates need for labels or service discovery
- Existing team familiarity reduces operational burden
- Alpine image keeps footprint minimal
- TLS termination in a single place is a compliance hygiene (ENS Medium requires centralized audit)

**Why subdomains instead of path-based routing?**
- Subdomains provide natural isolation between citizen-facing and internal tools
- Easier SSL certificate assignment per domain
- Cleaner URL structure (`sede.nbpdev.com` vs `nbpdev.com/sede`)
- Internal tools (Grafana, Prometheus) get dedicated domains without path conflicts

**Why not OAuth2 Proxy or similar?**
- Not required by current threat model
- Internal tools are behind corporate VPN/network segmentation assumed
- Can be added later without architectural changes

## Consequences

### Positive
- Single SSL endpoint simplifies certificate management
- Centralized audit log at nginx level for ENS compliance
- CORS configuration simplified — backend only needs to allow `api.nbpdev.com`
- Static asset caching reduces backend load
- Internal services no longer have public attack surface
- Human-readable URLs improve UX

### Negative
- Additional container adds minor operational complexity
- Certbot renewal requires nginx reload orchestration
- Single point of failure (mitigated by health checks and restart policy)
- Local development now needs hosts file entries or dnsmasq

## Alternatives Considered

- **Traefik**: Rejected — requires labels in compose, extra config complexity for simple routing
- **Caddy**: Rejected — automatic HTTPS is convenient but cert storage less flexible for ENS audit requirements
- **HAProxy**: Overkill for this scale; less common in team experience
- **Cloud provider ALB/ALB**: Not portable, ties deployment to specific cloud

## Revisit Criteria

- If multi-region deployment is needed, consider global load balancer with managed certificates
- If OAuth2/OIDC integration becomes required, evaluate oauth2-proxy or Keycloak

## References

- [Let's Encrypt](https://letsencrypt.org/)
- [nginx reverse proxy docs](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- ENS ENS-RD-1: Sistema de nombres de dominio
