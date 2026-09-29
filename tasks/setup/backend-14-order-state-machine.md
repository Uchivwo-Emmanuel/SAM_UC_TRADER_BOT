# Backend 14 — Model the order lifecycle

## Scope

Implement a validated state machine for requested, risk-rejected, submitted, filled, cancelled, failed, and closed order states.

## Definition of done

Illegal transitions are rejected and each valid transition creates an audit event.

## Dependencies

backend-06, backend-07

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.

