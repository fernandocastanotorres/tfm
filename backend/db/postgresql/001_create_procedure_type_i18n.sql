-- Migration: create procedure_type_i18n for persisted catalog translations
-- Target: PostgreSQL

CREATE TABLE IF NOT EXISTS procedure_type_i18n (
    id UUID PRIMARY KEY,
    procedure_type_id UUID NOT NULL,
    locale VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_procedure_type_i18n_type
        FOREIGN KEY (procedure_type_id)
        REFERENCES procedure_types (id)
        ON DELETE CASCADE,
    CONSTRAINT uk_procedure_type_i18n_locale UNIQUE (procedure_type_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_procedure_type_i18n_locale
    ON procedure_type_i18n (locale);
