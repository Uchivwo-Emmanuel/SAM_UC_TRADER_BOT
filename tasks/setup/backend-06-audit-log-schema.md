# Backend 06 — Create immutable audit events

## Scope

Add schema and write helper for logins, configuration changes, strategy actions, risk events, and trade lifecycle events.

## Definition of done

Events include actor, timestamp, correlation ID, action, and structured metadata; application roles cannot update prior events.

## Dependencies

backend-03

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.

