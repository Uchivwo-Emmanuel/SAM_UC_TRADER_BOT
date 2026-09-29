# Deferred — Deriv demo integration

## Depends on

Demo-only Deriv app ID, API token, and account ID being placed in the backend/VPS secret environment.

## Developer work after receipt

- Verify demo account identity without logging sensitive values.
- Subscribe only to approved instruments.
- Verify reconnect, stale-data pause, duplicate-tick prevention, and audit events.
- Confirm that live trading remains disabled.
