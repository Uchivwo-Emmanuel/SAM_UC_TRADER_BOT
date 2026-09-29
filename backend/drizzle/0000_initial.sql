create table "user" (
  "id" text primary key,
  "name" text not null,
  "email" text not null unique,
  "email_verified" timestamptz,
  "image" text,
  "role" text not null default 'viewer',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create table "session" (
  "id" text primary key,
  "user_id" text not null references "user"("id"),
  "token" text not null unique,
  "expires_at" timestamptz not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index "session_user_idx" on "session" ("user_id");
create table "account" (
  "id" text primary key,
  "user_id" text not null references "user"("id"),
  "account_id" text not null,
  "provider_id" text not null,
  "password" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create index "account_user_idx" on "account" ("user_id");
create table "verification" (
  "id" text primary key,
  "identifier" text not null,
  "value" text not null,
  "expires_at" timestamptz not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);
create table instruments (id uuid primary key default gen_random_uuid(), symbol text not null unique, name text not null, enabled text not null default 'true', created_at timestamptz not null default now());
create table strategies (id uuid primary key default gen_random_uuid(), name text not null, status text not null default 'draft', created_at timestamptz not null default now());
create table strategy_versions (id uuid primary key default gen_random_uuid(), strategy_id uuid not null references strategies(id), version text not null, parameters jsonb not null, created_at timestamptz not null default now());
create index strategy_version_strategy_idx on strategy_versions(strategy_id);
create table signals (id uuid primary key default gen_random_uuid(), strategy_version_id uuid not null references strategy_versions(id), instrument_id uuid not null references instruments(id), direction text not null, context jsonb not null, created_at timestamptz not null default now());
create index signal_instrument_created_idx on signals(instrument_id, created_at);
create table orders (id uuid primary key default gen_random_uuid(), signal_id uuid references signals(id), broker_order_id text unique, status text not null, created_at timestamptz not null default now());
create table positions (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id), instrument_id uuid not null references instruments(id), entry_price numeric(20,8), exit_price numeric(20,8), opened_at timestamptz not null, closed_at timestamptz);
create index position_instrument_opened_idx on positions(instrument_id, opened_at);
create table fills (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id), price numeric(20,8) not null, quantity numeric(20,8) not null, created_at timestamptz not null default now());
create index fill_order_idx on fills(order_id);
create table balances (id uuid primary key default gen_random_uuid(), amount numeric(20,8) not null, currency text not null, recorded_at timestamptz not null);
create index balance_recorded_idx on balances(recorded_at);
create table daily_summaries (
  id uuid primary key default gen_random_uuid(),
  strategy_version_id uuid references strategy_versions(id),
  instrument_id uuid references instruments(id),
  trading_date text not null,
  trade_count text not null default '0',
  realized_pnl numeric(20,8) not null default 0,
  win_rate numeric(8,4),
  created_at timestamptz not null default now()
);
create index daily_summary_date_idx on daily_summaries(trading_date);
create table market_observations (id uuid primary key default gen_random_uuid(), instrument_id uuid not null references instruments(id), price numeric(20,8) not null, observed_at timestamptz not null, source_tick_id text);
create index market_observation_instrument_time_idx on market_observations(instrument_id, observed_at);
create table audit_events (id uuid primary key default gen_random_uuid(), actor_id text references "user"(id), correlation_id uuid not null, action text not null, metadata jsonb not null, created_at timestamptz not null default now());
create index audit_action_created_idx on audit_events(action, created_at);
