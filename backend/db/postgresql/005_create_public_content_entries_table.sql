CREATE TABLE IF NOT EXISTS public_content_entries (
    id UUID PRIMARY KEY,
    entry_kind VARCHAR(32) NOT NULL,
    locale VARCHAR(16) NOT NULL,
    category_code VARCHAR(64),
    value_type VARCHAR(32),
    title_text VARCHAR(512) NOT NULL,
    body_text TEXT,
    event_date DATE,
    external_url VARCHAR(1024),
    download_url VARCHAR(1024),
    related_procedure VARCHAR(128),
    sort_order INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_content_entries_kind ON public_content_entries(entry_kind);
CREATE INDEX IF NOT EXISTS idx_public_content_entries_locale ON public_content_entries(locale);
CREATE INDEX IF NOT EXISTS idx_public_content_entries_kind_published ON public_content_entries(entry_kind, published);
