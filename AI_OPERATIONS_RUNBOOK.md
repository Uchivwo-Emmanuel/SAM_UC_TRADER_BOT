# AI analysis operations runbook

## Safety boundary

The isolated `ai-worker` has no PostgreSQL, broker, Better Auth, or frontend credentials. It calls only `GET /internal/analysis/daily` and `POST /internal/analysis/reports` with the restricted analysis-service token. Keep `ANALYSIS_ENABLED=false` until this token, a backend URL, a model API endpoint/key, and a Trigger.dev project are configured as deployment secrets. AI output is descriptive; it cannot change a strategy, approve a strategy, place an order, or enable live trading.

## Schedule, recovery, and rollback

Trigger.dev runs daily analysis at 01:00 Africa/Lagos and retries failed work up to three times. The database uniqueness constraint on `(report_type, report_date)` makes a retry or manual rerun idempotent. To disable analysis, set `ANALYSIS_ENABLED=false` and redeploy the worker. To rerun a failed day, re-enable it temporarily and invoke the task with that WAT date; never alter an existing report. If a prompt/model regression occurs, disable the feature, record the incident in the audit log, retain held reports, and redeploy the last approved prompt/model version.

## Review, retention, and costs

Only owner-role humans may record `reviewed`, `accepted`, `rejected`, or `needs_discussion`; those decisions are immutable and audit logged. Acceptance does not enable trading. Published Markdown downloads are served only by authenticated backend routes. Retain report content, source-reference IDs, input hashes, model/prompt versions, and audit entries per the organization’s approved retention policy; do not retain raw credentials, sessions, or unredacted audit metadata in AI inputs. Monitor Trigger failures, held reports, model request count/token usage, and backend 401/validation failures. Set provider spending limits and alert on repeated retry failures.
