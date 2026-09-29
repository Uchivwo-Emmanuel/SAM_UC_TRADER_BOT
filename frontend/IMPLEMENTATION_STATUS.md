# Frontend tasks status

| Task | Status | Evidence |
| --- | --- | --- |
| 01 — Vite + React bootstrap | Complete | React, TypeScript, Vite, ESLint, Vitest, and public-only `VITE_*` configuration are present. |
| 02 — Responsive shell | Complete | Desktop sidebar and compact mobile bottom navigation are keyboard-accessible. |
| 03 — Login and session | Blocked by backend identity completion | The Better Auth React client and invite-only email/password sign-in screen are implemented. End-to-end verification needs the two owner accounts and verified backend Better Auth session endpoints. |
| 04 — Role-aware navigation | Complete for the read-only role | Navigation deliberately exposes no execution or strategy-mutation controls. Server-provided role claims will be connected with the backend identity completion. |
| 05 — Dashboard summary | Complete with typed demo adapter | Demo account mode, health, balance, P/L, strategy, risk, loading-safe presentation, and safety status are shown. |
| 06 — Open positions | Complete with typed demo adapter | Read-only position table includes entry, mark, stop-loss, take-profit, and P/L. |
| 07 — Orders and history | Complete with typed demo adapter | Read-only filters for date range, instrument, and outcome are present. |
| 08 — Market watchlist | Complete with typed demo adapter | Approved instruments, freshness status, and stale-state treatment are shown. |
| 09 — Price chart | Complete with typed demo adapter | Keyboard-focusable, labelled observation chart handles the empty state. |
| 10 — Performance chart | Complete with typed demo adapter | Realised P/L trend and metric definitions are provided; a backend equity series will enable drawdown. |

The mocks live behind `src/data.ts`; they are intentionally not a security or broker boundary. Backend APIs must remain the source of all prices, positions, orders, permissions, and account mode.

| Task | Status | Evidence |
| --- | --- | --- |
| 11 — Strategy status | Complete with typed demo adapter | Shows version, provenance, parameters, and non-trading state; no edits are present. |
| 12 — Risk status | Complete with typed demo adapter | Shows safe limits, usage, kill-switch state, and rejection references. |
| 13 — System events | Complete with typed demo adapter | Filtered, read-only user-safe event view; backend integration is deferred in developer task 05. |
| 14 — Realtime client | Frontend complete; backend stream deferred | Cookie-authenticated websocket client has connection, stale, offline, and reconnect states; see developer task 06. |
| 15 — Daily feedback list | Complete with typed demo adapter | Clearly labels mock/descriptive AI reports versus approved strategy changes. |
| 16 — Feedback detail | Complete with typed demo adapter | Structured evidence, limitations, and recommendations sections are plainly labelled AI-generated. |
| 17 — Report downloads | Blocked by secure backend export | The UI never creates a client-side report file; it is disabled until a signed, audited export endpoint exists; see developer task 07. |
| 18 — Accessibility/mobile QA | Local QA complete; staging QA deferred | Semantic tables, labels, focus states, responsive shell, empty/loading/error states are implemented; authenticated staging is deferred in developer task 08. |
| 19 — Security hardening | Local boundary complete; server policy deferred | No secrets in config/adapters, safe sign-in errors, session gate, and no mutation controls. CSP/security headers require developer task 08. |
| 20 — Release checklist | Complete | See `RELEASE_CHECKLIST.md`; staging release remains conditional on developer task 08. |
