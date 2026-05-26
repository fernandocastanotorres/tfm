-- V14: Add entry_number to documents for tracking registry entry numbers
-- ==========================================================

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS entry_number VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_documents_entry_number
    ON documents(entry_number)
    WHERE entry_number IS NOT NULL;
