# Backend 18 — Expose read-only monitoring APIs

## Scope

Create role-protected API endpoints for balances, current positions, orders, strategy status, charts, and reports. Separately create internal, read-only daily-analysis endpoints that return only a validated and sanitized minimum-necessary payload; authenticate the analysis worker with a dedicated service token.

## Definition of done

Viewer access is read-only; pagination, filtering, and error responses are documented and tested. The analysis worker cannot access general dashboard endpoints or the database, and contract tests prove its payload excludes credentials, personal data, and unnecessary records.

## Dependencies

backend-07, backend-05

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.
