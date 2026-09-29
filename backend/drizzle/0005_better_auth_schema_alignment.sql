-- Align the existing Better Auth tables with better-auth 1.7.x.
-- All added fields are nullable, so this is safe for existing password sessions.
alter table "session"
  add column if not exists ip_address text,
  add column if not exists user_agent text;

alter table "account"
  add column if not exists access_token text,
  add column if not exists refresh_token text,
  add column if not exists id_token text,
  add column if not exists access_token_expires_at timestamptz,
  add column if not exists refresh_token_expires_at timestamptz,
  add column if not exists scope text;
