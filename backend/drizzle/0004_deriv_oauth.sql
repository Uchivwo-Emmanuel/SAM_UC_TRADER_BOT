-- OAuth access tokens are encrypted by the application before persistence.
-- A one-to-one primary key prevents multiple silent credentials per user.
create table deriv_oauth_credentials (
  user_id text primary key references "user"(id),
  access_token_ciphertext text not null,
  token_expires_at timestamptz not null,
  scopes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
