# AI 03 — Schedule daily report generation

## Scope

Implement a once-daily Trigger.dev task that calls the protected internal analysis endpoint using its restricted service identity, validates the returned data package, and invokes the configured model. Do not import Drizzle or create database connections in this worker.

## Definition of done

Job is idempotent, uses the configured Nigerian-time schedule, and never runs with the feature flag disabled. Tests confirm the worker can access only the scoped analysis endpoint and that missed reports are retried through Trigger.dev.

## Dependencies

ai-01, ai-02

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.
