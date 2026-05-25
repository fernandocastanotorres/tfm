ALTER TABLE procedure_types
    ADD COLUMN IF NOT EXISTS unit_code VARCHAR(20);

ALTER TABLE procedures
    ADD COLUMN IF NOT EXISTS unit_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS record_number VARCHAR(40);

UPDATE procedure_types
SET unit_code = UPPER(LEFT(REGEXP_REPLACE(COALESCE(unit, ''), '[^A-Za-z0-9]', '', 'g'), 8))
WHERE unit_code IS NULL OR unit_code = '';

UPDATE procedures p
SET unit_code = pt.unit_code
FROM procedure_types pt
WHERE p.procedure_type_id = pt.id
  AND (p.unit_code IS NULL OR p.unit_code = '');

CREATE TABLE IF NOT EXISTS procedure_record_counters (
    unit_code VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    last_value BIGINT NOT NULL,
    PRIMARY KEY (unit_code, year)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_procedures_record_number
    ON procedures(record_number)
    WHERE record_number IS NOT NULL;
