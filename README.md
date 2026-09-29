# AI Trading Bot — planning workspace

This workspace contains only the initial architecture plan and environment-variable templates. It does **not** place trades or contain credentials.

## Planned stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, gRPC, Drizzle ORM
- Data: PostgreSQL on Supabase
- Authentication: Better Auth with its Drizzle/PostgreSQL adapter
- Background jobs: Trigger.dev for scheduled analysis, retries, notifications, and retention
- Broker: Deriv API (start with demo account and paper-trading controls)
- Analysis: OpenAI API, operating on sanitized, structured trading logs

## Structure

- `frontend/` — future responsive monitoring dashboard
- `backend/` — future API, worker, trade-execution, strategy, and reporting services
- `tasks/setup/` — 50 small implementation tasks; complete in numerical order unless a task says otherwise

## Safety baseline

Live trading must remain disabled by default. Build a separate demo/paper environment first, require explicit approval for any live-order capability, enforce risk limits server-side, and never expose broker, database, auth, or AI secrets to the browser. AI analysis produces recommendations and reports only; it must not alter a live strategy or place orders automatically. The AI worker must not connect to PostgreSQL: it receives only a sanitized, scoped daily-analysis payload from protected internal read endpoints.

Trigger.dev runs bounded background jobs (daily/weekly reports, missed-report retries, email alerts, and retention). The continuously running VPS service owns the Deriv websocket, strategy evaluation, risk checks, and trade lifecycle; those must not depend on a scheduled-job platform.

## Getting started later

Copy each `.env.example` to `.env` within its own folder, then supply real values through a secret manager or local environment. Never commit `.env` files.
