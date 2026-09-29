# Backend 17 — Create the live-trading approval gate

## Scope

Implement a multi-step, auditable enablement gate; retain `LIVE_TRADING_ENABLED=false` by default.

## Definition of done

No live submission code path can run without explicit configuration plus human approval record.

## Dependencies

backend-13, backend-14

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.

