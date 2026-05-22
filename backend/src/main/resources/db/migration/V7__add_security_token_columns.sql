-- Add security token columns to users table for DB-persisted authentication tokens.
-- Replaces in-memory token stores with database-backed tokens (survive restarts).
--
-- Columns added:
--   verification_token (36)      — UUID for email verification links (separate from OTP)
--   verification_token_expiry    — Expiry for the verification token
--   password_reset_token (36)    — UUID for password reset flows  
--   password_reset_expiry        — Expiry for the reset token
--   refresh_token_hash (64)      — SHA-256 hash of the active refresh token

ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(36);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(36);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
