# Backend 04 — Integrate Better Auth and user roles

## Scope

Configure Better Auth with the Drizzle/PostgreSQL adapter, email/password sign-in for the invite-only team, and user roles for owner, trader, analyst, and viewer. Implement server-side authorization middleware using Better Auth sessions.

## Definition of done

The Better Auth handler is mounted before Express body parsing, a session-backed protected test route permits only authorized roles, and role decisions are audit logged.

## Dependencies

backend-03

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.
