SET NON_KEYWORDS year;

CREATE TABLE IF NOT EXISTS procedure_record_counters (
    unit_code VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    last_value BIGINT NOT NULL,
    PRIMARY KEY (unit_code, year)
);

CREATE TABLE IF NOT EXISTS document_registry_counters (
    registry_type VARCHAR(10) NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    last_value BIGINT NOT NULL,
    PRIMARY KEY (registry_type, unit_code, year)
);
