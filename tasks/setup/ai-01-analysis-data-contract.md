# AI 01 — Define the analysis input contract

## Scope

Specify the sanitized daily data package returned by protected internal analysis endpoints: trades, outcomes, strategy version, risk events, market context, and known data gaps. Define an explicit endpoint contract, date range, pagination/size limits, and a dedicated analysis-service identity.

## Definition of done

Schema excludes database credentials, broker tokens, Better Auth/session data, personal data, and unrelated records; it identifies every source record and timezone. The AI worker has no PostgreSQL connection configuration.

## Dependencies

backend-06, backend-07

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.
