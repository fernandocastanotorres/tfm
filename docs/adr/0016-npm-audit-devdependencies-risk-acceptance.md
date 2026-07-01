# ADR-0016: npm Audit DevDependencies — Risk Acceptance Through Multi-Stage Build Isolation

## Status
Accepted

## Date
2026-05-25 (updated 2026-07-01 after Angular 20 upgrade)

## Context
`npm audit` on both Angular frontends (`front-end/`, `back-office/`) reports vulnerabilities in **npm packages** used during the build process. These are not runtime dependencies — they are development tools used by the Angular CLI, webpack dev server, and Karma test runner.

After running `npm audit fix` and upgrading `@angular/cli` from 19 → 21 (ADR-0013 said even LTS-only; CLI 21 was accepted as it is a dev-only tool, not a runtime framework), the remaining vulnerabilities are:

| Package | Severity | CVE / Advisory | Fix Available |
|---------|----------|----------------|---------------|
| `serialize-javascript` (&le;7.0.4) | HIGH | RCE via `RegExp.flags` + CPU exhaustion DoS | **No** (pinned by `copy-webpack-plugin`, itself pinned by `@angular-devkit/build-angular`) |
| `uuid` (&lt;11.1.1) | MODERATE | Missing buffer bounds check in v3/v5/v6 | **No** (pinned by `sockjs@0.3.24` → `webpack-dev-server`. Latest sockjs still requires `uuid@^8.3.2`, no patched v8/v9 version exists. Overriding to uuid@14 breaks sockjs API.) || `tmp` (&lt;0.2.7) | HIGH | Prototype pollution via crafted temporary file paths | **No** (pinned by `karma` → `@angular-devkit/build-angular`, `karma-jasmine`, `karma-jasmine-html-reporter`) |

These propagate through the dependency chain:
- `serialize-javascript` → `copy-webpack-plugin` → `@angular-devkit/build-angular`
- `uuid` → `sockjs` → `webpack-dev-server`
- `tmp` → `karma` → `@angular-devkit/build-angular` / `karma-jasmine` / `karma-jasmine-html-reporter`

All affected packages are **build-time devDependencies** installed via `npm ci` during the Docker build stage. Neither the Angular compiled bundles nor the production nginx image contain any of these packages.

## Decision
Accept the risk. Take no further action on `serialize-javascript` and `uuid` vulnerabilities.

## Rationale

### Multi-Stage Docker Build Isolation
The `Dockerfile` uses a **multi-stage build** pattern:

```
Stage 1 (build)   : node:20-alpine → npm ci → ng build
Stage 2 (runtime) : nginx:1.25-alpine → COPY --from=build /app/dist/ /usr/share/nginx/html/
```

The production image (`nginx:1.25-alpine`) contains:
- Only the compiled static assets (`.js`, `.css`, `.html`)
- Zero `node_modules`, zero npm packages, zero build tools

The vulnerabilities in `serialize-javascript` and `uuid` are **not present** in the runtime image. They exist only ephemerally during the build stage, inside a container that is discarded after compilation.

### No Exploitation Path in Production
- `serialize-javascript` (RCE via crafted serialized data) requires an attacker to control serialized JavaScript input. This package runs only during `ng build` in the CI/CD pipeline. An external attacker cannot reach it.
- `uuid` (buffer bounds) requires calling the vulnerable API with a crafted buffer. This package is used only by `sockjs` (webpack dev server), which does not run in production.

### No Fix Available
Neither vulnerability has a patched version available without upgrading `@angular-devkit/build-angular` to a version that drops `copy-webpack-plugin` (requires Angular CLI 22+, currently pre-release and incompatible with the rest of the stack).

### Fixes Already Applied
The following were resolved without production impact:
- `engine.io`, `socket.io-adapter`, `ws` — patched via `npm audit fix`
- `qs` (DoS) — patched via `npm audit fix`
- `picomatch` (glob injection) — patched via `npm audit fix`
- `tar` / `pacote` — resolved by upgrading `@angular/cli` 19 → 21

## Consequences

### Positive
- Zero production attack surface from npm vulnerabilities
- No maintenance burden from chasing build-tool patches
- Clear audit trail for ENS Medium Level compliance review

### Negative
- `npm audit` will continue reporting 6 vulnerabilities (5 moderate, 1 high)
- May trigger false positives in automated security scanners that do not distinguish build vs. runtime
- Requires an explicit risk acceptance record (this ADR)

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Overrides in `package.json`** | Force newer `serialize-javascript` / `uuid` | Angular build tools may break with untested versions; `copy-webpack-plugin` pins exact minor range | **Rejected** — breaks `npm ci` |
| **Upgrade to Angular CLI 22+** | Drops Webpack for ESBuild/Vite, removes `copy-webpack-plugin` | Pre-release, requires Angular core 22+, would force Angular framework upgrade | **Deferred** — post-TFG |
| **Ignore all audit results** | Zero effort | Fails ENS audit trail requirement | **Rejected** |
| **Fix what is fixable + document the rest** | Clear rationale, auditable, no production risk | `npm audit` still shows warnings | **Selected** |

## Revisit Criteria
- If `@angular-devkit/build-angular` releases a version that removes `copy-webpack-plugin` (i.e., completes the ESBuild/Vite migration), re-run `npm audit fix` to eliminate `serialize-javascript`
- If `uuid` 11.1.1+ becomes compatible with `sockjs` range, apply the fix
- If an automated security scanner flags these in a production audit, reference this ADR

## References
- [ADR-0006](./0006-containerized-deployment-with-docker-compose.md) — Multi-stage Docker build
- [ADR-0013](./0013-framework-version-selection-lts-strategy.md) — LTS-first version strategy
- [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq) — serialize-javascript RCE
- [GHSA-qj8w-gfj5-8c6v](https://github.com/advisories/GHSA-qj8w-gfj5-8c6v) — serialize-javascript DoS
- [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — uuid buffer bounds
