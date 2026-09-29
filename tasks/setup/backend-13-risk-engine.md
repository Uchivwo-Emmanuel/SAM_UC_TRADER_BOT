# Backend 13 — Enforce server-side risk rules

## Scope

Implement position sizing and pre-trade checks for configured loss, position, trade-count, and kill-switch limits.

## Definition of done

Every simulated order is accepted or rejected with a persisted reason; limits cannot be bypassed by a strategy.

## Dependencies

backend-07, backend-02

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.

