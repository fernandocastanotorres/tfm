CREATE TABLE IF NOT EXISTS procedures (
    id                  UUID            PRIMARY KEY,
    procedure_type_id   UUID            NOT NULL,
    owner_id            UUID            NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    status              VARCHAR(30)     NOT NULL DEFAULT 'DRAFT',
    form_data           TEXT,
    assigned_unit       VARCHAR(100),
    unit_code           VARCHAR(20),
    process_instance_id VARCHAR(100),
    submitted_at        TIMESTAMP WITH TIME ZONE,
    record_number       VARCHAR(40),
    entry_number        VARCHAR(50),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
