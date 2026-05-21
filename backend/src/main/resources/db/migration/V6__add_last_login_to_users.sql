-- Add last_login column to track user authentication activity.
-- Used by backoffice user management to display "Ultimo acceso".

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
