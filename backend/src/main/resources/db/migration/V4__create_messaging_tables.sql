-- V4__create_messaging_tables.sql
-- Creates tables for the citizen-admin messaging system.

CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY,
    procedure_id UUID NOT NULL UNIQUE REFERENCES procedures(id),
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count_citizen INTEGER NOT NULL DEFAULT 0,
    unread_count_admin INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES message_threads(id),
    sender_role VARCHAR(20) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    content TEXT NOT NULL,
    template_key VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    attachment_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id),
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_threads_unread_citizen ON message_threads(unread_count_citizen);
CREATE INDEX IF NOT EXISTS idx_threads_unread_admin ON message_threads(unread_count_admin);
