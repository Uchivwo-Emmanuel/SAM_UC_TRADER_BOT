# Setup task map

There are 50 deliberately narrow tasks:

- `backend-01` through `backend-20`: protected service, data, broker, strategy, and operations foundations
- `frontend-01` through `frontend-20`: mobile-friendly, read-only monitoring dashboard foundations
- `ai-01` through `ai-10`: scheduled, reviewable analysis and report delivery foundations

Authentication uses Better Auth (the TypeScript library; interpreted from “BetaAuth”) with the existing Drizzle/PostgreSQL stack. The AI worker never receives database access: protected internal endpoints provide it a minimum necessary, sanitized analysis package.

### Important operating principle

Complete demo/paper-trading, audit logging, and risk-control tasks before any consideration of live trading. Strategy changes and all live-trading enablement require human review.
