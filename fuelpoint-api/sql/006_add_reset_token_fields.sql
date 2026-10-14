-- Migration: Add password reset token fields to the admins table
-- Run this migration against your PostgreSQL database:
--   psql -U postgres -d fuelpoint_db -f sql/006_add_reset_token_fields.sql

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS reset_token_hash  VARCHAR(64),
  ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- Index for fast token lookup during password reset
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON admins (reset_token_hash)
  WHERE reset_token_hash IS NOT NULL;
