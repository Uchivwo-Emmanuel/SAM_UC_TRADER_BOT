# Frontend release checklist

## Build and safety

- [x] Only `VITE_*` browser configuration is used.
- [x] No broker, database, AI, Better Auth, or service secret is included in the frontend.
- [x] No trade execution, approval, strategy edit, kill-switch, or order mutation control is present.
- [x] Demo, realtime freshness, and live-disabled states are visibly labelled.
- [x] Typecheck, lint, tests, and production build pass locally.

## Required before staging release

- [ ] Two invite-only owner accounts have passed Better Auth sign-in/sign-out verification.
- [ ] Dashboard read APIs, event redaction, realtime stream, AI report API, and signed export endpoint are integrated.
- [ ] HTTPS, secure cookies, CSP, and reverse-proxy security headers are verified on staging.
- [ ] Keyboard and mobile QA are repeated against authenticated staging data.
- [ ] Rollback artifact/version and deployment owner are recorded.

## Rollback

Deploy the previous known-good static frontend artifact, invalidate the affected CDN/cache entry if one exists, and keep the backend live-trading gate disabled. This frontend must never be used as a trading-control surface.
