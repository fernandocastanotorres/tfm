CREATE TABLE IF NOT EXISTS formal_notifications (
    id UUID PRIMARY KEY,
    citizen_id UUID NOT NULL REFERENCES users(id),
    procedure_id UUID NOT NULL REFERENCES procedures(id),
    type_key VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    available_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accessed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    resolution_notes VARCHAR(1000),
    issued_by UUID NOT NULL REFERENCES users(id),
    notify_by_email BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formal_notification_attachments (
    id UUID PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES formal_notifications(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formal_notifications_citizen_created
    ON formal_notifications(citizen_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_formal_notifications_status_expires
    ON formal_notifications(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_formal_notification_attachments_notification
    ON formal_notification_attachments(notification_id);
