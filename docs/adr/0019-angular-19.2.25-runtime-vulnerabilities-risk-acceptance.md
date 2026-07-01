# ADR-0019: Angular 19.2.25 Runtime Vulnerabilities — Risk Acceptance Pending Upstream Release

## Status
Accepted

## Date
2026-07-01

## Context
`npm audit` on both Angular projects (`front-end/`, `back-office/`) reports multiple vulnerabilities in `@angular/core`, `@angular/common`, `@angular/compiler`, and `@angular/common` dependent packages (router, forms, animations, platform-browser). The advisories state fixes are available in version `19.2.26`. However, `19.2.25` is the latest published version on npm as of 2026-07-01.

| Package | Severity | CVE / Advisory | Fix Version |
|---------|----------|----------------|-------------|
| `@angular/common` | HIGH | GHSA-p3vc-36g9-x9gr (DoS via OOM in Number Formatting) | 19.2.26 |
| `@angular/common` | HIGH | GHSA-q6f4-qqrg-jv6x (Information Leak via HttpTransferCache) | 19.2.26 |
| `@angular/common` | HIGH | GHSA-48r7-hpm6-gfxm (DoS via OOM in Date Formatting) | 19.2.26 |
| `@angular/common` | HIGH | GHSA-39pv-4j6c-2g6v (Cache Key Collision in HttpTransferCache) | 19.2.26 |
| `@angular/core` | HIGH | GHSA-rgjc-h3x7-9mwg (Client Hydration DOM Clobbering & Response-Cache Poisoning) | 19.2.26 |
| `@angular/compiler` | MODERATE | GHSA-58w9-8g37-x9v5 (Two-Way Binding Sanitization Bypass XSS) | 19.2.26 |
| `@angular/service-worker` | HIGH | GHSA-gv2q-mqqv-365m (Policy-Bypass & Credential-Stripping) | 19.2.26 |
| `@babel/core` | MODERATE | GHSA-4x5r-pxfx-6jf8 (Arbitrary File Read via sourceMappingURL) | — (pinned by @angular/compiler-cli) |

The only "fix" `npm audit` offers is `npm audit fix --force`, which would upgrade to Angular 22.0.x — a **breaking change** incompatible with the project's current LTS strategy (Angular 19.x).

Additionally, `http-proxy-middleware` (<3.0.7) was resolved via `package.json` overrides in the same session, which is the only actionable vulnerability.

## Decision
Accept the risk. Apply `npm audit fix` (safe patches only) once Angular publishes `19.2.26+`. No `--force` upgrade.

## Rationale

### No Fix Available
Angular has acknowledged the vulnerabilities and assigned fixes to `19.2.26`, but this version has not been published to npm. The project is at the latest available secure version. There is no action to take without introducing breaking changes.

### Already Applied Mitigations
- `http-proxy-middleware` forced to `3.0.7` via `overrides` in `package.json` (build-only dependency, zero runtime exposure)
- Multi-stage Docker builds isolate build tools from production (see ADR-0016)
- Angular Service Worker already disabled for `index.html` caching (see session fix)

### Risk Assessment
- **@angular/common DoS (OOM)**: Requires attacker-controlled `digitsInfo` or `formatDate` input reaching server-side rendering or a trusted form field. This application uses client-side rendering and server-provided form schemas — untrusted user input does not reach Angular number/date formatting APIs directly. DoS is limited to client browser tab.
- **@angular/common HttpTransferCache leak**: Only affects `HttpClient` with `transferCache` enabled (used in SSR hydration). This application uses CSR-only Angular with no `TransferHttpCache` module. Exploitation path does not exist.
- **@angular/core DOM Clobbering**: Affects Angular SSR hydration. This application does not use Angular Universal or hydration. No exploitation path.
- **@angular/compiler XSS**: Requires attacker-controlled `[(ngModel)]` two-way binding templates processed by JIT compiler. Production builds use AOT compilation — templates are pre-compiled at build time. No runtime template compilation.
- **@angular/service-worker**: Already mitigated — `ngsw-config.json` does not prefetch `index.html` and cross-origin `dataGroups` are removed.
- **@babel/core file read**: Build-time only. Not present in runtime image (multi-stage Docker). No exploitation path.

## Consequences

### Positive
- No breaking changes introduced
- Stay on Angular 19 LTS path
- Clear compliance documentation for ENS Medium Level audit
- Upgrade path defined and ready when `19.2.26` is released

### Negative
- `npm audit` will continue reporting vulnerabilities until Angular publishes `19.2.26`
- May trigger false positives in automated security scanners
- Requires monitoring of Angular release schedule

## Action Plan
1. **Immediate**: Accept risk, document via this ADR
2. **Monitor**: Track `https://github.com/angular/angular/releases` for `19.2.26`
3. **On release**: Run `npm audit fix` in both `front-end/` and `back-office/`, verify builds and tests pass, commit updated `package-lock.json`
4. **Close this ADR record** once vulnerabilities are resolved by upstream patch

## Revisit Criteria
- When Angular publishes `19.2.26` or later, apply `npm audit fix` and verify
- If a critical CVE with confirmed exploitation path in this application emerges, consider forcing overrides or backporting patches
- If Angular 19.x reaches end of LTS before vulnerabilities are fixed, escalate to Angular 22 migration

## References
- [ADR-0016](./0016-npm-audit-devdependencies-risk-acceptance.md) — Precedent for build-time vulnerability acceptance
- [ADR-0013](./0013-framework-version-selection-lts-strategy.md) — LTS-first version strategy
- [GHSA-p3vc-36g9-x9gr](https://github.com/advisories/GHSA-p3vc-36g9-x9gr) — @angular/common DoS
- [GHSA-q6f4-qqrg-jv6x](https://github.com/advisories/GHSA-q6f4-qqrg-jv6x) — @angular/common Information Leak
- [GHSA-48r7-hpm6-gfxm](https://github.com/advisories/GHSA-48r7-hpm6-gfxm) — @angular/common DoS
- [GHSA-39pv-4j6c-2g6v](https://github.com/advisories/GHSA-39pv-4j6c-2g6v) — @angular/common Cache Collision
- [GHSA-rgjc-h3x7-9mwg](https://github.com/advisories/GHSA-rgjc-h3x7-9mwg) — @angular/core DOM Clobbering
- [GHSA-58w9-8g37-x9v5](https://github.com/advisories/GHSA-58w9-8g37-x9v5) — @angular/compiler XSS
- [GHSA-gv2q-mqqv-365m](https://github.com/advisories/GHSA-gv2q-mqqv-365m) — @angular/service-worker
- [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) — @babel/core File Read
