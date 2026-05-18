CREATE TABLE transparency_reports (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    "year"      INTEGER      NOT NULL CHECK ("year" >= 2000),
    description TEXT,
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_size   BIGINT       NOT NULL CHECK (file_size > 0),
    mime_type   VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    published   BOOLEAN      NOT NULL DEFAULT false,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transparency_reports_published_sort
    ON transparency_reports (published, sort_order ASC, "year" DESC)
    WHERE published = true;

CREATE INDEX idx_transparency_reports_year
    ON transparency_reports ("year" DESC);
