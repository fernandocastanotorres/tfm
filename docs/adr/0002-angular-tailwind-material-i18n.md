# ADR-0002: Use Angular + Tailwind CSS + Angular Material + ngx-translate for Frontends

## Status
Accepted

## Date
2026-05-13

## Context
The platform must provide two web applications (citizen and backoffice), dynamic JSON-schema-driven forms, and mandatory WCAG 2.1 AA accessibility with multilingual support.

## Decision
Both frontend modules will be implemented with:
- Angular 17+
- Tailwind CSS for utility-first styling
- Angular Material for accessible component primitives
- `@ngx-translate` for i18n

## Rationale
- Angular offers strong structure, DI, and reactive forms suitable for dynamic schema rendering.
- Angular Material accelerates accessible UI implementation and consistency.
- Tailwind enables fast, maintainable design systems without heavy custom CSS layers.
- ngx-translate provides practical runtime i18n for public administration contexts.

## Consequences
### Positive
- High productivity for complex forms and role-specific UI.
- Better baseline accessibility and consistency.
- Reduced CSS entropy through utility conventions.

### Negative
- Dual styling paradigm (Material + Tailwind) requires clear design guidelines.
- Angular has a steeper learning curve than lighter frameworks.

## Alternatives Considered
- React + component libraries: rejected for this project due to weaker out-of-the-box architectural opinion and higher convention burden for long-lived public-sector systems.
