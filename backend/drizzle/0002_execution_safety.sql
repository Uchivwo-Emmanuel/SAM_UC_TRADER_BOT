create table risk_decisions (id uuid primary key default gen_random_uuid(), signal_id uuid references signals(id), accepted boolean not null, reason text not null, created_at timestamptz not null default now());
create index risk_decision_signal_idx on risk_decisions(signal_id);
create table position_protections (id uuid primary key default gen_random_uuid(), position_id uuid not null references positions(id), stop_loss numeric(20,8) not null, take_profit numeric(20,8) not null, trigger_reason text, triggered_at timestamptz);
create index position_protection_position_idx on position_protections(position_id);
create table live_trading_approvals (id uuid primary key default gen_random_uuid(), owner_id text not null references "user"(id), approved_at timestamptz not null default now(), revoked_at timestamptz);
create index live_approval_owner_idx on live_trading_approvals(owner_id);
