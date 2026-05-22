ALTER TABLE procedure_types
    ADD COLUMN IF NOT EXISTS process_key VARCHAR(100);

UPDATE procedure_types
SET process_key = 'simpleCitizenProcedure'
WHERE process_key IS NULL OR process_key = '';

ALTER TABLE procedure_types
    ALTER COLUMN process_key SET NOT NULL;
