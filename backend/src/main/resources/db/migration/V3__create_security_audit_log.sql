-- ENS Medium Level: Security audit log table
-- Stores immutable audit events for compliance and forensic analysis.

CREATE TABLE security_audit_log (
    id              UUID            PRIMARY KEY,
    timestamp       TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id         VARCHAR(36),
    action          VARCHAR(20)     NOT NULL,
    resource_type   VARCHAR(50)     NOT NULL,
    resource_uuid   UUID,
    client_ip       VARCHAR(45)     NOT NULL,
    app_context     VARCHAR(30)     NOT NULL,
    result          VARCHAR(10)     NOT NULL,
    details         TEXT
);

-- Indexes for common audit queries
CREATE INDEX idx_audit_log_user_id ON security_audit_log (user_id);
CREATE INDEX idx_audit_log_resource_uuid ON security_audit_log (resource_uuid);
CREATE INDEX idx_audit_log_timestamp ON security_audit_log (timestamp);
CREATE INDEX idx_audit_log_action ON security_audit_log (action);
CREATE INDEX idx_audit_log_user_timestamp ON security_audit_log (user_id, timestamp DESC);
