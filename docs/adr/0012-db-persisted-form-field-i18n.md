# ADR-0012: DB-Persisted Form Field i18n for Dynamic Procedure Forms

## Status
Proposed

## Date
2026-05-18

## Context
The citizen portal renders dynamic forms from JSON schemas stored in the `procedure_tasks.form_schema` column. Each field contains display text (`name`, `placeholder`, `options[].label`) as literal strings in the default language (Spanish).

When a user switches locale via `ngx-translate`, the form labels remain in Spanish because the text is hardcoded in the database JSON. The current i18n pattern for procedures uses `procedure_type_i18n` (DB-backed) with `MessageSource` fallback for task titles, but form fields have no translation mechanism at all.

Constraints:
- Must support all official languages: es-ES, ca-ES, eu-ES, gl-ES, va-ES
- Admins must be able to manage translations from the backoffice without code changes
- Must be consistent with existing catalog i18n pattern (ADR-0009)
- Frontend already applies `| translate` pipe to field names/placeholders
- The `Accept-Language` header is already resolved by `LocaleContextHolder`

## Decision
Create a new table `procedure_task_field_i18n` that stores translations for form field display text, keyed by `(procedure_type_id, task_order_index, field_id, locale)`.

The `form_schema` JSON will store only structural metadata (type, validation, required, options values). Display text (`name`, `placeholder`, `options[].label`) will be resolved from the i18n table at request time based on `Accept-Language`, with fallback to the default locale and then to the raw JSON value.

### Table Schema
```sql
CREATE TABLE procedure_task_field_i18n (
    id              UUID PRIMARY KEY,
    procedure_type_id UUID NOT NULL REFERENCES procedure_types(id),
    task_order_index  INT NOT NULL,
    field_id          VARCHAR(100) NOT NULL,
    locale            VARCHAR(10) NOT NULL,
    name              VARCHAR(255),
    placeholder       VARCHAR(255),
    options_json      TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_field_i18n UNIQUE (procedure_type_id, task_order_index, field_id, locale)
);
```

### Resolution Flow
1. `ProcedureCatalogI18nService.localizeFormField()` receives a `FormFieldDto` + `ProcedureType`
2. Resolves locale from `Accept-Language` header
3. Queries `procedure_task_field_i18n` for matching translation
4. Falls back to default locale (es-ES) translation
5. Falls back to the raw JSON value from `form_schema`

### Frontend
No changes needed. The template already uses `{{ field.name | translate }}` and `{{ field.placeholder | translate }}`. The backend will return translated text in the DTO, so the `translate` pipe will pass it through unchanged (no matching key = returns as-is).

## Rationale
- **Consistency**: Extends the existing DB-backed i18n pattern (ADR-0009) to form fields
- **Admin-manageable**: Translations can be CRUD'd from the backoffice without code deploys
- **No frontend changes**: The `| translate` pipe is already applied; translated text flows through naturally
- **Performance**: Single query per procedure detail request (batch load all field i18n for the procedure)
- **Fallback safety**: Three-level fallback (requested locale → default locale → raw JSON) ensures no broken UI

## Consequences
### Positive
- Form labels change automatically when user switches language
- Admins manage all translations from one place (backoffice)
- Consistent with procedure title/description i18n pattern
- No hardcoded translation keys in code or properties files
- Supports adding new languages without code changes

### Negative
- New table adds schema complexity
- Migration needed to populate initial translations from existing formSchema JSON
- Backoffice UI needs form field translation management (new feature)
- Slightly more complex resolution logic in `ProcedureCatalogI18nService`

## Alternatives Considered
- **Translation keys in formSchema**: Store i18n keys (e.g., `FORM.FIELD_FULL_NAME`) instead of text. Rejected because it requires maintaining keys in `.properties` files, breaks admin manageability, and is inconsistent with the DB-backed catalog pattern.
- **MessageSource only**: Use Spring's `MessageSource` with generated keys. Rejected because it couples translations to code deploys and doesn't allow admin management.
- **Frontend-only translation**: Store keys in formSchema and translate in Angular. Rejected because it duplicates translation logic and breaks the backend-driven catalog philosophy.

## Revisit Criteria
- If the number of form fields grows significantly, consider caching the i18n resolution
- If backoffice translation management proves too complex, consider a bulk import/export feature
- If performance becomes an issue, consider denormalizing translations into the formSchema JSON at save time

## References
- ADR-0009: Stable Procedure Identifier and DB-Backed Catalog i18n
- ADR-0002: Angular + Tailwind CSS + Angular Material + ngx-translate for Frontends
- `ProcedureTypeI18nEntity` — existing pattern for procedure-level translations
- `ProcedureCatalogI18nService` — existing i18n resolution service
