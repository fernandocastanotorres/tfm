-- V13: Add entry/exit numbering and summary document support
-- ==========================================================
-- 1. Creates document_registry_counters table for exit numbering
-- 2. Renames record_number → entry_number on procedures (keeps old column)
-- 3. Adds exit_number, generated, is_system_generated to documents

-- 1. Document registry counters for exit number generation
--    (parallel to procedure_record_counters for entry numbers)
CREATE TABLE IF NOT EXISTS document_registry_counters (
    registry_type VARCHAR(10) NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    last_value BIGINT NOT NULL,
    PRIMARY KEY (registry_type, unit_code, year)
);

-- 2. Rename record_number to entry_number on procedures
--    Add new column, copy data, index; keep old column for backward compat
ALTER TABLE procedures
    ADD COLUMN IF NOT EXISTS entry_number VARCHAR(40);

UPDATE procedures
SET entry_number = record_number
WHERE entry_number IS NULL AND record_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_procedures_entry_number
    ON procedures(entry_number)
    WHERE entry_number IS NOT NULL;

DROP INDEX IF EXISTS uk_procedures_record_number;

-- 3. Add exit numbering and system-generated flags to documents
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS exit_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS generated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_system_generated BOOLEAN NOT NULL DEFAULT FALSE;
