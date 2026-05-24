CREATE TABLE IF NOT EXISTS document_verifications (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
    csv_code VARCHAR(32) NOT NULL UNIQUE,
    signed_digest VARCHAR(64) NOT NULL,
    signed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_document_verifications_csv_code
    ON document_verifications(csv_code);
