# Backend 15 — Add paper-trading execution

## Scope

Implement a deterministic paper-execution adapter that consumes approved signals after risk checks.

## Definition of done

It creates order/position records and never calls the live broker endpoint.

## Dependencies

backend-12, backend-13, backend-14

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.

