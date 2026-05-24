ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS original_storage_path VARCHAR(500),
    ADD COLUMN IF NOT EXISTS signed_storage_path VARCHAR(500),
    ADD COLUMN IF NOT EXISTS original_mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS signed_mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS original_size BIGINT,
    ADD COLUMN IF NOT EXISTS signed_size BIGINT,
    ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;

UPDATE documents
SET original_storage_path = COALESCE(original_storage_path, storage_path),
    original_mime_type = COALESCE(original_mime_type, mime_type),
    original_size = COALESCE(original_size, size)
WHERE original_storage_path IS NULL
   OR original_mime_type IS NULL
   OR original_size IS NULL;
