CREATE TABLE IF NOT EXISTS eni_metadata (
    id UUID PRIMARY KEY,
    resource_type VARCHAR(30) NOT NULL,
    resource_id UUID NOT NULL,
    metadata_json TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_eni_metadata_resource UNIQUE (resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_eni_metadata_resource
    ON eni_metadata (resource_type, resource_id);
